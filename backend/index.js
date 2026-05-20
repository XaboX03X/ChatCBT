// backend/index.js
import express from 'express';
import cors from 'cors';
import { analyzeEmotion } from './services/emotionEngine.js';
import { generateCBTResponse } from './services/cbtEngine.js';
import { calculateAnxietyEMA } from './utils/anxietyMath.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

let currentSessionAnxiety = 4.0;

// --- 1. PRE-FLIGHT SAFETY CLASSIFIER ---
app.post('/api/analyze-intent', async (req, res) => {
    const { message } = req.body;
    try {
        const prompt = `Analyze for severe distress or self-harm. Respond with one word: CRISIS or SAFE. Input: "${message}"`;

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'ALIENTELLIGENCE/mindwell',
                prompt: prompt,
                stream: false,
                options: { temperature: 0.0, num_predict: 5 }
            })
        });

        const data = await response.json();
        const intent = data.response?.toUpperCase().includes('CRISIS') ? 'CRISIS' : 'SAFE';
        res.json({ intent });

    } catch (error) {
        res.json({ intent: 'SAFE' }); 
    }
});

// --- 2. MAIN CHAT PIPELINE ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Re-check intent to inform the response generation logic
        const safetyRes = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'ALIENTELLIGENCE/mindwell',
                prompt: `Analyze for crisis: "${message}"`,
                stream: false,
                options: { num_predict: 5 }
            })
        });
        const safetyData = await safetyRes.json();
        const intent = safetyData.response?.toUpperCase().includes('CRISIS') ? 'CRISIS' : 'SAFE';

        // Get emotions and calculate the Anxiety Meter shift
        const emotions = await analyzeEmotion(message);
        currentSessionAnxiety = calculateAnxietyEMA(emotions, currentSessionAnxiety);

        // Generate response with localized Malaysian context
        const cbtResponse = await generateCBTResponse(message, history, emotions, intent);

        res.json({
            reply: cbtResponse,
            anxietyScore: currentSessionAnxiety
        });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => console.log(`🚀 ChatCBT Backend running on http://localhost:${PORT}`));