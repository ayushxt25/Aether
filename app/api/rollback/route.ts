import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getVersionFromDb } from '@/lib/versioning/dbVersionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const RollbackRequestSchema = z.object({
  id: z.number().int().positive('Version ID must be a positive integer'),
  projectId: z.number().int().positive('Project ID must be a positive integer').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to restore versions.', 401);
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = RollbackRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        parseResult.error.issues[0]?.message ?? 'Invalid request',
        400
      );
    }

    const { id, projectId } = parseResult.data;
    const version = await getVersionFromDb(userId, id, projectId);

    if (!version) {
      return errorResponse(
        'VERSION_NOT_FOUND',
        'Version not found.',
        404
      );
    }

    return successResponse({
      version,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /rollback] Rollback Error:', error);

    return errorResponse(
      'INTERNAL_ERROR',
      message,
      500
    );
  }
}