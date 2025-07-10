import websocketPlugin from "@fastify/websocket";
import type { WebSocket } from 'ws';
import { OPEN } from "ws";
import { FastifyInstance } from "fastify";
import { clients } from "../utils/gcs";


export default async function registerWebsocket(app:FastifyInstance) {
    await app.register(websocketPlugin);
    app.get(
        '/ws',
        { websocket: true },
        (socket: WebSocket, _req) => {
        clients.add(socket);

        socket.on('message', msg => {
            app.log.info('Received via WS:', msg);
        for (const client of clients) {
            if (client.readyState === OPEN) {
            client.send(msg.toString());
            }
        }
        });
        socket.on('close', () => {
            clients.delete(socket);
        });
        }
    );
}