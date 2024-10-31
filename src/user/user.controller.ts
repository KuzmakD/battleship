import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ConnectionController } from '../connection/connection.controller';
import { User } from './user.model';

export class UserController {
  pathToUsersDB: string = join(dirname(__dirname), './db/db.json');

  async getUsers(): Promise<User[]> {
    const data = await fs.readFile(this.pathToUsersDB);
    const users: User[] = JSON.parse(data.toString());
    return users;
  }

  async getUserById(userId: number): Promise<User | undefined> {
    const users: User[] = await this.getUsers();
    const user = users.find(({ id }) => id === userId);
    return user;
  }

  async getWinnersInfo() {
    const users: User[] = await this.getUsers();
    const data = users.sort(this.sort).map(({ name, wins }) => {
      return { name, wins };
    });

    return JSON.stringify({
      type: 'update_winners',
      data: JSON.stringify(data),
      id: 0,
    });
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const users: User[] = await this.getUsers();
    const user = users.find((user) => user.name === name);
    return user;
  }

  async login(user: User, cc: ConnectionController, connectionId: number) {
    let userId: number;
    let message: string;
    const users: User[] = await this.getUsers();
    const userDb = await this.getUserByName(user.name);

    if (userDb) {
      userId = userDb.id;
      const data = {
        name: user.name,
        index: user.id,
        error: false,
        errorText: '',
      };

      if (user.password !== userDb.password) {
        data.error = true;
        data.errorText = 'Incorrect password';
      } else {
        if (cc.getConnectionByUserId(userDb.id)) {
          data.error = true;
          data.errorText = 'The User already logged in';
        }
        const connectionIndex: number = cc.getConnectionIndexById(connectionId);
        cc.connections[connectionIndex].userId = userId;
      }
      message = JSON.stringify({
        type: 'reg',
        data: JSON.stringify(data),
        id: 0,
      });
    } else {
      user.id = this.getLastUserId(users) + 1;
      userId = user.id;
      user.wins = 0;
      users.push(user);

      message = JSON.stringify({
        type: 'reg',
        data: JSON.stringify({
          name: user.name,
          index: user.id,
          error: false,
          errorText: '',
        }),
        id: 0,
      });
      await fs.writeFile(this.pathToUsersDB, JSON.stringify(users));
      const connectionIndex: number = cc.getConnectionIndexById(connectionId);
      cc.connections[connectionIndex].userId = userId;
    }

    return message;
  }

  async updateUser(userId: number) {
    const users: User[] = await this.getUsers();
    const user = users.find((user) => user.id === userId);

    if (user) {
      ++user.wins;
      await fs.writeFile(this.pathToUsersDB, JSON.stringify(users));
    }
  }

  getLastUserId(allUsers: Array<User>) {
    return Math.max(-1, ...allUsers.map(({ id }) => +id));
  }

  sort(a: User, b: User) {
    return b.wins - a.wins;
  }
}
