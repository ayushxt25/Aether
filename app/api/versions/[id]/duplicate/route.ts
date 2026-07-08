import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to duplicate versions.', 401);
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

    const sourceVersion = await prisma.version.findFirst({
      where: {
        id: versionId,
        projectId,
        project: {
          userId,
        },
      },
    });

    if (!sourceVersion) {
      return errorResponse('VERSION_NOT_FOUND', 'Version not found.', 404);
    }

    const latestVersion = await prisma.version.findFirst({
      where: {
        projectId: sourceVersion.projectId,
        project: {
          userId,
        },
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

    await prisma.project.updateMany({
      where: {
        id: sourceVersion.projectId,
        userId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return successResponse(
      {
        version: {
          id: duplicatedVersion.id,
          versionNo: duplicatedVersion.versionNo,
          prompt: duplicatedVersion.prompt,
          source: 'duplicate',
          plan: JSON.parse(duplicatedVersion.planJson),
          code: duplicatedVersion.code,
          explanation: duplicatedVersion.explanation,
          timestamp: duplicatedVersion.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /versions/:id/duplicate] Version Duplicate Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}