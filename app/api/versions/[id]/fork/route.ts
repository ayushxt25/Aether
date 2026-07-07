import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const ForkVersionSchema = z.object({
    projectName: z.string().min(1, 'Project name is required').max(80, 'Project name is too long').optional(),
});

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const versionId = Number(id);

        if (!Number.isInteger(versionId) || versionId <= 0) {
            return errorResponse('BAD_REQUEST', 'Invalid version ID.', 400);
        }

        const body = await req.json().catch(() => ({}));
        const parseResult = ForkVersionSchema.safeParse(body);

        if (!parseResult.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                parseResult.error.issues[0]?.message ?? 'Invalid fork request',
                400
            );
        }

        const sourceVersion = await prisma.version.findUnique({
            where: {
                id: versionId,
            },
            include: {
                project: true,
            },
        });

        if (!sourceVersion) {
            return errorResponse('VERSION_NOT_FOUND', 'Version not found.', 404);
        }

        const forkProjectName =
            parseResult.data.projectName?.trim() ||
            `${sourceVersion.project.name} Fork v${sourceVersion.id}`;

        const forkedProject = await prisma.project.create({
            data: {
                name: forkProjectName,
                description: `Forked from ${sourceVersion.project.name} version ${sourceVersion.id}.`,
            },
        });

        const forkedVersion = await prisma.version.create({
            data: {
                projectId: forkedProject.id,
                versionNo: 1,
                prompt: sourceVersion.prompt
                    ? `Forked from v${sourceVersion.id}: ${sourceVersion.prompt}`
                    : `Forked from v${sourceVersion.id}`,
                planJson: sourceVersion.planJson,
                code: sourceVersion.code,
                explanation: `Forked from ${sourceVersion.project.name} v${sourceVersion.id}. ${sourceVersion.explanation}`,
            },
        });

        return successResponse({
            project: forkedProject,
            version: {
                id: forkedVersion.id,
                plan: JSON.parse(forkedVersion.planJson),
                code: forkedVersion.code,
                explanation: forkedVersion.explanation,
                timestamp: forkedVersion.createdAt.toISOString(),
            },
        }, 201);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /versions/:id/fork] Version Fork Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}