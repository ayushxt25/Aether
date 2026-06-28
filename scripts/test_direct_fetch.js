const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

async function testFetch() {
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
        console.log('Direct Fetch Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch Failed:', e.message);
    }
}

testFetch();
