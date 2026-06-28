const { GoogleGenAI } = require('@google/genai');

async function listModels() {
    const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';

    const aiV1 = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
    console.log('--- Testing v1 with gemini-1.5-flash ---');
    try {
        const res = await aiV1.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
        });
        console.log('v1 basic success');
    } catch (e) {
        console.error('v1 basic failed:', e.message);
    }

    const aiV1Beta = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
    console.log('--- Testing v1beta with gemini-1.5-flash ---');
    try {
        const res = await aiV1Beta.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
        });
        console.log('v1beta basic success');
    } catch (e) {
        console.error('v1beta basic failed:', e.message);
    }
}

listModels().catch(console.error);
