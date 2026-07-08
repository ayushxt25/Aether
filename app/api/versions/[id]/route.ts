import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to delete versions.', 401);
    }

    const { id } = await params;
    const versionId = Number(id);

    const projectIdParam = req.nextUrl.searchParams.get('projectId');
    let projectId: number | undefined;

    if (projectIdParam) {
      const parsedProjectId = Number(projectIdParam);

      if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
        return errorResponse('BAD_REQUEST', 'Invalid project ID.', 400);
      }

      projectId = parsedProjectId;
    }

    if (!Number.isInteger(versionId) || versionId <= 0) {
      return errorResponse('BAD_REQUEST', 'Invalid version ID.', 400);
    }

    const version = await prisma.version.findFirst({
      where: {
        id: versionId,
        projectId,
        project: {
          userId,
        },
      },
    });

    if (!version) {
      return errorResponse('VERSION_NOT_FOUND', 'Version not found.', 404);
    }

    await prisma.version.delete({
      where: {
        id: versionId,
      },
    });

    await prisma.project.updateMany({
      where: {
        id: version.projectId,
        userId,
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

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}