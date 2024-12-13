import { ClientShipData } from "@/ws-server/ws-server.type";
import { Coords, CoordsMap, ShipsData } from "@/features/game/game.type";
import { createCoordKey } from "@/features/game/helpers/create-coord-key";

function getAroundCoords({
  x,
  y,
  length,
  direction,
  index
}: {
  x: number;
  y: number;
  length: number;
  index: number;
  direction: boolean;
}): Coords[] {
  const aroundCoords: Coords[] = [];

  if (direction) {
    aroundCoords.push({ x: x + 1, y }, { x: x - 1, y });

    if (index === 0) {
      aroundCoords.push(
        { x, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y - 1 }
      );
    }

    if (index === length - 1) {
      aroundCoords.push(
        { x, y: y + 1 },
        { x: x + 1, y: y + 1 },
        { x: x - 1, y: y + 1 }
      );
    }
  } else {
    aroundCoords.push({ x, y: y + 1 }, { x, y: y - 1 });

    if (index === 0) {
      aroundCoords.push(
        { x: x - 1, y },
        { x: x - 1, y: y + 1 },
        { x: x - 1, y: y - 1 }
      );
    }

    if (index === length - 1) {
      aroundCoords.push(
        { x: x + 1, y },
        { x: x + 1, y: y + 1 },
        { x: x + 1, y: y - 1 }
      );
    }
  }

  return aroundCoords;
}

export function createShipsMap(ships: ClientShipData[]): ShipsData {
  const map = new Map<string, CoordsMap[]>();
  for (const {
    length,
    type,
    direction,
    position: { y: shipY, x: shipX }
  } of ships) {
    const coords: CoordsMap = {
      shipCoords: new Map(),
      aroundCoords: new Map(),
      isKilled: false
    };
    for (let i = 0; i < length; i++) {
      const x = direction ? shipX : shipX + i;
      const y = direction ? shipY + i : shipY;
      console.log(x, y);
      coords.shipCoords.set(createCoordKey({ x, y }), { x, y });

      getAroundCoords({ x, y, length, direction, index: i }).forEach(
        ({ x, y }) => {
          coords.aroundCoords.set(createCoordKey({ x, y }), { x, y });
        }
      );
    }
    console.log(coords);
    if (!map.has(type)) {
      map.set(type, [coords]);
    } else {
      map.get(type)?.push(coords);
    }
  }

  console.log(map.get("huge"));
  return map;
}
