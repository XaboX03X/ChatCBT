// server.js
import express from 'express';
import cors from 'cors';
import { pipeline, env } from '@huggingface/transformers';
import fs from 'fs'; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); 

env.cacheDir = './.my_ai_cache';
const ekmanMapping = JSON.parse(fs.readFileSync('./ekman_mapping.json', 'utf8'));
const cbtDatabase = JSON.parse(fs.readFileSync('./cbt_database.json', 'utf8'));

const activeSessions = {};
let classifier;

function getDominantEkmanEmotion(rawAnalysis) {
    const emotionsArray = Array.isArray(rawAnalysis[0]) ? rawAnalysis[0] : rawAnalysis;

    const ekmanScores = {
        anger: 0, disgust: 0, fear: 0, joy: 0, sadness: 0, surprise: 0, neutral: 0
    };

    for (const { label, score } of emotionsArray) {
        if (label === 'neutral') {
            ekmanScores.neutral += score;
            continue;
        }

        for (const [ekmanCategory, goEmotionsList] of Object.entries(ekmanMapping)) {
            if (goEmotionsList.includes(label)) {
                ekmanScores[ekmanCategory] += score;
                break; 
            }
        }
    }

    let dominantEmotion = "neutral";
    let maxScore = -1;

    for (const [category, score] of Object.entries(ekmanScores)) {
        if (score > maxScore) {
            maxScore = score;
            dominantEmotion = category;
        }
    }

    return dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1);
}

app.get('/', (req, res) => {
    res.status(200).json({ status: "Online", message: "CBT Chatbot Backend is running." });
});

// --- NEW PRE-FLIGHT CLASSIFIER ENDPOINT ---
app.post('/api/analyze-intent', async (req, res) => {
    const { message } = req.body;
    try {
        const prompt = `You are a clinical safety classifier. Analyze the user's input for severe psychological distress, self-harm, or suicidal ideation.
If the input contains severe distress or risk, respond with exactly one word: CRISIS.
If the input is standard negative emotion, anxiety, or general chat, respond with exactly one word: SAFE.
Do not provide any explanation.

User Input: "${message}"`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'ALIENTELLIGENCE/mindwell', 
                prompt: prompt,
                stream: false,
                options: { temperature: 0.0, num_predict: 3 }
            })
        });

        const data = await response.json();
        const output = data.response ? data.response.trim().toUpperCase() : 'SAFE';
        const intent = output.includes('CRISIS') ? 'CRISIS' : 'SAFE';
        
        console.log(`\n[0] Pre-Flight Intent Checked: ${intent}`);
        res.json({ intent });

    } catch (error) {
        console.error("Intent Pipeline Error:", error);
        res.json({ intent: 'SAFE' });
    }
});

// --- EXISTING CHAT ENDPOINT ---
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "No message provided." });
        }

        console.log(`\n📩 Received message: "${userMessage}"`);

        // --- PART A: THE EARS (Emotion Classification) ---
        const analysis = await classifier(userMessage, { top_k: null });
        const coreEmotion = getDominantEkmanEmotion(analysis);
        
        console.log(`🧠 AI Analysis (Raw):`, analysis);
        console.log(`🌉 Ekman Bridge Output:`, coreEmotion);

        // --- PART B: THE MOUTH (Hybrid CBT Engine) ---
        console.log(`🤖 Engaging Hybrid CBT Engine...`);
        
        const sessionId = req.body.sessionId || 'student-123';
        
        if (!activeSessions[sessionId]) {
            activeSessions[sessionId] = { turn: 1 };
        } else {
            activeSessions[sessionId].turn += 1;
        }

        const currentTurn = activeSessions[sessionId].turn;
        console.log(`⏱️ Session Tracker: User is on Turn ${currentTurn}`);

        let clinicalInstruction = "";
        if (currentTurn === 1) {
            clinicalInstruction = cbtDatabase[coreEmotion].assessment;
            console.log(`📋 State: ASSESSMENT -> Pulled protocol for ${coreEmotion}`);
        } else {
            clinicalInstruction = cbtDatabase[coreEmotion].intervention;
            console.log(`💊 State: INTERVENTION -> Pulled protocol for ${coreEmotion}`);
        }

        const systemPrompt = `You are a professional CBT therapist. The user says: "${userMessage}". Their detected core emotion is '${coreEmotion}'. 
        
        CLINICAL INSTRUCTION: ${clinicalInstruction}
        
        Follow the clinical instruction exactly. Keep your response empathetic, natural, and strictly under 3 sentences.`;

        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'ALIENTELLIGENCE/mindwell',
                prompt: systemPrompt,
                stream: false
            })
        });

        if (!ollamaResponse.ok) {
            throw new Error(`Ollama API responded with status: ${ollamaResponse.status}`);
        }

        const ollamaData = await ollamaResponse.json();
        const cbtResponse = ollamaData.response;
        
        console.log(`✅ CBT Response Generated Successfully.`);
        console.log(`💬 AI Therapist: "${cbtResponse}"\n`); 

        res.status(200).json({
            success: true,
            originalMessage: userMessage,
            core_emotion: coreEmotion, 
            cbt_response: cbtResponse, 
            emotions: analysis
        });

    } catch (error) {
        console.error("AI Processing Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function startServer() {
    console.log("Loading AI Engine into server memory...");
    try {
        classifier = await pipeline('text-classification', 'MicahB/roberta-base-go_emotions', { quantized: true });
        console.log("✅ AI Engine Loaded Successfully.");
        
        app.listen(PORT, () => {
            console.log(`🟢 Express Server initialized on http://localhost:${PORT}`);
            console.log("Waiting for incoming chat messages...");
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
    }
}

startServer();