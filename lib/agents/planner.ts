import { callLLM } from './llm';
import { PLANNER_PROMPT } from '../prompts';
import { validatePlan } from '../validation/planValidator';
import { UIPlan } from '@/types/plan';
import { extractJsonFromLLMResponse } from './responseUtils';

export async function runPlanner(intent: string, existingPlan: UIPlan | null = null): Promise<UIPlan> {
    const prompt = `
USER INTENT: ${intent}
EXISTING PLAN: ${existingPlan ? JSON.stringify(existingPlan) : 'null'}
`;

    const response = await callLLM(prompt, PLANNER_PROMPT, true);
    if (!response) throw new Error('Planner returned empty response');

    let plan: unknown;

    try {
        const cleanedResponse = extractJsonFromLLMResponse(response);
        plan = JSON.parse(cleanedResponse);
    } catch {
        console.error('[Planner] Invalid JSON response from LLM:', response);
        throw new Error('Planner returned invalid JSON. Please try again.');
    }

    const validation = validatePlan(plan);

    if (!validation.success) {
        console.error('Plan Validation Error:', JSON.stringify(validation.error, null, 2));
        throw new Error(`Generated plan failed validation: ${JSON.stringify(validation.error)}`);
    }

    return validation.data as UIPlan;
}