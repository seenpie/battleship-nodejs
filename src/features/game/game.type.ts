export type CoordsMap = {
  shipCoords: Map<string, Coords>;
  aroundCoords: Map<string, Coords>;
  isKilled: boolean;
};
export type ShipsData = Map<string, CoordsMap[]>;
export type Coords = { x: number; y: number };
