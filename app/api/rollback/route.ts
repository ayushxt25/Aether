import { versionStore } from '@/lib/versioning/versionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const RollbackRequestSchema = z.object({
    id: z.number().int().positive('ID must be a positive integer')
});

export async function POST(req: Request) {
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
        const version = versionStore.rollback(id);

        if (!version) {
            return errorResponse(
                'VERSION_NOT_FOUND',
                'Version not found.',
                404
            );
        }

        return successResponse({
            version
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