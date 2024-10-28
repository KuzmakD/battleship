import { Attacks, ShipTypes } from '../utils/constants';
import { type IShip } from '../utils/types';

export class Field {
  userId: number;
  ships: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  initData: IShip[] = [];
  needUpdateKilled: any[] | null = null;

  constructor(userId: number, ships: IShip[] | undefined) {
    this.userId = userId;
    if (ships) {
      this.initData = ships;
      ships.forEach((ship) => {
        for (let i = 0; i < ship.length; i++) {
          this.ships
            [ship.position.y + (ship.direction ? i : 0)]
            [ship.position.x + (!ship.direction ? i : 0)] = ship.type;
        }
      });
    } else {
      this.addRandomShips();
    }
  }

  addRandomShips() {
    const ships = [1, 2, 3, 4];
    ships.forEach((countShips) => {
      for (let i = 0; i < countShips; i++) {
        const type: ShipTypes = this.getShipType(countShips);
        const lengthShip: number = countShips[type];

        const direction: boolean = Math.random() > 0.5;
        let goodPosition: boolean = false;
        let coordinates;
        
        while (!goodPosition) {
          coordinates = this.getRandomCoordinates();
          goodPosition = this.isGoodPlace(coordinates.x, coordinates.y, lengthShip, direction);
        }

        this.initData.push({
          position: {
            y: coordinates?.x as number,
            x: coordinates?.y as number
          },
          direction,
          length,
          type,
        });

        for (let i = 0; i < lengthShip; i++) {
          direction
            ? this.ships[coordinates?.x as number + i][coordinates?.y as number] = length
            : this.ships[coordinates?.x as number][coordinates?.y as number + i] = length;
        }


      }
    })
  }

  getShipType(countShips: number): ShipTypes {
    switch (countShips) {
      case 4:
        return ShipTypes.small;
      case 3:
        return ShipTypes.medium;
      case 2:
        return ShipTypes.large;
      case 1:
        return ShipTypes.huge;
      default:
        return ShipTypes.small;
    }
  }

  getRandomCoordinates(): {x: number, y:number} {
    return {
      x: Math.floor(Math.random() * (this.ships.length - 1)),
      y: Math.floor(Math.random() * (this.ships.length - 1)),
    }
  }

  isGoodPlace(x: number, y: number, l: number, direction: boolean) {
    if ((direction ? x + l - 1 : y + l - 1) > 9) return false;
    if (this.ships[x][y] !== 0) return false;

    for (let i = x - 1; i <= (direction ? x + l : x + 1); i++) {
      for (let j = y - 1; j <= (direction ? y + 1 : y + l); j++) {
        if (i >= 0 && j >= 0 && i <= 9 && j <= 9 && this.ships[i]) {
          if (this.ships[i][j] !== 0) return false;
        }
      }
    }

    return true;
  }

  checkShot(x: number, y: number): string {
    const ceil = this.ships[y][x];

    if (ceil === 0) {
      this.ships[y][x] = -5;
      return Attacks[0];
    }
    const isKilled = this.isKilled(x, y, ceil);

    if (ceil > 0 && ceil < 5 && isKilled.value) {
      this.ships[y][x] = ceil * -1;

      const emptyNeedToUpdate = this.getCellsAround([{ x, y }, ...isKilled.needToUpdate.map(i => { return { x: i.y, y: i.x } })]);
      this.needUpdateKilled = [...isKilled.needToUpdate, ...emptyNeedToUpdate];
      return Attacks[2]
    };
    if (ceil > 0 && ceil < 5 && this.checkNearCeils(ceil, x, y)) {
      this.ships[y][x] = ceil * -1;
      return Attacks[1]
    };
    if (ceil > 0 && ceil < 5 && !this.checkNearCeils(ceil, x, y)) {
      this.ships[y][x] = ceil * -1;
      return Attacks[2]
    };
    if (ceil < 0) {
      return Attacks[3]
    };

    return Attacks[0]
  }

  IsAlive(): boolean {
    return Array.isArray(this.ships.find((row: number[]) =>
      row.find((cell: number) => cell > 0))) ?? false;
  }

  isKilled(x: number, y: number, length: number) {
    let isKilled = length - 1;
    const needToUpdate: any = [];

    for (let i = x, j = x; i < x + length && j >= x - length + 1; i++, j--) {
      if (this.ships[y] && this.ships[y][i] && this.ships[y][i] === (length * -1)) {
        isKilled -= 1;
        needToUpdate.push({ 'x': y, 'y': i, status: Attacks[2] })
      };
      if (this.ships[y] && this.ships[y][j] && this.ships[y][j] === (length * -1)) {
        isKilled -= 1;
        needToUpdate.push({ 'x': y, 'y': j, status: Attacks[2] })
      };
    }

    if (isKilled !== 0) {
      for (let i = y, j = y; i < y + length && j >= y - length + 1; i++, j--) {
        if (this.ships[i] && this.ships[i][x] && this.ships[i][x] === (length * -1)) {
          isKilled -= 1;
          needToUpdate.push({ 'x': i, 'y': x, status: Attacks[2] })
        }
        if (this.ships[j] && this.ships[j][x] && this.ships[j][x] === (length * -1)) {
          isKilled -= 1;
          needToUpdate.push({ 'x': j, 'y': x, status: Attacks[2] })
        };
      }
    }

    return { value: isKilled === 0, needToUpdate };
  }

  checkNearCeils(l: number, x: number, y: number) {
    for (let i = x, j = x; i < x + l - 1 && j > x - l + 1; i++, j--) {
      if ((this.ships[y][i] && this.ships[y][i] === l) || (this.ships[y][j] && this.ships[y][j] === l)) return true;
    }
    for (let i = y, j = y; i < y + l - 1 && j > y - l + 1; i++, j--) {
      if ((this.ships[i][x] && this.ships[i][x] === l) || (this.ships[j][x] && this.ships[j][x] === l)) return true;
    }

    return false;
  }

  getCellsAround(values: { x: number, y: number }[]): { x: number, y: number, status: keyof typeof Attacks }[] {
    const resToUpdate: { x: number, y: number, status: keyof typeof Attacks }[] = [];
    values.forEach(ceil => {
      const { x, y } = ceil;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (!(i === 0 && j === 0)) {
            if (this.ships[y + j] && this.ships[y + j][x + i] === 0) {
              this.ships[y + j][x + i] = -5;
              resToUpdate.push({ 'x': y + j, 'y': x + i, status: Attacks[0] as keyof typeof Attacks })
            }
          }
        }
      }
    });

    return resToUpdate;
  }

  randomAttack() {
    let attackResult = 'wrongAttack';
    let x: number = -1;
    let y: number = -1;
    while(attackResult === 'wrongAttack') {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      attackResult = this.checkShot(x, y);
    }

    return {status: attackResult, x: x, y: y};
  }

  generateRandomNumber(): number {
    return Math.floor(Math.random() * 10);
  }
}