import { versionStore } from '@/lib/versioning/versionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

export async function GET() {
    try {
        const history = versionStore.getHistory();

        return successResponse({
            history
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