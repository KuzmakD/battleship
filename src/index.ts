import { webSocketServer } from './web_socket/server.web-socket';
import { httpServer } from './http_server/http-server';
import dotenv from 'dotenv';

dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 8181;

console.log(`Start http server on the http://localhost:${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);

webSocketServer();
