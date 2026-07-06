import { prisma } from '@/lib/db/prisma';
import { UIPlan, Version } from '@/types/plan';

const DEFAULT_PROJECT_NAME = 'Default Aether Project';

async function getOrCreateDefaultProject() {
    const existingProject = await prisma.project.findFirst({
        where: {
            name: DEFAULT_PROJECT_NAME,
        },
    });

    if (existingProject) {
        return existingProject;
    }

    return prisma.project.create({
        data: {
            name: DEFAULT_PROJECT_NAME,
            description: 'Default local project workspace for generated Aether UI versions.',
        },
    });
}

export async function createVersionInDb(params: {
    plan: UIPlan;
    code: string;
    explanation: string;
    prompt?: string;
}): Promise<Version> {
    const project = await getOrCreateDefaultProject();

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

    return {
        id: version.id,
        plan: JSON.parse(version.planJson),
        code: version.code,
        explanation: version.explanation,
        timestamp: version.createdAt.getTime(),
    };
}

export async function getVersionsFromDb(): Promise<Version[]> {
    const project = await getOrCreateDefaultProject();

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
        timestamp: version.createdAt.getTime(),
    }));
}

export async function getVersionFromDb(id: number): Promise<Version | null> {
    const version = await prisma.version.findUnique({
        where: {
            id,
        },
    });

    if (!version) {
        return null;
    }

    return {
        id: version.id,
        plan: JSON.parse(version.planJson),
        code: version.code,
        explanation: version.explanation,
        timestamp: version.createdAt.getTime(),
    };
}