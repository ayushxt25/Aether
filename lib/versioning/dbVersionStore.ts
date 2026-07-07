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

function inferVersionSource(prompt: string | null) {
    if (!prompt) {
        return 'generated';
    }

    const normalizedPrompt = prompt.toLowerCase();

    if (normalizedPrompt.includes('manual code edit')) {
        return 'manual';
    }

    if (normalizedPrompt.includes('duplicated from')) {
        return 'duplicate';
    }

    if (normalizedPrompt.includes('forked from')) {
        return 'fork';
    }

    if (normalizedPrompt.includes('modify') || normalizedPrompt.includes('edit')) {
        return 'modified';
    }

    return 'generated';
}

function mapDbVersionToVersion(version: {
    id: number;
    versionNo: number;
    prompt: string | null;
    planJson: string;
    code: string;
    explanation: string;
    createdAt: Date;
}): Version {
    return {
        id: version.id,
        versionNo: version.versionNo,
        prompt: version.prompt || '',
        source: inferVersionSource(version.prompt),
        plan: JSON.parse(version.planJson),
        code: version.code,
        explanation: version.explanation,
        timestamp: version.createdAt.toISOString(),
    };
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

    return mapDbVersionToVersion(version);
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

    return versions.map(mapDbVersionToVersion);
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

    return mapDbVersionToVersion(version);
}