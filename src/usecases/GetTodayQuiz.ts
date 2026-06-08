import { NotFoundError } from "../errors/index.js";
import { QuizCategory } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

const QUESTIONS_PER_DAY = 5;

interface InputDto {
  userId: string;
  date: string;
}

interface QuizQuestionDto {
  id: string;
  question: string;
  options: string[];
  category: QuizCategory;
  alreadyAnswered: boolean;
  selectedIndex?: number;
  isCorrect?: boolean;
  correctIndex?: number;
  explanation?: string;
}

interface OutputDto {
  questions: QuizQuestionDto[];
}

const getDayOfYear = (dateStr: string): number => {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export class GetTodayQuiz {
  async execute(dto: InputDto): Promise<OutputDto> {
    const totalQuestions = await prisma.quizQuestion.count();

    if (totalQuestions === 0) {
      throw new NotFoundError("No quiz available for today");
    }

    const dayIndex = getDayOfYear(dto.date);
    const startIndex = (dayIndex * QUESTIONS_PER_DAY) % totalQuestions;

    const allOrdered = await prisma.quizQuestion.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const selectedIds = Array.from({ length: QUESTIONS_PER_DAY }, (_, i) => {
      return allOrdered[(startIndex + i) % totalQuestions].id;
    });

    const questionsWithAnswers = await prisma.quizQuestion.findMany({
      where: { id: { in: selectedIds } },
      include: {
        answers: {
          where: { userId: dto.userId },
        },
      },
    });

    // Preserve the cyclic order
    const questionsMap = new Map(questionsWithAnswers.map((q) => [q.id, q]));

    const questions: QuizQuestionDto[] = selectedIds.map((id) => {
      const q = questionsMap.get(id)!;
      const userAnswer = q.answers[0] ?? null;

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category,
        alreadyAnswered: !!userAnswer,
        selectedIndex: userAnswer?.selectedIndex ?? undefined,
        isCorrect: userAnswer?.isCorrect ?? undefined,
        correctIndex: userAnswer ? q.correctIndex : undefined,
        explanation: userAnswer ? q.explanation : undefined,
      };
    });

    return { questions };
  }
}
