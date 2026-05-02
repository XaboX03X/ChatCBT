// backend/services/cbtEngine.js

export async function generateCBTResponse(userMessage, chatHistory, emotionContext) {
    const primaryEmotion = emotionContext[0]?.label || 'neutral';
    
    const systemPrompt = {
        role: "system",
        content: `You are ChatCBT, an empathetic cognitive behavioral therapy assistant. 
        The classification engine has detected the user is currently experiencing: ${primaryEmotion}. 
        Acknowledge their feelings subtly and provide a clinically safe, grounding CBT response.`
    };

    const messages = [systemPrompt, ...chatHistory, { role: "user", content: userMessage }];

    try {
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'phi3', 
                messages: messages,
                stream: false 
            })
        });

        if (!response.ok) throw new Error("Ollama connection failed");

        const data = await response.json();
        return data.message.content;

    } catch (error) {
        console.error("Generative Engine Error:", error);
        return "I am experiencing a slight system delay, but I am here with you. Could you tell me a bit more about what you are feeling?";
    }
}