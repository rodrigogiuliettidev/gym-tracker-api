import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface NoteDto {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface OutputDto {
  notes: NoteDto[];
}

export class ListUserNotes {
  async execute(dto: InputDto): Promise<OutputDto> {
    const notes = await prisma.userNote.findMany({
      where: { userId: dto.userId },
      orderBy: { updatedAt: "desc" },
    });

    return {
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })),
    };
  }
}
