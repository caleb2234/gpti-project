import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import fastifyPassport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fastifyMultipart from '@fastify/multipart';
import { Storage } from '@google-cloud/storage';
import path from 'path';

dotenv.config();


const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS || '')
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

const app = Fastify();

async function main() {
  await app.register(fastifyMultipart);
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
      reply.redirect('http://localhost:5173/dashboard')
    }
  );

  app.get('/', async () => {
    return { message: 'Backend is running!' };
  });
  app.get('/images', async (req, reply) => {
    try {
      const [files] = await bucket.getFiles();

      const imageList = files.map((file) => {
        return {
          name: file.name,
          publicUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        };
      });

      return { images: imageList };
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Failed to list images' });
    }
  });

  app.post('/upload', async (req, reply) => {
    const parts = req.parts();
    const imagePart = await parts.next();

    if (imagePart.done || imagePart.value?.file === undefined) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const file = imagePart.value.file;
    const filename = `${Date.now()}-${imagePart.value.filename}`;
    const gcsFile = bucket.file(filename);

    const stream = gcsFile.createWriteStream({
      resumable: false,
      contentType: imagePart.value.mimetype
    });

    await new Promise((resolve, reject) => {
      file.pipe(stream)
        .on('finish',resolve)
        .on('error',reject);
    })

    return {
      filename,
      status: "Uploaded to GCS",
    };
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