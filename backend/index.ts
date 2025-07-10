import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import swaggerPlugin from './plugins/swagger';
import { initGCS } from './utils/gcs';
import uploadRoute from './routes/upload';
import imagesRoute from './routes/images';
import trpcRoute from './routes/trpc';
import registerPassport from './utils/passport';
import registerWebsocket from './plugins/websocket';
import { authRoutes } from './utils/auth';
const app = Fastify({ logger: true });


async function main() {
  await app.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.register(swaggerPlugin);

  // authentication & session
  await registerPassport(app);
  await authRoutes(app);

  //gcs & multipart
  await app.register(fastifyMultipart);
  await initGCS();

  //websocket
  await registerWebsocket(app);

  // routes
  await app.register(trpcRoute);
  await app.register(imagesRoute);
  await app.register(uploadRoute);
  
  app.listen({ port: 3001 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main();