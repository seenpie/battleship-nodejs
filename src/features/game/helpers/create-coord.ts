import { Coords } from "@/features/game/game.type";
import { Move } from "@/features/game/game.entity";

let cachedAllCoords: Coords[] | null = null;

export function createCoord({ x, y }: Coords) {
  return `${y};${x}`;
}

function generateAllCoords(): Coords[] {
  const coords = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      coords.push({ x, y });
    }
  }

  const shuffledArray = shuffleArray(coords);
  cachedAllCoords = shuffledArray;
  return shuffledArray;
}

function shuffleArray(array: Coords[]): Coords[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function getRandomCoord(moves: Move[]): Coords {
  const allCoords = cachedAllCoords || generateAllCoords();
  const usedCoords = new Set<string>(
    moves.map((move) =>
      createCoord({ x: move.attackData.x, y: move.attackData.y })
    )
  );

  for (const coord of allCoords) {
    const { x, y } = coord;
    if (!usedCoords.has(createCoord({ x, y }))) {
      return coord;
    }
  }

  throw new Error("No more available coordinates");
}
