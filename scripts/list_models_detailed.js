const { GoogleGenAI } = require('@google/genai');

async function listModels() {
    const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

    try {
        const models = await ai.models.list();
        console.log('--- V1BETA MODELS ---');
        models.models.forEach(m => console.log(m.name));
    } catch (e) {
        console.error('Failed to list models:', e.message);
    }
}

listModels().catch(console.error);
