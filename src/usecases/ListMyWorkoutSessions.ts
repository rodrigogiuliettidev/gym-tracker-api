import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface WorkoutSessionItem {
  id: string;
  workoutDayId: string;
  workoutDayName: string;
  completedAt: string;
}

interface OutputDto {
  sessions: WorkoutSessionItem[];
}

export class ListMyWorkoutSessions {
  async execute(dto: InputDto): Promise<OutputDto> {
    const sessions = await prisma.workoutSession.findMany({
      where: {
        completedAt: { not: null },
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
      include: {
        workoutDay: true,
      },
    });

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        workoutDayId: s.workoutDayId,
        workoutDayName: s.workoutDay.name,
        completedAt: s.completedAt!.toISOString(),
      })),
    };
  }
}
