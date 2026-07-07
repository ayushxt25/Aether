import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const versionId = Number(id);
        const projectIdParam = req.nextUrl.searchParams.get('projectId');
        const projectId = projectIdParam ? Number(projectIdParam) : undefined;

        if (!Number.isInteger(versionId) || versionId <= 0) {
            return errorResponse('BAD_REQUEST', 'Invalid version ID.', 400);
        }

        const version = await prisma.version.findUnique({
            where: {
                id: versionId,
            },
        });

        if (!version) {
            return errorResponse('VERSION_NOT_FOUND', 'Version not found.', 404);
        }

        if (projectId && version.projectId !== projectId) {
            return errorResponse('VERSION_NOT_FOUND', 'Version not found in this project.', 404);
        }

        await prisma.version.delete({
            where: {
                id: versionId,
            },
        });

        await prisma.project.update({
            where: {
                id: version.projectId,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return successResponse({
            deleted: true,
            versionId,
            projectId: version.projectId,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /versions/:id DELETE] Version Delete Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}