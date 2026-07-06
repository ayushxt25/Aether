import { GoogleGenAI } from '@google/genai';

export async function callLLM(prompt: string, systemPrompt: string, jsonMode: boolean = false): Promise<string> {
    const AI_API_KEY = process.env.AI_API_KEY;

    // If no real key is provided, use Mock Mode
    if (!AI_API_KEY || (global as any).useMockMode) {
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
                const imports = plan.components_used && plan.components_used.length > 0
                    ? `import { ${Array.from(new Set(plan.components_used)).join(', ')} } from '@/components/ui';\n\n`
                    : '';
                return `${imports}() => {
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

    const callOpenRouter = async (): Promise<string | null> => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';

    if (!OPENROUTER_API_KEY) {
        return null;
    }

    try {
        console.warn(`[LLM] Trying OpenRouter fallback with ${OPENROUTER_MODEL}...`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Aether AI UI Generator',
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.4,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[LLM] OpenRouter fallback failed:', data);
            return null;
        }

        return data?.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error('[LLM] OpenRouter fallback error:', error);
        return null;
    }
};

let retries = 0;
const models = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
];
const maxRetries = models.length;

let lastErrorMessage = '';

while (retries < maxRetries) {
    const modelToUse = models[retries];

    try {
        const ai = new GoogleGenAI({ apiKey: AI_API_KEY, apiVersion: 'v1beta' });
        const response = await ai.models.generateContent({
            model: modelToUse,
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
        });

        return response.text || '';
    } catch (error: any) {
        const errorMessage = error.message || '';
        lastErrorMessage = errorMessage;

        const isQuotaError =
            errorMessage.includes('429') ||
            errorMessage.toLowerCase().includes('quota') ||
            errorMessage.includes('RESOURCE_EXHAUSTED');

        const isAuthError =
            errorMessage.toLowerCase().includes('key') ||
            errorMessage.includes('401') ||
            errorMessage.includes('403') ||
            errorMessage.toLowerCase().includes('leaked') ||
            errorMessage.includes('PERMISSION_DENIED');

        const isModelError =
            errorMessage.includes('404') ||
            errorMessage.toLowerCase().includes('model') ||
            errorMessage.toLowerCase().includes('not found');

        if (isAuthError) {
            console.warn('[LLM] Gemini API key invalid, leaked, or unauthorized.');
            break;
        }

        if ((isModelError || isQuotaError) && retries < maxRetries - 1) {
            console.warn(`[LLM] Gemini model ${modelToUse} failed. Trying ${models[retries + 1]}...`);
            retries++;
            continue;
        }

        console.warn('[LLM] Gemini unavailable. Trying OpenRouter fallback...');
        break;
    }
}

const openRouterResponse = await callOpenRouter();

if (openRouterResponse) {
    return openRouterResponse;
}

console.warn('[LLM] All AI providers failed. Falling back to Mock Mode.');
if (lastErrorMessage) {
    console.warn('[LLM] Last provider error:', lastErrorMessage);
}

(global as any).useMockMode = true;
return callLLM(prompt, systemPrompt, jsonMode);
}
