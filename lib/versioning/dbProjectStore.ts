import { prisma } from '@/lib/db/prisma';

export async function getProjectsFromDb(userId: string) {
  return prisma.project.findMany({
    where: {
      userId,
    },
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
  userId: string;
  name: string;
  description?: string;
}) {
  return prisma.project.create({
    data: {
      userId: params.userId,
      name: params.name,
      description: params.description || null,
    },
  });
}

export async function getOrCreateDefaultProject(userId: string) {
  const existingProject = await prisma.project.findFirst({
    where: {
      userId,
      name: 'Default Aether Project',
    },
  });

  if (existingProject) {
    return existingProject;
  }

  return prisma.project.create({
    data: {
      userId,
      name: 'Default Aether Project',
      description: 'Default local project workspace for generated Aether UI versions.',
    },
  });
}

export async function getProjectById(id: number, userId: string) {
  return prisma.project.findFirst({
    where: {
      id,
      userId,
    },
  });
}