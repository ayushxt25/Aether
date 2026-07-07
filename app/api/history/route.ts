import { NextRequest } from 'next/server';
import { getVersionsFromDb } from '@/lib/versioning/dbVersionStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';

export async function GET(req: NextRequest) {
    try {
        const projectIdParam = req.nextUrl.searchParams.get('projectId');
        const projectId = projectIdParam ? Number(projectIdParam) : undefined;

        const history = await getVersionsFromDb(projectId);

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