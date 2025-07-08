import { FastifyInstance } from "fastify";
import { OPEN } from 'ws';
import { bucket, clients } from "../utils/gcs";


export default async function (app: FastifyInstance) {
  app.post("/upload", {
    schema: {
      description: "Upload an image to GCS",
      tags: ["images"],
      response: {
        200: {
          type: "object",
          properties: {
            filename: { type: "string" },
            status: { type: "string" },
          },
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    handler: async (req, reply) => {
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
        });

        setTimeout(() => {
        for (const ws of clients) {
            if (ws.readyState === OPEN) {
            ws.send(JSON.stringify({ filename, status: 'Processed' }));
            }
        }
        }, 3000);

        return {
            filename,
            status: "Uploaded to GCS",
        };
    },
  });
}