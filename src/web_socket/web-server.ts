import WebSocket from 'ws';
import dotenv from 'dotenv';
import { IncomingMessage } from 'http';

dotenv.config();

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 3000;

export const webSocketServer = async () => {
const webSocket = new WebSocket.WebSocketServer({ port: +WEBSOCKET_PORT  });

webSocket.on('connection', (socket: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>) => {
  console.log('Client connected');

  socket.on('message', (data: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>) => {
    console.log(`Received message: ${data}`);
  });

  socket.on('error', (err) => {
    console.error(`WebSocket error: ${err.message}`);
  });
});
}
