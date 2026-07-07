import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const UpdateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(80, 'Project name is too long'),
});

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const projectId = Number(id);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return errorResponse('BAD_REQUEST', 'Invalid project ID.', 400);
        }

        const body = await req.json().catch(() => ({}));
        const parseResult = UpdateProjectSchema.safeParse(body);

        if (!parseResult.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                parseResult.error.issues[0]?.message ?? 'Invalid project request',
                400
            );
        }

        const project = await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                name: parseResult.data.name,
            },
        });

        return successResponse({
            project,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /projects/:id PATCH] Project Update Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const projectId = Number(id);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return errorResponse('BAD_REQUEST', 'Invalid project ID.', 400);
        }

        await prisma.project.delete({
            where: {
                id: projectId,
            },
        });

        return successResponse({
            deleted: true,
            projectId,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /projects/:id DELETE] Project Delete Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}