import path from 'path';
import { Storage } from "@google-cloud/storage";
import type { WebSocket } from "ws";
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || '')
});
export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
export const clients = new Set<WebSocket>();