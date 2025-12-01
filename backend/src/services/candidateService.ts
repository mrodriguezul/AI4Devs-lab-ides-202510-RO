import { PrismaClient, Candidate, Education, WorkExperience } from '@prisma/client';
import { deleteUploadedFile } from '../config/multer';

const prisma = new PrismaClient();

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear?: number;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
}

export interface CandidateWithRelations extends Candidate {
  education: Education[];
  workExperience: WorkExperience[];
}

export class CandidateService {
  async getAllCandidates(page = 1, limit = 10): Promise<{
    candidates: CandidateWithRelations[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        skip,
        take: limit,
        include: {
          education: true,
          workExperience: {
            orderBy: {
              startDate: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.candidate.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      candidates,
      total,
      totalPages
    };
  }

  async getCandidateById(id: number): Promise<CandidateWithRelations | null> {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        education: true,
        workExperience: {
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    });
  }

  async createCandidate(
    candidateData: CreateCandidateData,
    cvFilePath?: string
  ): Promise<CandidateWithRelations> {
    try {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          phone: candidateData.phone,
          address: candidateData.address,
          cvFilePath,
          education: {
            create: candidateData.education.map(edu => ({
              degree: edu.degree,
              institution: edu.institution,
              graduationYear: edu.graduationYear
            }))
          },
          workExperience: {
            create: candidateData.workExperience.map(work => ({
              company: work.company,
              position: work.position,
              startDate: new Date(work.startDate),
              endDate: work.endDate ? new Date(work.endDate) : null,
              description: work.description
            }))
          }
        },
        include: {
          education: true,
          workExperience: {
            orderBy: {
              startDate: 'desc'
            }
          }
        }
      });

      return candidate;
    } catch (error) {
      // If candidate creation fails, clean up uploaded file
      if (cvFilePath) {
        deleteUploadedFile(cvFilePath);
      }
      throw error;
    }
  }

  async updateCandidate(
    id: number,
    candidateData: Partial<CreateCandidateData>,
    cvFilePath?: string
  ): Promise<CandidateWithRelations | null> {
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      return null;
    }

    // If updating CV, delete old file
    if (cvFilePath && existingCandidate.cvFilePath) {
      deleteUploadedFile(existingCandidate.cvFilePath);
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...(candidateData.firstName && { firstName: candidateData.firstName }),
        ...(candidateData.lastName && { lastName: candidateData.lastName }),
        ...(candidateData.email && { email: candidateData.email }),
        ...(candidateData.phone !== undefined && { phone: candidateData.phone }),
        ...(candidateData.address !== undefined && { address: candidateData.address }),
        ...(cvFilePath && { cvFilePath })
      },
      include: {
        education: true,
        workExperience: {
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    });

    return candidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return false;
    }

    // Delete CV file if exists
    if (candidate.cvFilePath) {
      deleteUploadedFile(candidate.cvFilePath);
    }

    await prisma.candidate.delete({
      where: { id }
    });

    return true;
  }

  async searchCandidates(query: string, page = 1, limit = 10): Promise<{
    candidates: CandidateWithRelations[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const whereClause = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { 
          education: {
            some: {
              OR: [
                { degree: { contains: query, mode: 'insensitive' as const } },
                { institution: { contains: query, mode: 'insensitive' as const } }
              ]
            }
          }
        },
        {
          workExperience: {
            some: {
              OR: [
                { company: { contains: query, mode: 'insensitive' as const } },
                { position: { contains: query, mode: 'insensitive' as const } }
              ]
            }
          }
        }
      ]
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          education: true,
          workExperience: {
            orderBy: {
              startDate: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.candidate.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      candidates,
      total,
      totalPages
    };
  }
}