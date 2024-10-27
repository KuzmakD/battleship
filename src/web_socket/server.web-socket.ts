import WebSocket from 'ws';
// import dotenv from 'dotenv';
import { webSocketRoutes } from './routes.web-socket';

// dotenv.config();

// const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 3000;

export const webSocketServer = async () => {
const webSocket = new WebSocket.WebSocketServer({port: 3000});

webSocket.on('connection', (socket: WebSocket.Server) => {
  console.log('Client connected');

  socket.on('message', (data: WebSocket.Server) => {
    console.log(`Received message: ${data}`);
    webSocketRoutes(data, socket)
  });

  socket.on('error', (err) => {
    console.error(`WebSocket error: ${err.message}`);
  });
});
}
