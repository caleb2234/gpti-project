import { Storage } from "@google-cloud/storage";
import type { WebSocket } from "ws";
import { getSecret } from './secrets';


export let bucket: ReturnType<Storage['bucket']>;
export const clients = new Set<WebSocket>();

export async function initGCS() {
  const bucketName = await getSecret("GCS_BUCKET_NAME");

  const storage = new Storage();

  bucket = storage.bucket(bucketName);
}