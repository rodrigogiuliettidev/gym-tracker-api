import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface FeedPostItem {
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

interface OutputDto {
  posts: FeedPostItem[];
  nextCursor?: string;
}

export class ListFeedPosts {
  async execute(dto: InputDto): Promise<OutputDto> {
    const limit = dto.limit ?? 20;

    const posts = await prisma.feedPost.findMany({
      take: limit + 1,
      ...(dto.cursor && {
        cursor: { id: dto.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        workoutSession: {
          include: {
            workoutDay: true,
          },
        },
        likes: {
          where: { userId: dto.userId },
          select: { id: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, limit) : posts;

    return {
      posts: items.map((post) => ({
        id: post.id,
        userId: post.userId,
        userName: post.user.name,
        userImageUrl: post.user.image ?? undefined,
        content: post.content,
        imageUrl: post.imageUrl ?? undefined,
        workoutSessionId: post.workoutSessionId ?? undefined,
        workoutDayName: post.workoutSession?.workoutDay.name ?? undefined,
        likesCount: post._count.likes,
        likedByMe: post.likes.length > 0,
        createdAt: post.createdAt.toISOString(),
      })),
      nextCursor: hasNextPage ? items[items.length - 1]?.id : undefined,
    };
  }
}
