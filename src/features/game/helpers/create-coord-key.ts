import { Coords } from "@/features/game/game.type";

export function createCoordKey({ x, y }: Coords) {
  return `${y};${x}`;
}
