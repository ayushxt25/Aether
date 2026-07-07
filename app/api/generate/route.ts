import { NextRequest } from 'next/server';
import { runPlanner } from '@/lib/agents/planner';
import { runGenerator } from '@/lib/agents/generator';
import { runExplainer } from '@/lib/agents/explainer';
import { createVersionInDb } from '@/lib/versioning/dbVersionStore';
import { checkPromptSafety } from '@/lib/security/promptGuard';
import { runFixer } from '@/lib/agents/fixer';
import { validateGeneratedCode } from '@/lib/validation/codeValidator';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

import { z } from 'zod';

const GenerateRequestSchema = z.object({
    intent: z.string().min(1, 'Intent is required')
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = GenerateRequestSchema.safeParse(body);

        if (!parseResult.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                parseResult.error.issues[0]?.message ?? 'Invalid request',
                400
            );
        }

        const { intent } = parseResult.data;

        const safety = checkPromptSafety(intent);
        if (!safety.safe) {
            return errorResponse(
                'BAD_REQUEST',
                safety.reason || 'Prompt failed safety checks.',
                403
            );
        }

        const plan = await runPlanner(intent);

        let code = await runGenerator(plan);
        let retries = 0;
        let isStable = false;
        const maxRetries = 5;

        while (retries < maxRetries && !isStable) {
            const validationResult = validateGeneratedCode(code);

            if (validationResult.success) {
                isStable = true;
            } else {
                console.warn(`[Pipeline] Self-Healing Attempt ${retries + 1} for: ${validationResult.error}`);
                code = await runFixer(code, validationResult.error || 'Unknown error', retries);
                retries++;
            }
        }

        if (!isStable) {
            return errorResponse(
                'AI_PROVIDER_ERROR',
                `Unable to build stable UI after ${maxRetries} self-healing attempts. Please reformulate your prompt.`,
                422
            );
        }

        const explanation = await runExplainer(intent, plan);

        const version = await createVersionInDb({
            plan,
            code,
            explanation,
            prompt: intent
        });

        return successResponse(version);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /generate] Generation Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}