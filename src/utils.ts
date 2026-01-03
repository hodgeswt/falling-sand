import { getConfig } from "./config";
import { Coords, World } from "./world";

export enum CellType {
  EMPTY = 0,
  GRAIN = 1,
  GROUND = 2,
}

/**
 * Primitive types in JavaScript/TypeScript
 */
export type Primitive = string | number | boolean;

/**
 * Check if object is not null/undefined
 * @param obj Object to check
 * @returns True if object is not null/undefined
 */
export const defined = (obj: any): obj is Object => {
  return obj !== undefined && obj !== null;
}

/**
 * Check if object is of primitive type
 * @param obj Object to check
 * @param t Type to validate
 * @returns Boolean indicating if object is of type
 */
export const isType = <T extends Primitive>(obj: any, t: T): obj is T => {
  return defined(obj) && typeof obj === t;
}

/**
 * Convert canvas coords to grid position
 * @param game Game object
 * @param coords Click coordinates
 * @returns Grid coordinates
 */
export const coordsToGridPos = (game: World, coords: Coords): Coords => {
  return {
    x: Math.floor((coords.x / game.canvasSize.width) * game.size.width),
    y: Math.floor((coords.y / game.canvasSize.height) * game.size.height),
  };
};

/**
 * Convert grid position to canvas coords
 * @param game Game object
 * @param gridPos Grid coordinates
 * @returns Click coordinates
 */
export const gridPosToCoords = (game: World, gridPos: Coords): Coords => {
  return {
    x: (gridPos.x / game.size.width) * game.canvasSize.width,
    y: (gridPos.y / game.size.height) * game.canvasSize.height,
  };
};

/**
 * Converts a number to a hex value
 * @param n Number to convert
 * @returns Hex version of number
 */
const toHex = (n: number): string => {
  return n.toString(16).padStart(2, '0');
}

/**
 * Get 0-255 in hex
 * @returns 0-255 in hex
 */
const getRandChannel = (): string => {
  return toHex(Math.max(0, Math.min(255, Math.round(Math.random() * 255))));
}

/**
 * Get a random RGB hex string
 * @returns Random RGB hex value
 */
export const getRainbowColor = (): string => {
  const r = getRandChannel();
  const g = getRandChannel();
  const b = getRandChannel();

  return `#${r}${g}${b}`;
}

/**
 * Slightly vary a color
 * @param color Color to vary
 * @returns Varied color
 */
export const colorGrade = (color: string): string => {
  const hex = color.replace('#', '');

  if (hex.length < 6) {
    return color;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const config = getConfig();

  const gradeChannel = (channel: number): number => {
    const change = Math.random() * config.colorVariation * 2 - config.colorVariation;
    const newChannel = Math.round(channel + change);

    return Math.max(0, Math.min(255, newChannel));
  }

  return `#${toHex(gradeChannel(r))}${toHex(gradeChannel(g))}${toHex(gradeChannel(b))}`;
}

/**
 * Check if user prefers dark mode
 * @returns True if user prefers dark mode
 */
export const isDarkMode = (): boolean => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}