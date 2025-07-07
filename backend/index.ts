import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import fastifyPassport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';


dotenv.config();
const app = Fastify();

async function main() {
  
  await app.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.register(fastifySecureSession, {
  secret: process.env.SESSION_SECRET!,
  cookie: {
    path: '/',
    httpOnly: true,
    },
  });

  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());

  fastifyPassport.use('google', new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async function (_accessToken, _refreshToken, profile, done){
      done(null,profile);
    }
  ))

  fastifyPassport.registerUserSerializer(async (user) => user);
  fastifyPassport.registerUserDeserializer(async (user) => user);
  
  app.get('/auth/google', fastifyPassport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/auth/google/callback',
    {
      preValidation: fastifyPassport.authenticate('google', { failureRedirect: '/' }),
    },
    async (req, reply) => {
      reply.send({ user: req.user });
    }
  );

  app.get('/', async () => {
    return { message: 'Backend is running!' };
  });

  app.listen({ port: 3001 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main();