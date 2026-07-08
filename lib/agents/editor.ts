import { callLLM } from './llm';
import { EDITOR_PROMPT } from '../prompts';
import { validatePlan } from '../validation/planValidator';
import { UIPlan } from '@/types/plan';
import { parseJsonFromLLMResponse } from './responseUtils';

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
      : existingPlan.constraint_notice || '',
  };
}

function safeStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function repairEditorJson(rawResponse: string, intent: string, existingPlan: UIPlan): Promise<unknown> {
  const repairPrompt = `
You are repairing a failed UI plan edit response.

USER REQUEST:
${intent}

EXISTING VALID UI PLAN:
${safeStringify(existingPlan)}

BROKEN EDITOR RESPONSE:
${rawResponse}

Return ONLY one complete valid JSON object.

The JSON must match this exact top-level structure:
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
- Return JSON only.
- Do not use markdown.
- Do not use code fences.
- Do not add text before or after JSON.
- Do not return a partial patch.
- Return the full updated plan.
- Preserve the existing structure when possible.
- Apply the user's requested changes to the plan.
- Every node must have a "type".
- Every node should have "props".
- Children must always be an array.
- components_used must be an array of strings.
`;

  const repairedResponse = await callLLM(repairPrompt, EDITOR_PROMPT, true);

  if (!repairedResponse) {
    throw new Error('Editor JSON repair returned empty response');
  }

  return parseJsonFromLLMResponse(repairedResponse);
}

function createFallbackEditedPlan(existingPlan: UIPlan, intent: string): UIPlan {
  return {
    ...existingPlan,
    reasoning: `The editor fallback preserved the current UI plan after a failed JSON edit attempt. User requested: ${intent}`,
    constraint_notice: existingPlan.constraint_notice || '',
  };
}

export async function runEditor(intent: string, existingPlan: UIPlan): Promise<UIPlan> {
  const prompt = `
You are editing an existing UI plan.

USER REQUEST:
${intent}

EXISTING VALID UI PLAN:
${safeStringify(existingPlan)}

Return ONLY the complete updated UI plan as valid JSON.

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

Strict rules:
- JSON only.
- No markdown.
- No code fences.
- No explanation outside JSON.
- Do not return JavaScript.
- Do not return TypeScript.
- Do not return a diff.
- Do not return only changed fields.
- Return the full updated plan.
- Preserve the existing UI where the user did not request changes.
- Apply the user's requested visual/layout/content changes.
- Ensure every layout node has type, props, and children when applicable.
`;

  const response = await callLLM(prompt, EDITOR_PROMPT, true);

  if (!response) {
    throw new Error('Editor returned empty response');
  }

  let newPlan: unknown;

  try {
    const parsedPlan = parseJsonFromLLMResponse(response);
    newPlan = normalizeEditedPlan(parsedPlan, existingPlan, intent);
  } catch (firstError) {
    console.error('[Editor] First response was invalid JSON:', firstError);
    console.error('[Editor] Raw response:', response);

    try {
      const repairedPlan = await repairEditorJson(response, intent, existingPlan);
      newPlan = normalizeEditedPlan(repairedPlan, existingPlan, intent);
    } catch (repairError) {
      console.error('[Editor] JSON repair also failed:', repairError);
      newPlan = createFallbackEditedPlan(existingPlan, intent);
    }
  }

  const validation = validatePlan(newPlan);

  if (!validation.success) {
    console.error('Edited Plan Validation Error:', JSON.stringify(validation.error, null, 2));

    const fallbackPlan = createFallbackEditedPlan(existingPlan, intent);
    const fallbackValidation = validatePlan(fallbackPlan);

    if (fallbackValidation.success) {
      return fallbackValidation.data as UIPlan;
    }

    throw new Error(`Edited plan failed validation: ${JSON.stringify(validation.error)}`);
  }

  return validation.data as UIPlan;
}