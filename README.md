# gpti-project
 
This is a full-stack image processing where users can upload images to Google Cloud Storage via signing in with Google OAuth 2.0, which is then processed into a thumbnail. It is built with React, Google Cloud, and Fastify.

# BACKEND

- Fastify + TypeScript
- Fastify passport, websocket, tRPC, and cors
- Google OAuth, Secret Manager, Cloud Storage, and Cloud Functions
- Swagger with Orval for the SDK

# FRONTEND

- Vite + React + shadcn/ui + TypeScript
- sonner for toasts
- Gallery with thumbnail previews
- Realtime WebSocket updates

# Running Locally
1. Clone the repo
```bash
git clone https://github.com/caleb2234/gpti-project.git
cd gpti-project
```
2. Install dependencies:
```bash
cd frontend
npm install

cd ../backend
npm install
``` 
3. Configure Secret Manager with GCS information (more information in next section)
  - e.g. bucket name, client id, client secret, ...
  - Set up Application Default Credentials (ADC) to access secrets:
   ```bash
   gcloud auth application-default login
   ``` 
4. Start Backend
  - In new terminal:
   ```bash
   cd backend
   npx tsx index.ts
   ```
5. Start Frontend
  - In new terminal:
   ```bash
   cd frontend
   npm run dev
   ```
6. Start ngrok tunnel (Install ngrok if you don't have it):
  - New terminal
   ```bash
   ngrok http 3001
   ```
  - Change the websocket url to provided tunnel (in \functions\index.js and \frontend\src\Dashboard.tsx)
    - 'wss://{provided url}/ws'
  - e.g. wss://barely-diverse-pika.ngrok-free.app/ws
7. Deploy Google Cloud Function :
   ```bash
   cd functions
   gcloud functions deploy processImage \
       --runtime nodejs22 \
       --trigger-resource your-bucket-name \
       --trigger-event google.storage.object.finalize \
       --entry-point processImage \
       --region us-east1
   ```

8. Visit http://localhost:5173/
