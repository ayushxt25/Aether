import { NextRequest } from 'next/server';
import { createProjectInDb, getProjectsFromDb } from '@/lib/versioning/dbProjectStore';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const CreateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(80, 'Project name is too long'),
    description: z.string().max(300).optional(),
});

export async function GET() {
    try {
        const projects = await getProjectsFromDb();

        return successResponse({
            projects,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /projects] Projects Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = CreateProjectSchema.safeParse(body);

        if (!parseResult.success) {
            return errorResponse(
                'VALIDATION_ERROR',
                parseResult.error.issues[0]?.message ?? 'Invalid project request',
                400
            );
        }

        const project = await createProjectInDb(parseResult.data);

        return successResponse({
            project,
        }, 201);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('[API /projects] Create Project Error:', error);

        return errorResponse(
            'INTERNAL_ERROR',
            message,
            500
        );
    }
}