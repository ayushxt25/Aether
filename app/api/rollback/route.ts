import { NextRequest } from 'next/server';
import { getVersionFromDb } from '@/lib/versioning/dbVersionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const RollbackRequestSchema = z.object({
    id: z.number(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = RollbackRequestSchema.safeParse(body);

        if (!parseResult.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                parseResult.error.issues[0]?.message ?? 'Invalid request',
                400
            );
        }

        const { id } = parseResult.data;
        const version = await getVersionFromDb(id);

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