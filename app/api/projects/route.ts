import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/server/apiResponse';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(80, 'Project name is too long'),
  description: z.string().max(300).optional(),
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to view projects.', 401);
    }

    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return successResponse({
      projects,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /projects] Projects Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'You must be signed in to create projects.', 401);
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = CreateProjectSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        parseResult.error.issues[0]?.message ?? 'Invalid project request',
        400
      );
    }

    const project = await prisma.project.create({
      data: {
        userId,
        name: parseResult.data.name,
        description: parseResult.data.description,
      },
    });

    return successResponse(
      {
        project,
      },
      201
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('[API /projects] Create Project Error:', error);

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}