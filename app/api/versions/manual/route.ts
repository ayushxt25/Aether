import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { validateGeneratedCode } from '@/lib/validation/codeValidator';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

const ManualVersionSchema = z.object({
    projectId: z.number().int().positive('Project ID is required'),
    code: z.string().min(20, 'Code is too short'),
    explanation: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = ManualVersionSchema.safeParse(body);

        if (!parseResult.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                parseResult.error.issues[0]?.message ?? 'Invalid manual version request',
                400
            );
        }

        const { projectId, code, explanation } = parseResult.data;

        const validation = validateGeneratedCode(code);

        if (!validation.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                validation.error || 'The edited code is not valid for preview.',
                400
            );
        }

        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!project) {
            return errorResponse('BAD_REQUEST', 'Project not found.', 404);
        }

        const latestVersion = await prisma.version.findFirst({
            where: {
                projectId,
            },
            orderBy: {
                versionNo: 'desc',
            },
        });

        const nextVersionNo = latestVersion ? latestVersion.versionNo + 1 : 1;

        const manualVersion = await prisma.version.create({
            data: {
                projectId,
                versionNo: nextVersionNo,
                prompt: 'Manual code edit',
                planJson: JSON.stringify({
                    type: 'manual_edit',
                    source: 'code_editor',
                    steps: ['User manually edited generated React component code.'],
                }),
                code,
                explanation: explanation?.trim() || 'Saved manual code edit as a new version.',
            },
        });

        await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return successResponse({
            version: {
                id: manualVersion.id,
                plan: JSON.parse(manualVersion.planJson),
                code: manualVersion.code,
                explanation: manualVersion.explanation,
                timestamp: manualVersion.createdAt.toISOString(),
            },
        }, 201);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /versions/manual POST] Manual Version Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}