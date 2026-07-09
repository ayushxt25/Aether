import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

function inferVersionSource(prompt: string | null) {
  if (!prompt) {
    return 'generated';
  }

  const normalizedPrompt = prompt.toLowerCase();

  if (normalizedPrompt.includes('manual code edit')) {
    return 'manual';
  }

  if (normalizedPrompt.includes('duplicated from')) {
    return 'duplicate';
  }

  if (normalizedPrompt.includes('forked from')) {
    return 'fork';
  }

  if (normalizedPrompt.includes('modify') || normalizedPrompt.includes('edit')) {
    return 'modified';
  }

  return 'generated';
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to view prompt runs.', 401);
    }

    const runs = await prisma.version.findMany({
      where: {
        project: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        project: true,
      },
    });

    return successResponse({
      runs: runs.map((run: any) => ({
        id: run.id,
        versionId: run.id,
        versionNo: run.versionNo,
        projectId: run.projectId,
        projectName: run.project.name,
        prompt: run.prompt || '',
        source: inferVersionSource(run.prompt),
        plan: JSON.parse(run.planJson),
        code: run.code,
        explanation: run.explanation,
        timestamp: run.createdAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /runs GET] Runs Fetch Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}