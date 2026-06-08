import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  content: string;
  imageUrl?: string;
  workoutSessionId?: string;
}

interface OutputDto {
  id: string;
  userId: string;
  userName: string;
  userImageUrl?: string;
  content: string;
  imageUrl?: string;
  workoutSessionId?: string;
  workoutDayName?: string;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export class CreateFeedPost {
  async execute(dto: InputDto): Promise<OutputDto> {
    const post = await prisma.feedPost.create({
      data: {
        id: crypto.randomUUID(),
        userId: dto.userId,
        content: dto.content,
        imageUrl: dto.imageUrl,
        workoutSessionId: dto.workoutSessionId,
      },
      include: {
        user: true,
        workoutSession: {
          include: {
            workoutDay: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    return {
      id: post.id,
      userId: post.userId,
      userName: post.user.name,
      userImageUrl: post.user.image ?? undefined,
      content: post.content,
      imageUrl: post.imageUrl ?? undefined,
      workoutSessionId: post.workoutSessionId ?? undefined,
      workoutDayName: post.workoutSession?.workoutDay.name ?? undefined,
      likesCount: post._count.likes,
      likedByMe: false,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
