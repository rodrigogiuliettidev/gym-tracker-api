import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  questionId: string;
  selectedIndex: number;
}

interface OutputDto {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

export class AnswerQuiz {
  async execute(dto: InputDto): Promise<OutputDto> {
    const question = await prisma.quizQuestion.findUnique({
      where: { id: dto.questionId },
    });

    if (!question) {
      throw new NotFoundError("Quiz question not found");
    }

    const isCorrect = dto.selectedIndex === question.correctIndex;

    await prisma.quizAnswer.upsert({
      where: {
        userId_questionId: {
          userId: dto.userId,
          questionId: dto.questionId,
        },
      },
      create: {
        id: crypto.randomUUID(),
        userId: dto.userId,
        questionId: dto.questionId,
        selectedIndex: dto.selectedIndex,
        isCorrect,
      },
      update: {
        selectedIndex: dto.selectedIndex,
        isCorrect,
      },
    });

    return {
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    };
  }
}
