import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

export default fp(async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "GPTI Project",
        description: "Backend API for image uploader",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3001" }],
    },
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list" },
  });
});