import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getVersionsFromDb } from '@/lib/versioning/dbVersionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to view history.', 401);
    }

    const projectIdParam = req.nextUrl.searchParams.get('projectId');

let projectId: number | undefined;

if (projectIdParam) {
  const parsedProjectId = Number(projectIdParam);

  if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
    return errorResponse('BAD_REQUEST', 'Invalid project ID.', 400);
  }

  projectId = parsedProjectId;
}

    const history = await getVersionsFromDb(userId, projectId);

    return successResponse({
      history,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /history] History Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}