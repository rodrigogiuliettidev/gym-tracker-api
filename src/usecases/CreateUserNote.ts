import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  title: string;
  content: string;
}

interface OutputDto {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class CreateUserNote {
  async execute(dto: InputDto): Promise<OutputDto> {
    const note = await prisma.userNote.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        content: dto.content,
      },
    });

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }
}
