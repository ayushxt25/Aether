import { NextRequest, NextResponse } from 'next/server';
import { runPlanner } from '@/lib/agents/planner';
import { runGenerator } from '@/lib/agents/generator';
import { runExplainer } from '@/lib/agents/explainer';
import { versionStore } from '@/lib/versioning/versionStore';
import { checkPromptSafety } from '@/lib/security/promptGuard';
import { runFixer } from '@/lib/agents/fixer';
import { validateGeneratedCode } from '@/lib/validation/codeValidator';

import { z } from 'zod';

const GenerateRequestSchema = z.object({
    intent: z.string().min(1, 'Intent is required')
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = GenerateRequestSchema.safeParse(body);
        
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
        }

        const { intent } = parseResult.data;

        const safety = checkPromptSafety(intent);
        if (!safety.safe) {
            return NextResponse.json({ error: safety.reason }, { status: 403 });
        }

        // 1. Plan
        const plan = await runPlanner(intent);

        // 2. Generate with Self-Healing Middleware
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
                code = await runFixer(code, validationResult.error || "Unknown error", retries);
                retries++;
            }
        }

        if (!isStable) {
            throw new Error(`Unable to build stable UI after ${maxRetries} self-healing attempts. Please reformulate your prompt.`);
        }

        // 3. Explain
        const explanation = await runExplainer(intent, plan);

        // 4. Store
        const version = versionStore.push({
            plan,
            code,
            explanation
        });

        return NextResponse.json(version);
    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
