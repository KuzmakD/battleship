import { GameModel } from './game.model';

export class GameController {
  allGames: Array<GameModel> = [];

  createNewGame(user: any, gameId: number | undefined) {
    let game: GameModel | undefined;

    if (typeof gameId === 'number') {
      game = this.getGameById(gameId);
      game?.users.push(user);
    } else {
      game = new GameModel(this.getLastGameId(this.allGames) + 1, [user]);
      this.allGames.push(game);
    }

    let data = {
      idGame: game?.id,
      idPlayer: user.index,
    };
    
    return {
      type: "create_game",
      data: JSON.stringify(data),
      id: 0
    };
  }


  getGameById(id: number): GameModel | undefined {  
    return this.allGames.find((game) => game.id === id);
  };

  getGameIndexByUserId(userId: number) {
    return this.allGames.findIndex(({ users }) => 
      users.find((user: any) => user.index === userId));
  }

  getLastGameId(games: Array<GameModel>) {
    let max = -1;
    max = Math.max(...games.map(({ id }) => id));
    return max;
  }
}
