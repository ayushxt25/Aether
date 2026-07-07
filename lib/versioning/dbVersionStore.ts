import { prisma } from '@/lib/db/prisma';
import { UIPlan, Version } from '@/types/plan';
import { getOrCreateDefaultProject, getProjectById } from './dbProjectStore';

async function resolveProject(projectId?: number) {
    if (!projectId) {
        return getOrCreateDefaultProject();
    }

    const project = await getProjectById(projectId);

    if (!project) {
        throw new Error('Project not found.');
    }

    return project;
}

export async function createVersionInDb(params: {
    plan: UIPlan;
    code: string;
    explanation: string;
    prompt?: string;
    projectId?: number;
}): Promise<Version> {
    const project = await resolveProject(params.projectId);

    const latestVersion = await prisma.version.findFirst({
        where: {
            projectId: project.id,
        },
        orderBy: {
            versionNo: 'desc',
        },
    });

    const nextVersionNo = latestVersion ? latestVersion.versionNo + 1 : 1;

    const version = await prisma.version.create({
        data: {
            projectId: project.id,
            versionNo: nextVersionNo,
            prompt: params.prompt || null,
            planJson: JSON.stringify(params.plan),
            code: params.code,
            explanation: params.explanation,
        },
    });

    await prisma.project.update({
        where: {
            id: project.id,
        },
        data: {
            updatedAt: new Date(),
        },
    });

    return {
        id: version.id,
        plan: JSON.parse(version.planJson),
        code: version.code,
        explanation: version.explanation,
        timestamp: version.createdAt.toISOString(),
    };
}

export async function getVersionsFromDb(projectId?: number): Promise<Version[]> {
    const project = await resolveProject(projectId);

    const versions = await prisma.version.findMany({
        where: {
            projectId: project.id,
        },
        orderBy: {
            versionNo: 'asc',
        },
    });

    return versions.map((version) => ({
        id: version.id,
        plan: JSON.parse(version.planJson),
        code: version.code,
        explanation: version.explanation,
        timestamp: version.createdAt.toISOString(),
    }));
}

export async function getVersionFromDb(id: number, projectId?: number): Promise<Version | null> {
    const version = await prisma.version.findUnique({
        where: {
            id,
        },
    });

    if (!version) {
        return null;
    }

    if (projectId && version.projectId !== projectId) {
        return null;
    }

    return {
        id: version.id,
        plan: JSON.parse(version.planJson),
        code: version.code,
        explanation: version.explanation,
        timestamp: version.createdAt.toISOString(),
    };
}