// local-inference.js (Upgraded to V3 Standards)
import { pipeline, env } from '@huggingface/transformers';

// 1. Force the use of our clean cache folder to prevent silent crashes
env.cacheDir = './.my_ai_cache'; 

async function testLocalAI() {
    console.log("Loading AI Engine... (Downloading model if not cached)");
    
    try {
        // 2. Load the model with the official v3 library and progress bar
        const classifier = await pipeline(
            'text-classification', 
            'onnx-community/emotion-english-distilroberta-base-ONNX', 
            {
                quantized: true,
                progress_callback: (data) => {
                    if (data.status === 'downloading') {
                        process.stdout.write(`\rDownloading ${data.file}: ${Math.round(data.progress)}%`);
                    } else if (data.status === 'done') {
                        console.log(`\n✅ Successfully downloaded: ${data.file}`);
                    }
                }
            }
        );

        const text = "I have my final year project presentation tomorrow and my chest feels incredibly tight.";
        console.log(`\nAnalyzing Text: "${text}"`);
        
        const result = await classifier(text, { top_k: 4 }); 
        
        console.log("\n✅ --- LOCAL AI RESULT ---");
        console.log(result);

    } catch (error) {
        console.error("\n❌ Local AI Failed to Load:", error);
    }
}

testLocalAI();