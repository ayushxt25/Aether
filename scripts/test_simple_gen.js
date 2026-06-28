const { GoogleGenAI } = require('@google/genai');

async function testGen() {
    const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q'; // From .env.local
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });
        console.log('V1BETA Success:', response.text);
    } catch (e) {
        console.error('V1BETA Failed:', e.message);
    }
}

testGen().catch(console.error);
