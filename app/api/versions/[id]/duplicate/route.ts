import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const versionId = Number(id);

        const projectIdParam = req.nextUrl.searchParams.get('projectId');
        const projectId = projectIdParam ? Number(projectIdParam) : undefined;

        if (!Number.isInteger(versionId) || versionId <= 0) {
            return errorResponse('BAD_REQUEST', 'Invalid version ID.', 400);
        }

        const sourceVersion = await prisma.version.findUnique({
            where: {
                id: versionId,
            },
        });

        if (!sourceVersion) {
            return errorResponse('VERSION_NOT_FOUND', 'Version not found.', 404);
        }

        if (projectId && sourceVersion.projectId !== projectId) {
            return errorResponse('VERSION_NOT_FOUND', 'Version not found in this project.', 404);
        }

        const latestVersion = await prisma.version.findFirst({
            where: {
                projectId: sourceVersion.projectId,
            },
            orderBy: {
                versionNo: 'desc',
            },
        });

        const nextVersionNo = latestVersion ? latestVersion.versionNo + 1 : 1;

        const duplicatedVersion = await prisma.version.create({
            data: {
                projectId: sourceVersion.projectId,
                versionNo: nextVersionNo,
                prompt: sourceVersion.prompt
                    ? `Duplicated from v${sourceVersion.id}: ${sourceVersion.prompt}`
                    : `Duplicated from v${sourceVersion.id}`,
                planJson: sourceVersion.planJson,
                code: sourceVersion.code,
                explanation: `Duplicated from v${sourceVersion.id}. ${sourceVersion.explanation}`,
            },
        });

        await prisma.project.update({
            where: {
                id: sourceVersion.projectId,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return successResponse({
            version: {
                id: duplicatedVersion.id,
                plan: JSON.parse(duplicatedVersion.planJson),
                code: duplicatedVersion.code,
                explanation: duplicatedVersion.explanation,
                timestamp: duplicatedVersion.createdAt.toISOString(),
            },
        }, 201);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /versions/:id/duplicate] Version Duplicate Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}