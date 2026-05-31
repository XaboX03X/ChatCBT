// backend/index.js
import express from 'express';
import cors from 'cors';
import { analyzeEmotion } from './services/emotionEngine.js';
import { generateCBTResponse } from './services/cbtEngine.js';
import { calculateAnxietyEMA } from './utils/emotionMath.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

let currentSessionAnxiety = 4.0;

// --- 1. PRE-FLIGHT SAFETY CLASSIFIER ---
// Note: We leave this endpoint intact just in case your frontend uses it for 
// any isolated UI checks, but the main chat pipeline no longer relies on it.
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
        
        // Step 1: Get emotions and calculate the Anxiety Meter shift
        const emotions = await analyzeEmotion(message);
        currentSessionAnxiety = calculateAnxietyEMA(emotions, currentSessionAnxiety);

        // Step 2: Generate response using the new Modular Pipeline
        // Notice we pass `currentSessionAnxiety` instead of the slow LLM `intent`.
        // The Semantic Router inside cbtEngine now handles crisis bypassing instantly!
        const aiResponse = await generateCBTResponse(message, history, emotions, currentSessionAnxiety);

        // Step 3: Return the structured JSON payload to React
        res.json({
            success: true,
            reply: aiResponse.reply,
            triggerToolkitGlow: aiResponse.triggerToolkitGlow,
            anxietyScore: currentSessionAnxiety,
            detectedEmotion: emotions[0]?.label || 'neutral'
        });

    } catch (error) {
        console.error("Chat Pipeline Error:", error);
        // Fallback structured JSON to prevent frontend crashes
        res.status(500).json({ 
            success: false,
            reply: "I'm here for you. If you're in distress, please contact Befrienders KL at 03-7627 2929.",
            triggerToolkitGlow: false,
            anxietyScore: currentSessionAnxiety
        });
    }
});

app.listen(PORT, () => console.log(`🚀 ChatCBT Backend running on http://localhost:${PORT}`));