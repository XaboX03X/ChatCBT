async function sendMessageToBackend(messageText) {
    const backendURL = "http://localhost:5000/api/chat";
    const payload = { 
        sessionId: "student-123", 
        message: messageText 
    };

    const response = await fetch(backendURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    return await response.json();
}

async function runFullCBTProtocol() {
    console.log("=== INITIATING FULL CBT PROTOCOL TEST ===\n");

    console.log("🧑‍🎓 USER (Turn 1): 'I am completely overwhelmed by my FYP deadlines, my chest is so tight.'");
    const response1 = await sendMessageToBackend("I am completely overwhelmed by my FYP deadlines, my chest is so tight.");
    console.log(`🤖 AI THERAPIST: "${response1.cbt_response}"\n`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("🧑‍🎓 USER (Turn 2): 'I am just terrified that if I fail this, I won't graduate and my parents will be furious.'");
    const response2 = await sendMessageToBackend("I am just terrified that if I fail this, I won't graduate and my parents will be furious.");
    console.log(`🤖 AI THERAPIST: "${response2.cbt_response}"\n`);
}

runFullCBTProtocol();