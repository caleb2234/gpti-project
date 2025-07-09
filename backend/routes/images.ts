import { FastifyInstance } from "fastify";
import { bucket } from "../utils/gcs";
import { isAuthenticated } from "../utils/auth";


export default async function (app: FastifyInstance) {
  app.get('/images', 
    {
      preHandler: isAuthenticated,
      schema: {
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
                            },
                            required: ["name", "publicUrl"],
                        }
                    }
                },
                required: ["images"],
            },
            
        }
    },
    
    handler: async (req, reply) => {
    try {
      const [files] = await bucket.getFiles();

      const thumbFiles = files.filter(file => file.name.startsWith('thumb-'));

      const imageList = thumbFiles.map((file) => ({
        name: file.name,
        publicUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      }));

      return { images: imageList };
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Failed to list images' });
    }
  },
});}