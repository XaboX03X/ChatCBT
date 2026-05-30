// backend/services/cbtEngine.js

import { determineRoute } from '../utils/semanticRouter.js';
import { crisisProtocol } from '../prompts/crisisProtocol.js';
import { empathyBuilder } from '../prompts/empathyBuilder.js';
import { socraticReframe } from '../prompts/socraticReframe.js';
import { sessionClosure } from '../prompts/sessionClosure.js';

export async function generateCBTResponse(userMessage, chatHistory, emotionContext, anxietyScore) {
    const primaryEmotion = emotionContext[0]?.label || 'neutral';
    
    // 1. Calculate Conversation Depth
    const turnCount = Math.floor(chatHistory.length / 2); 

    // 2. AWAIT the AI-driven semantic triage decision
    const route = await determineRoute(userMessage, anxietyScore, turnCount);

    // 3. HARD BYPASS FOR CRISIS (Zero Latency generation)
    if (route === 'CRISIS') {
        return {
            reply: crisisProtocol, 
            triggerToolkitGlow: false // No toolkit needed in a severe crisis, just human help
        };
    }

    // 4. DYNAMIC SYSTEM ROLE ASSIGNMENT
    let systemRole = '';
    switch(route) {
        case 'EMPATHY':
            systemRole = empathyBuilder(primaryEmotion);
            break;
        case 'SOCRATIC':
            systemRole = socraticReframe(primaryEmotion);
            break;
        case 'CLOSURE':
            systemRole = sessionClosure(primaryEmotion);
            break;
        default:
            systemRole = socraticReframe(primaryEmotion);
    }

    const messages = [
        { role: "system", content: systemRole },
        ...chatHistory, 
        { role: "user", content: userMessage }
    ];

    try {
        // 5. CORE INFERENCE FETCH
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'ALIENTELLIGENCE/mindwell', 
                messages: messages,
                stream: false 
            })
        });

        const data = await response.json();
        let aiContent = data.message.content;

        // 6. THE REGIONAL FAILSAFE (Nuke any US numbers if the AI hallucinates them)
        const MY_HOTLINES = "Befrienders KL: 03-7627 2929, Talian Kasih: 15999, or Emergency Services: 999";
        if (aiContent.includes("988") || aiContent.includes("1-800")) {
            aiContent = `It sounds like you're going through a lot. Please contact local Malaysian support at ${MY_HOTLINES}.`;
        }

        // 7. THE ACTION-FLAG PARSER (Fulfilling the Counselor's UI Requirement)
        let triggerGlow = false;
        
        // Extract the hidden UI hook
        if (aiContent.includes('[SHOW_TOOLKIT_GLOW]')) {
            triggerGlow = true;
            // Erase the raw tag so the frontend chat bubble remains perfectly clean
            aiContent = aiContent.replace('[SHOW_TOOLKIT_GLOW]', '').trim();
        }

        // 8. RETURN FINAL STRUCTURED PAYLOAD
        return {
            reply: aiContent,
            triggerToolkitGlow: triggerGlow
        };

    } catch (error) {
        console.error("CBT Engine Generation Error:", error);
        return {
            reply: `I'm here for you. If you're in distress, please contact Befrienders KL at 03-7627 2929.`,
            triggerToolkitGlow: false
        };
    }
}