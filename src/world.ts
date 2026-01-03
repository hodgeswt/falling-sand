import { getConfig } from "./config";
import { coordsToGridPos, CellType } from "./utils";

/**
 * A generic size representing a width + height
 */
export type Size = {
  width: number;
  height: number;
};

/**
 * Coordinates
 */
export type Coords = {
  x: number;
  y: number;
};

/**
 * The main game object
 */
export type World = {
  /** The grid representing where grains of sand are */
  grid: number[][];

  /** Caching colors for a square to prevent flicker */
  colorCache: string[][];

  /** The size of the world */
  size: Size;

  /** The actual size of the canvas */
  canvasSize: Size;
};

/**
 * Given a size, generates a new World
 * @param dims - The dimensions of the grid
 * @returns The world object
 */
export const newWorld = (dims: Size, canvasSize: Size): World => {
  const grid: number[][] = [];
  const colorCache: string[][] = [];
  for (let x = 0; x < dims.width; x++) {
    grid[x] = [];
    colorCache[x] = [];
    for (let y = 0; y < dims.height; y++) {
      grid[x][y] = CellType.EMPTY;
      colorCache[x][y] = "";
      if (y === dims.height - 1) {
        grid[x][y] = CellType.GROUND;
      }
    }
  }

  return {
    grid: grid,
    colorCache: colorCache,
    size: dims,
    canvasSize: canvasSize,
  };
};

/**
 * Computes world size from canvas + grain size
 * @param canvasWidth - The width of the canvas
 * @param canvasHeight - The height of the canvas
 * @param grainSize - The width/height of a grain of sand
 * @returns The dimensions of the grid representing the world
 */
export const getWorldSize = (
  canvasWidth: number,
  canvasHeight: number,
  grainSize: number
): [gridSize: Size, canvasSize: Size] => {
  const worldWidth = Math.floor(canvasWidth / grainSize);
  const worldHeight = Math.floor(canvasHeight / grainSize);
  return [
    { width: worldWidth, height: worldHeight },
    { width: canvasWidth, height: canvasHeight },
  ];
};

/**
 * Add a grain at the coords
 * @param world The game object
 * @param clickCoords Where the click originated
 */
export const addGrain = (world: World, clickCoords: Coords) => {
  const gridPos = coordsToGridPos(world, clickCoords);
  if (
    gridPos.x >= 0 &&
    gridPos.x < world.size.width &&
    gridPos.y >= 0 &&
    gridPos.y < world.size.height &&
    world.grid[gridPos.x][gridPos.y] !== CellType.GROUND
  ) {
    world.grid[gridPos.x][gridPos.y] = CellType.GRAIN;
  }
};

/**
 * Determines if coordinates are valid in-game
 * @param world Game object
 * @param coords Coordinates to check
 * @returns If the coordinates are valid
 */
const isValidCoord = (world: World, coords: Coords): boolean => {
  if (coords.x < 0 || coords.x >= world.grid.length) {
    return false;
  }

  if (coords.y < 0 || coords.y >= world.grid[0].length) {
    return false;
  }

  return true;
};

/**
 * Updates all the grain positions in the world
 * @param world Game object
 * @param dt Time since last tick
 * @returns Boolean indicating if change has occurred
 */
export const updateGrainPositions = (world: World, dt: number): boolean => {
  if (dt <= 0) {
    return false;
  }

  let o = false;
  for (let x = 0; x < world.size.width; x++) {
    for (let y = world.size.height - 1; y >= 0; y--) {
      if (!isValidCoord(world, { x: x, y: y })) {
        continue;
      }

      if (world.grid[x][y] !== CellType.GRAIN) {
        continue;
      }

      // If we can go straight down, do so
      if (
        isValidCoord(world, { x: x, y: y + 1 }) &&
        world.grid[x][y + 1] === CellType.EMPTY
      ) {
        world.grid[x][y] = CellType.EMPTY;
        world.grid[x][y + 1] = CellType.GRAIN;
        o = true;
        continue;
      }

      // Otherwise, see if we can go left/right
      const direction = Math.floor(Math.random() * 2);
      if (
        direction === 1 &&
        isValidCoord(world, { x: x + 1, y: y + 1 }) &&
        world.grid[x + 1][y + 1] === CellType.EMPTY
      ) {
        world.grid[x][y] = CellType.EMPTY;
        world.grid[x + 1][y + 1] = CellType.GRAIN;
        o = true;
        continue;
      }

      if (
        isValidCoord(world, { x: x - 1, y: y + 1 }) &&
        world.grid[x - 1][y + 1] === CellType.EMPTY
      ) {
        world.grid[x][y] = CellType.EMPTY;
        world.grid[x - 1][y + 1] = CellType.GRAIN;
        o = true;
        continue;
      }

      // Otherwise, do nothing
    }
  }

  return o;
};
