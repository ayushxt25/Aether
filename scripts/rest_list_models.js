const apiKey = 'AIzaSyCTkvIBNNLMQcBQFEKY1TNTj7CvQypCc4Q';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('REST Models:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('List Models Failed:', e.message);
    }
}

listModels();
