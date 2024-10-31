import { Game } from './game.model';
import { Field } from '../field/field.model';
import { User } from '../user/user.model';

export class GameController {
  games: Array<Game> = [];

  createNewGame(user: any, gameId: number | undefined) {
    let game: Game | undefined;

    if (typeof gameId === 'number') {
      game = this.getGameById(gameId);
      game?.users.push(user);
    } else {
      game = new Game(this.getLastGameId(this.games) + 1, [user]);
      this.games.push(game);
    }

    const data = {
      idGame: game?.id,
      idPlayer: user.index,
    };
    
    return {
      type: "create_game",
      data: JSON.stringify(data),
      id: 0
    };
  }

  createNewGameRandom(user: User) {
    const game: Game = new Game(this.getLastGameId(this.games) + 1, [user]);  
    const data = {
      idGame: game?.id,
      idPlayer: user.id,
    };
    
    this.games.push(game);
    
    return {
      type: "create_game",
      data: JSON.stringify(data),
      id: 0
    };
  }


  getGameById(id: number): Game | undefined {  
    return this.games.find((game) => game.id === id);
  };

  getGameIndexByUserId(userId: number) {
    return this.games.findIndex(({ users }) => 
      users.find((user: any) => user.index === userId));
  }

  getLastGameId(allGames: Array<Game>) {
    return Math.max(-1, ...allGames.map(({ id }) => +id));
  }

  addField(field: Field, gameId: number): Game | undefined {
    const game = this.getGameById(gameId);
    if (game) {
      game.fields.push(field);
    }

    return game;
  }
}
