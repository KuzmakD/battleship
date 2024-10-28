import WebSocket from 'ws';

export class Connection {
  id: number;
  userId: number = -1;
  webSocket: WebSocket;

  constructor(id: number, webSocket: WebSocket) {
    this.id = id;
    this.webSocket = webSocket;
  }
}
