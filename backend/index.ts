import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify();

async function main() {
  await app.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
  });

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