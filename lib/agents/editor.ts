import { callLLM } from './llm';
import { EDITOR_PROMPT } from '../prompts';
import { validatePlan } from '../validation/planValidator';
import { UIPlan } from '@/types/plan';
import { extractJsonFromLLMResponse } from './responseUtils';

export async function runEditor(intent: string, existingPlan: UIPlan): Promise<UIPlan> {
    const prompt = `
USER INTENT: ${intent}
EXISTING PLAN: ${JSON.stringify(existingPlan)}
`;

    const response = await callLLM(prompt, EDITOR_PROMPT, true);
    if (!response) throw new Error('Editor returned empty response');

    let newPlan: unknown;

    try {
        const cleanedResponse = extractJsonFromLLMResponse(response);
        newPlan = JSON.parse(cleanedResponse);
    } catch {
        console.error('[Editor] Invalid JSON response from LLM:', response);
        throw new Error('Editor returned invalid JSON. Please try again.');
    }

    const validation = validatePlan(newPlan);

    if (!validation.success) {
        console.error('Edited Plan Validation Error:', JSON.stringify(validation.error, null, 2));
        throw new Error(`Edited plan failed validation: ${JSON.stringify(validation.error)}`);
    }

    return validation.data as UIPlan;
}