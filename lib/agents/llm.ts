import { GoogleGenAI } from '@google/genai';

export async function callLLM(prompt: string, systemPrompt: string, jsonMode: boolean = false) {
    const AI_API_KEY = process.env.AI_API_KEY;

    // If no real key is provided, use Mock Mode
    if (!AI_API_KEY) {
        console.warn('Using Mock LLM Mode. Set AI_API_KEY for real responses.');
        await new Promise(r => setTimeout(r, 1000)); // Simulate latency

        if (jsonMode) {
            const q = prompt.toLowerCase();
            let layout: any = { type: 'root', children: [] };
            let components: string[] = ['Navbar', 'Card'];
            let reasoning = "API Key missing. Simulated response based on intent.";

            if (q.includes('flipkart') || q.includes('amazon') || q.includes('shop') || q.includes('ecommerce')) {
                layout.children = [
                    { type: 'Navbar', props: { title: 'AI Commerce Pro' } },
                    {
                        type: 'Grid', props: { columns: 1 }, children: [
                            { type: 'SearchInput', props: { placeholder: 'Search products...', value: '' } }
                        ]
                    },
                    {
                        type: 'Tabs', props: { tabs: [{ label: 'All Products', id: 'all' }, { label: 'Electronics', id: 'electronics' }] }, children: `(activeId) => {
            const { addNotification } = useAppState();
            const { data, loading, fetchItems } = useDataFetch(MOCK_DATA.products);
            React.useEffect(() => { fetchItems(activeId === 'all' ? undefined : (p) => p.category === 'Electronics'); }, [activeId]);
            
            if (loading) return <LoadingSpinner />;
            return (
              <Grid columns={3}>
                {data.map(p => (
                  <Card key={p.id} title={p.name}>
                    <p>{p.brand} - {p.price}</p>
                    <Button label="Buy Now" variant="primary" onClick={() => addNotification('Thanks for shopping!')} />
                  </Card>
                ))}
              </Grid>
            );
          }`
                    }
                ];
                components = ['Navbar', 'Card', 'Button', 'Tabs', 'Grid', 'LoadingSpinner', 'SearchInput'];
                reasoning = "Integrated 'useDataFetch' and 'LoadingSpinner' to simulate a real-world shopping experience with async product loading and filtering.";
            } else {
                layout.children = [
                    { type: 'Navbar', props: { title: 'AI UI Architect' } },
                    {
                        type: 'Grid', props: { columns: 2 }, children: [
                            { type: 'Card', props: { title: 'Analytics' }, children: [{ type: 'Chart', props: { type: 'line', data: null } }] },
                            { type: 'Card', props: { title: 'System Status' }, children: [{ type: 'Table', props: { headers: ['ID', 'Task'], rows: [['#1', 'Build UI'], ['#2', 'Deploy']] } }] }
                        ]
                    }
                ];
                components = ['Navbar', 'Card', 'Chart', 'Table', 'Grid'];
            }

            return JSON.stringify({
                layout,
                components_used: components,
                reasoning,
                constraint_notice: 'Offline Mock Mode Active'
            });
        }

        if (systemPrompt.includes('Explainer')) {
            return "I have synthesized a multi-panel layout utilizing our whitelisted components. The structure prioritizes hierarchical navigation and clear data visualization.";
        }

        // Generator Mock: Build a functional component string from the plan
        try {
            const planMatch = prompt.match(/STRUCTURED PLAN: (.*)/);
            if (planMatch) {
                const plan = JSON.parse(planMatch[1]);
                const renderNode = (node: any): string => {
                    if (typeof node === 'string') {
                        // If it's a function or JS expression, don't quote it in the final JSX
                        if (node.trim().startsWith('(') || node.trim().startsWith('{')) return node;
                        return `"${node}"`;
                    }
                    if (!node || !node.type) return '';

                    const nodeType = node.type === 'root' ? 'div' : node.type;
                    const props = Object.entries(node.props || {}).map(([k, v]) => {
                        if (typeof v === 'string' && (v.trim().startsWith('(') || v.trim().startsWith('()'))) {
                            return `${k}={${v}}`;
                        }
                        return `${k}={${JSON.stringify(v)}}`;
                    }).join(' ');
                    const children = node.children
                        ? (Array.isArray(node.children) ? node.children.map((c: any) => renderNode(c)).join('') : renderNode(node.children))
                        : '';

                    if (node.type === 'root') {
                        return `<div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0px' }}>\n${children}\n</div>`;
                    }

                    // Support unquoted functional children for render-prop components like Tabs
                    const isFunctional = typeof node.children === 'string' && (node.children.trim().startsWith('(') || node.children.trim().startsWith('{'));
                    const processedChildren = isFunctional ? `{${node.children}}` : (children.startsWith('"') ? children.slice(1, -1) : children);

                    return `<${nodeType} ${props}>${processedChildren}</${nodeType}>`;
                };
                const generatedCode = renderNode(plan.layout);
                return `() => {
  return (
    ${generatedCode}
  );
}`;
            }
        } catch (e) {
            console.error('Mock Generator failed:', e);
        }
        return "() => <div>Failed to generate mock code. Check logs.</div>";
    }

    let retries = 0;
    const maxRetries = 3;
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-exp'];

    while (retries < maxRetries) {
        const modelToUse = models[retries % models.length];
        try {
            const ai = new GoogleGenAI({ apiKey: AI_API_KEY, apiVersion: 'v1beta' });
            const response = await ai.models.generateContent({
                model: modelToUse,
                contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
            });

            return response.text || '';

        } catch (error: any) {
            const isQuotaError = error.message?.includes('429') || error.message?.includes('Quota');

            if (isQuotaError && retries < maxRetries - 1) {
                const waitTime = Math.pow(2, retries) * 3000 + (Math.random() * 1000);
                console.warn(`[LLM] Quota exceeded on ${models[retries % models.length]}. Retrying with ${models[(retries + 1) % models.length]} in ${Math.round(waitTime)}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
                retries++;
                continue;
            }

            console.error('Core AI Call Failed:', error);
            throw new Error('Failed to reach AI service: ' + error.message);
        }
    }
    return '';
}
