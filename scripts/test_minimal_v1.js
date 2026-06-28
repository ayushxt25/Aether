const { GoogleGenAI } = require('@google/genai');

async function testMinimal() {
    const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
        });
        console.log('Success:', response.text);
    } catch (e) {
        console.error('Failed:', e.message);
    }
}

testMinimal().catch(console.error);
