import { prisma } from '@/lib/db/prisma';

export async function getProjectsFromDb() {
    return prisma.project.findMany({
        orderBy: {
            updatedAt: 'desc',
        },
        include: {
            _count: {
                select: {
                    versions: true,
                },
            },
        },
    });
}

export async function createProjectInDb(params: {
    name: string;
    description?: string;
}) {
    return prisma.project.create({
        data: {
            name: params.name,
            description: params.description || null,
        },
    });
}

export async function getOrCreateDefaultProject() {
    const existingProject = await prisma.project.findFirst({
        where: {
            name: 'Default Aether Project',
        },
    });

    if (existingProject) {
        return existingProject;
    }

    return prisma.project.create({
        data: {
            name: 'Default Aether Project',
            description: 'Default local project workspace for generated Aether UI versions.',
        },
    });
}

export async function getProjectById(id: number) {
    return prisma.project.findUnique({
        where: {
            id,
        },
    });
}
