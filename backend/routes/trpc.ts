import { initTRPC } from '@trpc/server';
import { FastifyInstance } from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import type { FastifyRequest } from 'fastify';

type Context = {
  user?: any;
};

const t = initTRPC.context<Context>().create();

const appRouter = t.router({
  getUserProfile: t.procedure.query(({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("Not authenticated");

    return {
      name: user.displayName,
      email: user.emails?.[0]?.value,
    };
  }),
});

export type AppRouter = typeof appRouter;

export default async function trpcRoute(app: FastifyInstance) {
  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
        createContext: ({ req }: { req: FastifyRequest }) => ({
        user: req.user,
        }),
    },
  });
}