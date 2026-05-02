// part1-load.js
// Using the NEW official v3 library you found!
import { pipeline, env } from '@huggingface/transformers';

// DATA SCIENCE RIGOR: Explicitly define where the AI brain lives
env.cacheDir = './.my_ai_cache'; 

async function initializeAI() {
    console.log("--------------------------------------------------");
    console.log("Initiating Edge AI Model Download...");
    console.log("Model: Xenova/distilbert-base-uncased-emotion");
    console.log("Library: @huggingface/transformers (v3)");
    console.log("--------------------------------------------------\n");
    
    try {
        // Load the model with our robust progress bar
        const classifier = await pipeline(
            'text-classification', 
            'MicahB/roberta-base-go_emotions', 
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

        console.log("\n🚀 SYSTEM READY: The AI model is fully loaded into local memory.");
        
        // Let's test it using the syntax from the website: { top_k: null } returns all emotions (28)
        const testText = "I am feeling so overwhelmed by this project.";
        console.log(`\nBaseline Test: "${testText}"`);
        
        const result = await classifier(testText, { top_k: null }); 
        
        console.log("\n✅ --- LOCAL AI RESULT ---");
        console.log(result);

    } catch (error) {
        console.error("\n❌ Initialization Failed:", error);
    }
}

initializeAI();