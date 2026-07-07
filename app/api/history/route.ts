import { getVersionsFromDb } from '@/lib/versioning/dbVersionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

export async function GET() {
    try {
        const history = await getVersionsFromDb();

        return successResponse({
            history,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /history] History Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}