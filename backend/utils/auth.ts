import { FastifyRequest, FastifyReply } from 'fastify';

export async function isAuthenticated(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}