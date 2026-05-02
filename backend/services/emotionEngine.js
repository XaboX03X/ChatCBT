// backend/services/emotionEngine.js

export async function analyzeEmotion(text) {
    console.log("[Emotion Engine] Routing to Local LLM (Phi-3) for Zero-Shot NLP Classification...");

    const systemPrompt = `You are a clinical NLP emotion classification engine. 
    Analyze the user's text and map it to the single most dominant Ekman emotion from this list: 
    [fear, sadness, anger, joy, nervousness, panic, annoyance, disappointment, neutral].
    You must respond ONLY with a valid JSON array containing one object with 'label' and 'score' (between 0.0 and 1.0).
    Example Output: [{"label": "fear", "score": 0.95}]`;

    try {
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'phi3', 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                stream: false,
                format: "json" 
            })
        });

        if (!response.ok) throw new Error("Ollama connection failed");

        const data = await response.json();
        
        let classificationResult = JSON.parse(data.message.content);
        
        // --- THE DATA NORMALIZATION FIX ---
        // If Ollama returns a raw object {} instead of an array [{}], wrap it safely.
        if (!Array.isArray(classificationResult)) {
            classificationResult = [classificationResult];
        }

        // Failsafe: Ensure the structure is perfectly valid before sending to index.js
        if (!classificationResult[0] || !classificationResult[0].label) {
             throw new Error("LLM returned malformed JSON structure.");
        }

        // Standardize capitalization so anxietyMath.js doesn't break
        classificationResult[0].label = classificationResult[0].label.toLowerCase();

        return classificationResult; 

    } catch (error) {
        console.error("[Emotion Engine] Classification Error:", error);
        // Fallback vector so the pipeline never crashes
        return [{ label: 'neutral', score: 1.0 }]; 
    }
}