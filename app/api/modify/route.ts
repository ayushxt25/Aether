import { NextRequest, NextResponse } from 'next/server';
import { runEditor } from '@/lib/agents/editor';
import { runGenerator } from '@/lib/agents/generator';
import { runExplainer } from '@/lib/agents/explainer';
import { runFixer } from '@/lib/agents/fixer';
import { validateGeneratedCode } from '@/lib/validation/codeValidator';
import { versionStore } from '@/lib/versioning/versionStore';
import { checkPromptSafety } from '@/lib/security/promptGuard';

import { z } from 'zod';

const ModifyRequestSchema = z.object({
    intent: z.string().min(1, 'Intent is required'),
    versionId: z.number().int().positive('Version ID must be a positive integer')
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = ModifyRequestSchema.safeParse(body);
        
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
        }

        const { intent, versionId } = parseResult.data;

        const safety = checkPromptSafety(intent);
        if (!safety.safe) {
            return NextResponse.json({ error: safety.reason }, { status: 403 });
        }

        const existingVersion = versionStore.get(versionId);
        if (!existingVersion) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        // 1. Edit the Plan
        const newPlan = await runEditor(intent, existingVersion.plan);

        // 2. Generate with Self-Healing Middleware
        let code = await runGenerator(newPlan, existingVersion.code);
        let retries = 0;
        let isStable = false;
        const maxRetries = 5;

        while (retries < maxRetries && !isStable) {
            const validationResult = validateGeneratedCode(code);
            if (validationResult.success) {
                isStable = true;
            } else {
                console.warn(`[Pipeline] Modification Self-Healing Attempt ${retries + 1}: ${validationResult.error}`);
                code = await runFixer(code, validationResult.error || "Unknown error", retries);
                retries++;
            }
        }

        if (!isStable) {
            throw new Error(`Unable to modify into a stable UI after ${maxRetries} self-healing attempts. Please reformulate.`);
        }

        // 3. Explain the Modification
        const explanation = await runExplainer(intent, newPlan);

        // 4. Store
        const version = versionStore.push({
            plan: newPlan,
            code,
            explanation
        });

        return NextResponse.json(version);
    } catch (error: any) {
        console.error('Modification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
