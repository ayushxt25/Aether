const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

async function testV1Fetch() {
    const body = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        console.log('v1 Fetch Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('v1 Fetch Failed:', e.message);
    }
}

testV1Fetch();
