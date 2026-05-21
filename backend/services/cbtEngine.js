// backend/services/cbtEngine.js
import { retrieveRelevantChunks } from "./ragEngine.js";

export async function generateCBTResponse(
  userMessage,
  chatHistory,
  emotionContext,
  intent = "SAFE",
) {
  const primaryEmotion = emotionContext[0]?.label || "neutral";

  // 1. MANDATORY MALAYSIAN DATA
  const MY_HOTLINES =
    "Befrienders KL: 03-7627 2929, Talian Kasih: 15999, or Emergency Services: 999";

  // 2. IF CRISIS, DO NOT TRUST THE AI TO GENERATE - USE A TEMPLATE
  if (intent === "CRISIS") {
    return `I'm here with you, but I'm very concerned about your safety. Please reach out to a professional who can help right now: ${MY_HOTLINES}. You don't have to go through this alone.`;
  }

  // ── RAG retrieval ────────────────────────────────────────────────────────────
  const ragChunks = retrieveRelevantChunks(userMessage, primaryEmotion);
  const ragContext =
    ragChunks.length > 0 ? ragChunks.join("\n\n---\n\n") : null;

  console.log(
    `[Pipeline] Emotion: '${primaryEmotion}' (${(emotionContext[0]?.score * 100).toFixed(1)}%) | RAG chunks retrieved: ${ragChunks.length}`,
  );

  // 3. STANDARD FLOW (For non-crisis messages)
  const systemRole = `You are ChatCBT, an empathetic AI specializing in Cognitive Behavioral Therapy. 
    Current Emotion: ${primaryEmotion}.
    Instructions:
    - Keep responses brief (max 3 sentences).
    - If you mention a hotline, you MUST ONLY use: ${MY_HOTLINES}.
    - Do NOT mention US-based services or 988.
    - Only mention hotlines if the user expresses explicit thoughts of self-harm. Do NOT mention hotlines for general stress, anxiety, or emotional distress.
    ${ragContext ? `\nSUPPORTING CLINICAL KNOWLEDGE:\n${ragContext}\n\nUse this knowledge to inform your response naturally — do not quote it directly.` : ""}`;

  const messages = [
    { role: "system", content: systemRole },
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "ALIENTELLIGENCE/mindwell",
        messages: messages,
        stream: false,
      }),
    });

    const data = await response.json();
    let aiContent = data.message.content;

    // 4. THE FAILSAFE (Nuke any US numbers if the AI hallucinations them anyway)
    if (aiContent.includes("988") || aiContent.includes("1-800")) {
      return `It sounds like you're going through a lot. Please contact local Malaysian support at ${MY_HOTLINES}. Can we focus on a small grounding exercise together?`;
    }

    return aiContent;
  } catch (error) {
    return `I'm here for you. If you're in distress, please contact Befrienders KL at 03-7627 2929.`;
  }
}
