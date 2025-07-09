import { Storage } from '@google-cloud/storage';
import WebSocket from 'ws';
import sharp from 'sharp';

const storage = new Storage();

export const processImage = async (event, context) => {
  const file = event.name;
  if (file.startsWith("thumb-")) {
    return;
  }

  const bucket = storage.bucket("gpti-project-bucket");
  const tempPath = `/tmp/${file}`;
  const thumbPath = `/tmp/thumb-${file}`;
  await bucket.file(file).download({ destination: tempPath });
  await sharp(tempPath)
    .resize({ width: 200, height: 200, withoutEnlargement: true })
    .toFile(thumbPath);
  await bucket.upload(thumbPath, { destination: `thumb-${file}` });

  try {
    const ws = new WebSocket("wss://d19da8456f7c.ngrok-free.app/ws");
    ws.on('open', () => {
      console.log('✅ WS connection opened');
      ws.send(JSON.stringify({ filename: file, status: 'Processed' }));
      ws.close();
    });
  } catch (err) {
    console.error('Failed to send WS message:', err);
  }
};