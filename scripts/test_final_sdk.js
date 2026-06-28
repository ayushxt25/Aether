const { GoogleGenAI } = require('@google/genai');

async function testFinal() {
    const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'Respond with "OK"' }] }],
            config: {
                systemInstruction: { role: 'system', parts: [{ text: 'You are a helpful assistant.' }] },
                responseMimeType: 'text/plain',
                temperature: 0.1,
            }
        });
        console.log('Success:', response.text);
    } catch (e) {
        console.error('Failed:', e.message);
    }
}

testFinal().catch(console.error);
