import { join, dirname } from 'node:path';
import fs from 'node:fs/promises';
import { User } from './user.model';

export class UserController {
  pathToUsersDB: string = join(dirname(__dirname), './db/db.json');

  async getUsers(): Promise<User[]> {    
    console.log('pathUserFile: ', this.pathToUsersDB);
    
    const data = await fs.readFile(this.pathToUsersDB);
    const users: User[] = JSON.parse(data.toString());
    return users;
  }

  async getUserById(userId: number): Promise<User | undefined> {
    const users: User[] = await this.getUsers();
    const user = users.find((user) => user.id === userId);
    return user;
  }

  async getWinnersInfo() {
    const users: User[] = await this.getUsers();
    const data = users.sort(this.sort).map((user) => {
      return { name: user.name, wins: user.wins };
    });
    
    return JSON.stringify({
      type: 'update_winners',
      data: JSON.stringify(data),
      id: 0
    });
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const users: User[] = await this.getUsers();
    const user = users.find((user) => user.name === name);
    return user;
  }

  async login(user: User) {

  }

  async updateUser(userId: number) {
    const users: User[] = await this.getUsers();
    const user = users.find((user) => user.id === userId);
    if (user) {
      ++user.wins;
      await fs.writeFile(this.pathToUsersDB, JSON.stringify(users));
    }
  }

  getLastUserId(users: Array<User>) {
    let max = -1;
    max = Math.max(...users.map(({ id }) => id));
    return max;
  }

  sort(a: User, b: User) {
    return b.wins - a.wins;
  }
}
 