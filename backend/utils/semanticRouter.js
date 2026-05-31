// backend/utils/semanticRouter.js

export async function determineRoute(userMessage, anxietyScore, turnCount) {
    // 1. The Zero-Shot Semantic Classification Prompt
    const classificationPrompt = `
    Analyze the user's message and classify it into exactly ONE of these four categories. 
    Respond with only the single category word. Do not include punctuation, explanations, or extra text.

    CATEGORIES:
    - CRISIS: Mentions or hints of self-harm, suicide, severe hopelesness, implicit or explicit intent to end life.
    - CLOSURE: Expresses gratitude, feeling better, winding down, or saying goodbye (e.g., "thanks", "bye", "I feel okay now").
    - EMPATHY: High distress, venting, intense anxiety, panic, or raw emotional pain.
    - SOCRATIC: Neutral or stable reflection, discussing everyday thoughts, or answering questions calmly.

    User Input: "${userMessage}"
    Classification:`;

    try {
        // 2. Fetch to the local AI model for instantaneous intent routing
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'ALIENTELLIGENCE/mindwell',
                prompt: classificationPrompt,
                stream: false,
                options: { 
                    temperature: 0.0, // Force absolute determinism
                    num_predict: 5    // Clamp generation length for zero-latency execution
                }
            })
        });

        const data = await response.json();
        const aiVerdict = data.response?.trim().toUpperCase() || '';

        // 3. Evaluate AI Semantic Verdict (NO MORE MATH GATEKEEPING)
        if (aiVerdict.includes('CRISIS')) return 'CRISIS';
        if (aiVerdict.includes('CLOSURE')) return 'CLOSURE'; 
        if (aiVerdict.includes('EMPATHY')) return 'EMPATHY';
        if (aiVerdict.includes('SOCRATIC')) return 'SOCRATIC';

        // 4. Clean Fallback Layer (If the AI outputs gibberish, default to Socratic reflection)
        return 'SOCRATIC';

    } catch (error) {
        // 5. Safe structural fallback if the local inference endpoint is jammed
        console.error("Semantic Router Error:", error);
        return 'SOCRATIC'; 
    }
}