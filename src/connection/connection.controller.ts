import { Connection } from './connection.model';

export class ConnectionController {
  connections: Array<Connection> = [];

  getConnections(): Array<Connection> {
    return this.connections;
  }

  createConnection(connection: Connection): Connection {
    this.connections.push(connection);
    return connection;
  }

  getConnectionById(id: number): Connection | undefined {
    return this.connections.find((connection) => connection.id === id);
  }

  getConnectionIndexById(id: number): number {
    return this.connections.findIndex((connection) => connection.id === id);
  }

  getConnectionByUserId(userId: number) {
    return this.connections.find((connection) => connection.userId === userId);
  }

  removeConnectionById(id: number): void {
    const connectionIndex = this.getConnectionIndexById(id);
    this.connections.splice(connectionIndex, 1);
  }

  getLastConnectionId(connections: Array<Connection>): number {
    return Math.max(-1, ...connections.map(({ id }) => +id));
  }
}
