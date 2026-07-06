import { callLLM } from './llm';
import { EDITOR_PROMPT } from '../prompts';
import { validatePlan } from '../validation/planValidator';
import { UIPlan } from '@/types/plan';
import { extractJsonFromLLMResponse } from './responseUtils';

function parseEditorResponse(response: string): unknown {
    const cleanedResponse = extractJsonFromLLMResponse(response);
    return JSON.parse(cleanedResponse);
}

function collectComponentsFromLayout(node: any, components = new Set<string>()): string[] {
    if (!node || typeof node !== 'object') {
        return Array.from(components);
    }

    if (typeof node.type === 'string' && node.type !== 'root') {
        components.add(node.type);
    }

    if (Array.isArray(node.children)) {
        node.children.forEach((child: any) => collectComponentsFromLayout(child, components));
    }

    return Array.from(components);
}

function normalizeEditedPlan(rawPlan: any, existingPlan: UIPlan, intent: string): unknown {
    const layout = rawPlan?.layout || rawPlan;

    return {
        layout,
        components_used: Array.isArray(rawPlan?.components_used)
            ? rawPlan.components_used
            : collectComponentsFromLayout(layout),
        reasoning: typeof rawPlan?.reasoning === 'string'
            ? rawPlan.reasoning
            : `Updated the existing interface based on the user request: ${intent}`,
        constraint_notice: typeof rawPlan?.constraint_notice === 'string'
            ? rawPlan.constraint_notice
            : existingPlan.constraint_notice || ''
    };
}

async function repairEditorJson(rawResponse: string, intent: string, existingPlan: UIPlan): Promise<unknown> {
    const repairPrompt = `
The previous editor response was invalid or incomplete.

USER INTENT:
${intent}

EXISTING PLAN:
${JSON.stringify(existingPlan)}

INVALID RESPONSE:
${rawResponse}

Return ONLY one valid JSON object matching this exact structure:
{
  "layout": {
    "type": "root",
    "props": {},
    "children": []
  },
  "components_used": [],
  "reasoning": "short explanation",
  "constraint_notice": ""
}

Rules:
- Do not use markdown.
- Do not wrap the response in code fences.
- Do not include explanation outside JSON.
- Return the complete updated plan, not only a partial layout.
- components_used must be an array of component names used in the layout.
- reasoning must be a string.
`;

    const repairedResponse = await callLLM(repairPrompt, EDITOR_PROMPT, true);
    if (!repairedResponse) {
        throw new Error('Editor JSON repair returned empty response');
    }

    return parseEditorResponse(repairedResponse);
}

export async function runEditor(intent: string, existingPlan: UIPlan): Promise<UIPlan> {
    const prompt = `
USER INTENT: ${intent}
EXISTING PLAN: ${JSON.stringify(existingPlan)}

Return ONLY the complete updated UI plan as valid JSON.
Do not use markdown.
Do not wrap the response in code fences.
Do not include explanations outside JSON.

Required JSON structure:
{
  "layout": {
    "type": "root",
    "props": {},
    "children": []
  },
  "components_used": [],
  "reasoning": "short explanation",
  "constraint_notice": ""
}
`;

    const response = await callLLM(prompt, EDITOR_PROMPT, true);
    if (!response) throw new Error('Editor returned empty response');

    let newPlan: unknown;

    try {
        const parsedPlan = parseEditorResponse(response);
        newPlan = normalizeEditedPlan(parsedPlan, existingPlan, intent);
    } catch {
        console.error('[Editor] First response was invalid JSON:', response);

        try {
            const repairedPlan = await repairEditorJson(response, intent, existingPlan);
            newPlan = normalizeEditedPlan(repairedPlan, existingPlan, intent);
        } catch (repairError) {
            console.error('[Editor] JSON repair also failed:', repairError);
            throw new Error('Editor returned invalid JSON even after repair. Please try again.');
        }
    }

    const validation = validatePlan(newPlan);

    if (!validation.success) {
        console.error('Edited Plan Validation Error:', JSON.stringify(validation.error, null, 2));
        throw new Error(`Edited plan failed validation: ${JSON.stringify(validation.error)}`);
    }

    return validation.data as UIPlan;
}