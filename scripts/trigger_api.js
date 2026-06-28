async function trigger() {
    try {
        const res = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: 'Build a simple login page' })
        });
        const data = await res.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Trigger Failed:', e.message);
    }
}

trigger();
