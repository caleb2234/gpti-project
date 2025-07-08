import { FastifyInstance } from "fastify";
import { bucket } from "../utils/gcs";


export default async function (app: FastifyInstance) {
  app.get('/images', 
    {schema: {
        description: "Get list of images in bucket",
        tags: ["images"],
        response: {
            200: {
                type: "object",
                properties: {
                    images: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string"},
                                publicUrl: { type: "string"}
                            }
                        }
                    }
                }
            },
            500: {
                type: "object",
                properties: {
                    error: { type: "string" },

                }
            }
        }
    },
    
    handler: async (req, reply) => {
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
  },
});}