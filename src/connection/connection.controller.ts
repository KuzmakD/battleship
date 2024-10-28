import { Connection } from './connection.model';

export class ConnectionController {
  connections: Array<Connection> = [];

  getConnections(): Array<Connection> {
    return this.connections;
  }

  saveNewConnection(connection: Connection) {
    this.connections.push(connection);
    return connection;
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
    let max = -1;
    console.log('connectionsId = ', connections.map(({ id }) => id));
    max = Math.max(...connections.map(({ id }) => id));
    return max;
  }
}
