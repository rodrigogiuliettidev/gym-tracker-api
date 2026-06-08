import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateFeedPostBodySchema,
  ErrorSchema,
  FeedPostSchema,
  ListFeedPostsQuerySchema,
  ListFeedPostsSchema,
} from "../schemas/index.js";
import { CreateFeedPost } from "../usecases/CreateFeedPost.js";
import { LikeFeedPost } from "../usecases/LikeFeedPost.js";
import { ListFeedPosts } from "../usecases/ListFeedPosts.js";
import { UnlikeFeedPost } from "../usecases/UnlikeFeedPost.js";

export const feedRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "listFeedPosts",
      tags: ["Feed"],
      summary: "List feed posts",
      querystring: ListFeedPostsQuerySchema,
      response: {
        200: ListFeedPostsSchema,
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

        const listFeedPosts = new ListFeedPosts();
        const result = await listFeedPosts.execute({
          userId: session.user.id,
          cursor: request.query.cursor,
          limit: request.query.limit,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createFeedPost",
      tags: ["Feed"],
      summary: "Create a feed post",
      body: CreateFeedPostBodySchema,
      response: {
        201: FeedPostSchema,
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

        const createFeedPost = new CreateFeedPost();
        const result = await createFeedPost.execute({
          userId: session.user.id,
          content: request.body.content,
          imageUrl: request.body.imageUrl,
          workoutSessionId: request.body.workoutSessionId,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:feedPostId/likes",
    schema: {
      operationId: "likeFeedPost",
      tags: ["Feed"],
      summary: "Like a feed post",
      params: z.object({ feedPostId: z.uuid() }),
      response: {
        201: z.object({ id: z.uuid(), userId: z.string(), feedPostId: z.uuid() }),
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

        const likeFeedPost = new LikeFeedPost();
        const result = await likeFeedPost.execute({
          userId: session.user.id,
          feedPostId: request.params.feedPostId,
        });

        return reply.status(201).send(result);
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
    method: "DELETE",
    url: "/:feedPostId/likes",
    schema: {
      operationId: "unlikeFeedPost",
      tags: ["Feed"],
      summary: "Unlike a feed post",
      params: z.object({ feedPostId: z.uuid() }),
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

        const unlikeFeedPost = new UnlikeFeedPost();
        await unlikeFeedPost.execute({
          userId: session.user.id,
          feedPostId: request.params.feedPostId,
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
};
