import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to update projects.', 401);
    }

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

    const updateResult = await prisma.project.updateMany({
      where: {
        id: projectId,
        userId,
      },
      data: {
        name: parseResult.data.name,
      },
    });

    if (updateResult.count === 0) {
      return errorResponse('NOT_FOUND', 'Project not found.', 404);
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    return successResponse({
      project,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /projects/:id PATCH] Project Update Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to delete projects.', 401);
    }

    const { id } = await params;
    const projectId = Number(id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return errorResponse('BAD_REQUEST', 'Invalid project ID.', 400);
    }

    const deleteResult = await prisma.project.deleteMany({
      where: {
        id: projectId,
        userId,
      },
    });

    if (deleteResult.count === 0) {
      return errorResponse('NOT_FOUND', 'Project not found.', 404);
    }

    return successResponse({
      deleted: true,
      projectId,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /projects/:id DELETE] Project Delete Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}