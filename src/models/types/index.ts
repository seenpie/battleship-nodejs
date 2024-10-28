export type TUser = {
  name: string;
  password: string;
};

export type TItem<T, V> = {
  shipsData: T;
  player: V;
  playerMoves: { x: number; y: number }[];
};

export type TShipsPosition = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

export type TShipsPositionList = TShipsPosition[];

export type TClientShipsData = {
  gameId: number | string;
  ships: TShipsPositionList;
  indexPlayer: number | string;
};

export type TClientAttack = {
  gameId: number | string;
  x: number;
  y: number;
  indexPlayer: number | string;
};
