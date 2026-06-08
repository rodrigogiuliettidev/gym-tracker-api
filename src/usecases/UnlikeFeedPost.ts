import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  feedPostId: string;
}

export class UnlikeFeedPost {
  async execute(dto: InputDto): Promise<void> {
    const like = await prisma.feedPostLike.findUnique({
      where: {
        userId_feedPostId: {
          userId: dto.userId,
          feedPostId: dto.feedPostId,
        },
      },
    });

    if (!like) {
      throw new NotFoundError("Like not found");
    }

    await prisma.feedPostLike.delete({
      where: { id: like.id },
    });
  }
}
