import axios from 'axios';

export async function generateGeminiResponse(
    userText: string, 
    history: any[], 
    apiKey: string,
    systemPrompt: string
): Promise<string> {
    
    // Construct prompt payload for Gemini
    const contents = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
    }));
    
    // Check if systemPrompt is supported in the model endpoint structure, if not, prepend it
    // Gemini 1.5 format allows system_instruction, but for safety with basic REST API we just prepend to the first message if needed.
    const payload = {
        contents: [
            {
                role: 'user',
                parts: [{ text: "SYSTEM INSTRUCTION: " + systemPrompt + "\n\nUser: " + userText }]
            } // Simplified for REST without full history parser for now
        ]
    };

    const resp = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
    );

    return resp.data.candidates[0].content.parts[0].text;
}
