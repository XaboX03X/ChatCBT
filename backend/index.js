// backend/index.js
import express from 'express';
import cors from 'cors';
import { analyzeEmotion } from './services/emotionEngine.js';
import { generateCBTResponse } from './services/cbtEngine.js';
import { calculateAnxietyEMA } from './utils/anxietyMath.js';

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

let currentSessionAnxiety = 4.0;

// --- NEW PRE-FLIGHT CLASSIFIER ENDPOINT ---
app.post('/api/analyze-intent', async (req, res) => {
    const { message } = req.body;
    try {
        const prompt = `You are a clinical safety classifier. Analyze the user's input for severe psychological distress, self-harm, or suicidal ideation.
If the input contains severe distress or risk, respond with exactly one word: CRISIS.
If the input is standard negative emotion, anxiety, or general chat, respond with exactly one word: SAFE.
Do not provide any explanation.

User Input: "${message}"`;

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'phi3', // Use Phi-3 for blazing-fast token inference
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.0, // Strict, deterministic output
                    num_predict: 3    // Stop generating immediately to maximize speed
                }
            })
        });

        const data = await response.json();
        const output = data.response ? data.response.trim().toUpperCase() : 'SAFE';
        
        const intent = output.includes('CRISIS') ? 'CRISIS' : 'SAFE';
        console.log(`\n[0] Pre-Flight Intent Checked: ${intent}`);
        
        res.json({ intent });

    } catch (error) {
        console.error("Intent Pipeline Error:", error);
        res.json({ intent: 'SAFE' }); // Graceful degradation
    }
});

// --- EXISTING CHAT ENDPOINT ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        console.log(`[1] Received message: "${message}"`);

        console.log(`[2] Routing to ONNX Emotion Classifier...`);
        const emotions = await analyzeEmotion(message);
        console.log(`    Detected: ${emotions[0].label} (${(emotions[0].score * 100).toFixed(1)}%)`);

        console.log(`[3] Calculating Anxiety Shift...`);
        currentSessionAnxiety = calculateAnxietyEMA(emotions, currentSessionAnxiety);
        console.log(`    New Anxiety Score: ${currentSessionAnxiety}`);

        console.log(`[4] Routing to Ollama (Phi-3)...`);
        const cbtResponse = await generateCBTResponse(message, history, emotions);

        console.log(`[5] Pipeline complete. Sending to UI.`);
        res.json({
            reply: cbtResponse,
            anxietyScore: currentSessionAnxiety
        });

    } catch (error) {
        console.error("Orchestrator Pipeline Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ChatCBT Orchestrator running on http://localhost:${PORT}`);
    analyzeEmotion("system boot"); // Warm up the ONNX classifier
});