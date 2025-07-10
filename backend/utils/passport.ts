import { FastifyInstance } from "fastify";
import fastifyPassport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';
import { getSecret } from '../utils/secrets';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';



export default async function registerPassport(app : FastifyInstance) {
    await app.register(fastifySecureSession, {
    key: await getSecret("SESSION_SECRET"),
    cookie: {
    path: '/',
    httpOnly: true,
    },
    });
    await app.register(fastifyPassport.initialize());
    await app.register(fastifyPassport.secureSession());
    fastifyPassport.use('google', new GoogleStrategy(
    {
        clientID: await getSecret("GOOGLE_CLIENT_ID"),
        clientSecret: await getSecret("GOOGLE_CLIENT_SECRET"),
        callbackURL: await getSecret("GOOGLE_CALLBACK_URL"),
    },
    async function (_accessToken, _refreshToken, profile, done){
        done(null,profile);
    }
    ));

    fastifyPassport.registerUserSerializer(async (user) => user);
    fastifyPassport.registerUserDeserializer(async (user) => user);
}