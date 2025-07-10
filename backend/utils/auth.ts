import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastifyPassport from '@fastify/passport';

export async function isAuthenticated(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}
export async function authRoutes(app:FastifyInstance) {
    app.get('/auth/google', fastifyPassport.authenticate('google', {
    scope: ['profile', 'email']
    }));

    app.get('/auth/google/callback',
    {
        preValidation: fastifyPassport.authenticate('google', { failureRedirect: '/' }),
    },
    async (req, reply) => {
        reply.redirect('http://localhost:5173/dashboard')
    }
    );
    app.get('/auth/logout', async (req, reply) => {
        req.logout();
        reply.clearCookie('session'); 
        reply.send({ success: true });
    });
}