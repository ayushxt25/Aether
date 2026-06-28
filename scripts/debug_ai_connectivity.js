const { GoogleGenAI } = require('@google/genai');

async function debugAI() {
    const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';

    const versions = ['v1', 'v1beta'];

    for (const v of versions) {
        console.log(`\n=== Testing ${v} ===`);
        const ai = new GoogleGenAI({ apiKey, apiVersion: v });

        try {
            console.log(`Listing models for ${v}...`);
            const modelList = await ai.models.list();
            console.log(`Available models in ${v}:`, modelList.models.map(m => m.name).join(', '));

            const testModel = modelList.models.find(m => m.name.includes('gemini-1.5-flash')) || modelList.models[0];
            if (testModel) {
                console.log(`Attempting generation with ${testModel.name} on ${v}...`);
                const res = await ai.models.generateContent({
                    model: testModel.name,
                    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
                });
                console.log(`Success on ${v} with ${testModel.name}:`, res.text);
            }
        } catch (e) {
            console.error(`Failed on ${v}:`, e.message);
        }
    }
}

debugAI().catch(console.error);
