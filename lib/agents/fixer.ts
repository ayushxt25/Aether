import { extractGeneratedComponentCode } from '@/lib/agents/codeUtils';
import { callLLM } from './llm';
import { FIXER_PROMPT } from '../prompts';

export async function runFixer(failedCode: string, compilationError: string, attemptCount: number): Promise<string> {
    if (attemptCount >= 5) {
        throw new Error('Irrecoverable generation failure after 5 attempts.');
    }

    const prompt = `
    The generated React component failed strict validation.
    
    ERROR REASON:
    ${compilationError}
    
    FAILED CODE:
    ${failedCode}
    
    REPAIR INSTRUCTION: Focus purely on resolving the error above. Maintain the structural layout. Return ONLY raw valid JavaScript/JSX.
    `;

    const response = await callLLM(prompt, FIXER_PROMPT, false);
    if (!response) throw new Error('Fixer returned empty response');

    return extractGeneratedComponentCode(response);
}
