import { webSocketServer } from './web_socket/web-server';
import { httpServer } from './http_server/http-server';
import dotenv from 'dotenv';

dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 8181;

console.log(`Start static http server on the http://localhost:${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);

webSocketServer();
