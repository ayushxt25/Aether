const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

async function testProFetch() {
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
        console.log('gemini-pro Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('gemini-pro Failed:', e.message);
    }
}

testProFetch();
