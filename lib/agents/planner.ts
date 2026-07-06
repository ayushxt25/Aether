import { callLLM } from './llm';
import { PLANNER_PROMPT } from '../prompts';
import { validatePlan } from '../validation/planValidator';
import { UIPlan } from '@/types/plan';
import { extractJsonFromLLMResponse } from './responseUtils';

function parsePlannerResponse(response: string): unknown {
    const cleanedResponse = extractJsonFromLLMResponse(response);
    return JSON.parse(cleanedResponse);
}

async function repairPlannerJson(rawResponse: string, intent: string, existingPlan: UIPlan | null): Promise<unknown> {
    const repairPrompt = `
The previous planner response was invalid JSON.

USER INTENT:
${intent}

EXISTING PLAN:
${existingPlan ? JSON.stringify(existingPlan) : 'null'}

INVALID RESPONSE:
${rawResponse}

Return ONLY one valid JSON object that matches this structure:
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
- Do not wrap the response in \`\`\`json.
- Do not include explanation outside JSON.
- Use only valid JSON.
- Every component node must have "type", optional "props", and optional "children".
`;

    const repairedResponse = await callLLM(repairPrompt, PLANNER_PROMPT, true);
    if (!repairedResponse) {
        throw new Error('Planner JSON repair returned empty response');
    }

    return parsePlannerResponse(repairedResponse);
}

export async function runPlanner(intent: string, existingPlan: UIPlan | null = null): Promise<UIPlan> {
    const prompt = `
USER INTENT: ${intent}
EXISTING PLAN: ${existingPlan ? JSON.stringify(existingPlan) : 'null'}

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in code fences.
Do not include explanations outside the JSON object.
`;

    const response = await callLLM(prompt, PLANNER_PROMPT, true);
    if (!response) throw new Error('Planner returned empty response');

    let plan: unknown;

    try {
        plan = parsePlannerResponse(response);
    } catch {
        console.error('[Planner] First response was invalid JSON:', response);

        try {
            plan = await repairPlannerJson(response, intent, existingPlan);
        } catch (repairError) {
            console.error('[Planner] JSON repair also failed:', repairError);
            throw new Error('Planner returned invalid JSON even after repair. Please try again.');
        }
    }

    const validation = validatePlan(plan);

    if (!validation.success) {
        console.error('Plan Validation Error:', JSON.stringify(validation.error, null, 2));
        throw new Error(`Generated plan failed validation: ${JSON.stringify(validation.error)}`);
    }

    return validation.data as UIPlan;
}