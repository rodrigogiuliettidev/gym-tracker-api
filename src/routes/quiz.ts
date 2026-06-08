import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  AnswerQuizBodySchema,
  AnswerQuizSchema,
  ErrorSchema,
  TodayQuizSchema,
} from "../schemas/index.js";
import { AnswerQuiz } from "../usecases/AnswerQuiz.js";
import { GetTodayQuiz } from "../usecases/GetTodayQuiz.js";

export const quizRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/today",
    schema: {
      operationId: "getTodayQuiz",
      tags: ["Quiz"],
      summary: "Get today's quiz question",
      querystring: z.object({ date: z.iso.date() }),
      response: {
        200: TodayQuizSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getTodayQuiz = new GetTodayQuiz();
        const result = await getTodayQuiz.execute({
          userId: session.user.id,
          date: request.query.date,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/answer",
    schema: {
      operationId: "answerQuiz",
      tags: ["Quiz"],
      summary: "Submit an answer to today's quiz",
      body: AnswerQuizBodySchema,
      response: {
        200: AnswerQuizSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const answerQuiz = new AnswerQuiz();
        const result = await answerQuiz.execute({
          userId: session.user.id,
          questionId: request.body.questionId,
          selectedIndex: request.body.selectedIndex,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
