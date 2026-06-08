import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  noteId: string;
}

export class DeleteUserNote {
  async execute(dto: InputDto): Promise<void> {
    const note = await prisma.userNote.findFirst({
      where: { id: dto.noteId, userId: dto.userId },
    });

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    await prisma.userNote.delete({ where: { id: dto.noteId } });
  }
}
