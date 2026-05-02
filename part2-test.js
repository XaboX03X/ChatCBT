// part2-test.js
import { pipeline, env } from '@huggingface/transformers';

// Tell the script to look in the folder where we already downloaded the AI
env.cacheDir = './.my_ai_cache'; 

async function runIntegrityTest() {
    console.log("Loading AI Engine from local cache (This should be instant)...");
    
    try {
        const classifier = await pipeline(
            'text-classification', 
            'MicahB/roberta-base-go_emotions', 
            { quantized: true }
        );

        // THE PROVING GROUND: A spectrum of clinical inputs
        const testCases = [
            "I'm having a massive panic attack, my chest hurts and I can't breathe.", 
            "I don't know what to do anymore, everything feels completely hopeless.",
            "I finally finished my FYP chapter, I am so relieved!", 
            "Honestly, today was just a completely normal, boring day." 
        ];

        console.log("\n🧪 STARTING DATA SCIENCE INTEGRITY TEST\n");

        for (const text of testCases) {
            console.log(`📝 Input: "${text}"`);
            
            // We use { top_k: 3 } so it only gives us the top 3 emotions, keeping the terminal clean
            const result = await classifier(text, { top_k: 3 }); 
            
            // Format the output to look like a clean Data Science report
            const formattedScores = result.map(r => `${r.label}: ${(r.score * 100).toFixed(1)}%`).join('  |  ');
            
            console.log(`🧠 Output: [ ${formattedScores} ]`);
            console.log("-".repeat(60));
        }

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

runIntegrityTest();