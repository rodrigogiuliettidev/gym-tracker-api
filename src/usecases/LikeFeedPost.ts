import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  feedPostId: string;
}

interface OutputDto {
  id: string;
  userId: string;
  feedPostId: string;
}

export class LikeFeedPost {
  async execute(dto: InputDto): Promise<OutputDto> {
    const post = await prisma.feedPost.findUnique({
      where: { id: dto.feedPostId },
    });

    if (!post) {
      throw new NotFoundError("Feed post not found");
    }

    const like = await prisma.feedPostLike.upsert({
      where: {
        userId_feedPostId: {
          userId: dto.userId,
          feedPostId: dto.feedPostId,
        },
      },
      create: {
        id: crypto.randomUUID(),
        userId: dto.userId,
        feedPostId: dto.feedPostId,
      },
      update: {},
    });

    return {
      id: like.id,
      userId: like.userId,
      feedPostId: like.feedPostId,
    };
  }
}
