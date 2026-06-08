import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";

import { auth } from "../lib/auth.js";
import {
  CreateUserNoteBodySchema,
  ErrorSchema,
  ListMyWorkoutSessionsSchema,
  ListUserNotesSchema,
  UpsertUserTrainDataBodySchema,
  UpsertUserTrainDataSchema,
  UserNoteSchema,
  UserTrainDataSchema,
} from "../schemas/index.js";
import { CreateUserNote } from "../usecases/CreateUserNote.js";
import { DeleteUserNote } from "../usecases/DeleteUserNote.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListMyWorkoutSessions } from "../usecases/ListMyWorkoutSessions.js";
import { ListUserNotes } from "../usecases/ListUserNotes.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

export const meRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/notes",
    schema: {
      operationId: "listUserNotes",
      tags: ["Me"],
      summary: "List user notes",
      response: {
        200: ListUserNotesSchema,
        401: ErrorSchema,
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

        const listUserNotes = new ListUserNotes();
        const result = await listUserNotes.execute({ userId: session.user.id });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/notes",
    schema: {
      operationId: "createUserNote",
      tags: ["Me"],
      summary: "Create a user note",
      body: CreateUserNoteBodySchema,
      response: {
        201: UserNoteSchema,
        401: ErrorSchema,
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

        const createUserNote = new CreateUserNote();
        const result = await createUserNote.execute({
          userId: session.user.id,
          title: request.body.title,
          content: request.body.content,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/notes/:noteId",
    schema: {
      operationId: "deleteUserNote",
      tags: ["Me"],
      summary: "Delete a user note",
      params: z.object({ noteId: z.uuid() }),
      response: {
        204: z.object({}),
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

        const deleteUserNote = new DeleteUserNote();
        await deleteUserNote.execute({
          userId: session.user.id,
          noteId: request.params.noteId,
        });

        return reply.status(204).send({});
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
    method: "GET",
    url: "/workout-sessions",
    schema: {
      operationId: "listMyWorkoutSessions",
      tags: ["Me"],
      summary: "List my completed workout sessions",
      response: {
        200: ListMyWorkoutSessionsSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const listMyWorkoutSessions = new ListMyWorkoutSessions();
        const result = await listMyWorkoutSessions.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getUserTrainData",
      tags: ["Me"],
      summary: "Get user train data",
      response: {
        200: UserTrainDataSchema.nullable(),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const getUserTrainData = new GetUserTrainData();
        const result = await getUserTrainData.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/",
    schema: {
      operationId: "upsertUserTrainData",
      tags: ["Me"],
      summary: "Upsert user train data",
      body: UpsertUserTrainDataBodySchema,
      response: {
        200: UpsertUserTrainDataSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const upsertUserTrainData = new UpsertUserTrainData();
        const result = await upsertUserTrainData.execute({
          userId: session.user.id,
          weightInGrams: request.body.weightInGrams,
          heightInCentimeters: request.body.heightInCentimeters,
          age: request.body.age,
          bodyFatPercentage: request.body.bodyFatPercentage,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
