import { COLOR_VARIATION } from "./constants";
import { Coords, World } from "./world";

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

  const gradeChannel = (channel: number): number => {
    const change = Math.random() * COLOR_VARIATION * 2 - COLOR_VARIATION;
    const newChannel = Math.round(channel + change);

    return Math.max(0, Math.min(255, newChannel));
  }

  const o = `#${toHex(gradeChannel(r))}${toHex(gradeChannel(g))}${toHex(gradeChannel(b))}`;
  console.log('new color' + o)
  return o;
}