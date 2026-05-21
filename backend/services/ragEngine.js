// backend/services/ragEngine.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.join(__dirname, "../knowledge_base");

// ── Load & chunk all .md files at module import time ──────────────────────────
function loadKnowledgeBase() {
  const files = fs.readdirSync(KB_DIR).filter((f) => f.endsWith(".md"));
  return files.flatMap((file) => {
    const content = fs.readFileSync(path.join(KB_DIR, file), "utf8");
    return content
      .split(/\n(?=## )/)
      .filter((s) => s.trim().length > 100)
      .map((text) => ({ source: file, text: text.trim() }));
  });
}

const knowledgeChunks = loadKnowledgeBase();
console.log(
  `[RAG Engine] ✅ KB loaded: ${knowledgeChunks.length} sections from ${KB_DIR}`,
);

// ── Keyword maps ───────────────────────────────────────────────────────────────
const emotionKeywords = {
  fear: ["anxiety", "fear", "worry", "panic", "тревог", "страх", "беспокой"],
  nervousness: ["anxiety", "fear", "worry", "panic", "тревог", "страх"],
  panic: ["anxiety", "fear", "worry", "panic", "тревог", "страх"],
  sadness: [
    "depression",
    "sad",
    "hopeless",
    "депресс",
    "грусть",
    "безнадеж",
    "поведенческая активация",
  ],
  disappointment: ["depression", "sad", "hopeless", "депресс"],
  anger: ["anger", "frustrat", "гнев", "злост", "раздраж"],
  annoyance: ["anger", "frustrat", "гнев", "раздраж"],
  joy: [
    "gratitude",
    "positive",
    "благодарн",
    "proud",
    "самосострадан",
    "ценност",
  ],
  neutral: [],
};

const topicKeywords = {
  sleep: ["sleep", "insomnia", "awake", "ceiling", "bed", "tired", "lying"],
  breathing: ["breath", "chest", "panic", "hypervent"],
  depression: ["hopeless", "energy", "matters", "worthless", "empty"],
};

// ── Retrieval function ─────────────────────────────────────────────────────────
export function retrieveRelevantChunks(userMessage, emotion, topK = 2) {
  const query = userMessage.toLowerCase();
  const hints = emotionKeywords[emotion] || [];

  const scored = knowledgeChunks.map((chunk) => {
    const text = chunk.text.toLowerCase();
    let score = 0;

    for (const hint of hints) {
      if (text.includes(hint)) score += 2;
    }

    const words = query.split(/\s+/).filter((w) => w.length > 5);
    for (const word of words) {
      if (text.includes(word)) score += 1;
    }

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const userMentionsTopic = keywords.some((k) => query.includes(k));
      const chunkCoversTopic = keywords.some((k) => text.includes(k));
      if (userMentionsTopic && chunkCoversTopic) {
        score += topic === "sleep" ? 4 : 3;
      }
    }

    return { ...chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((c) => c.score > 2)
    .map((c) => c.text.slice(0, 800));
}
