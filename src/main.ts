import {
  CellType,
  EMPTY_COLOR,
  GRAIN_BASE_COLOR,
  GRAIN_SIZE,
  GROUND_COLOR,
} from "./constants";
import { colorGrade, gridPosToCoords } from "./utils";
import {
  addGrain,
  Coords,
  getWorldSize,
  newWorld,
  updateGrainPositions,
  World,
} from "./world";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const canvasContainer = document.getElementById("game-container");
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;

let worldSize = getWorldSize(canvas.width, canvas.height, GRAIN_SIZE);
let world: World = newWorld(worldSize[0], worldSize[1]);

let pointerDown: boolean = false;
let pointerCoords: Coords = { x: 0, y: 0 };

window.addEventListener("pointerdown", (event: PointerEvent) => {
  pointerDown = true;
});

window.addEventListener("pointerup", (event: PointerEvent) => {
  pointerDown = false;
});

window.addEventListener("pointermove", (event: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  pointerCoords = { x: x, y: y };
});

let prevTime: number = 0.0;

const ctx = canvas.getContext("2d");

/**
 * Main game loop
 * @param time Current time
 * @returns Nothing
 */
const gameLoop = (time: number) => {
  const dt = time - prevTime;
  if (dt < 25) {
    window.requestAnimationFrame(gameLoop);
    return;
  }
  prevTime = time;

  if (pointerDown) {
    addGrain(world, pointerCoords);
  }

  updateGrainPositions(world, dt);

  for (let x = 0; x < world.size.width; x++) {
    for (let y = 0; y < world.size.height; y++) {
      if (world.grid[x][y] === CellType.GRAIN) {
        const coords = gridPosToCoords(world, { x: x, y: y });
        if (ctx) {
          let fillColor = world.colorCache[x][y];
          console.log(fillColor);
          if (fillColor === '') {
            world.colorCache[x][y] = colorGrade(GRAIN_BASE_COLOR);
            fillColor = colorGrade(GRAIN_BASE_COLOR);
          }
          ctx.fillStyle = fillColor;
          ctx.fillRect(coords.x, coords.y, GRAIN_SIZE, GRAIN_SIZE);
        }
      } else if (world.grid[x][y] === CellType.GROUND) {
        const coords = gridPosToCoords(world, { x: x, y: y });
        if (ctx) {
          ctx.fillStyle = GROUND_COLOR;
          ctx.fillRect(coords.x, coords.y, GRAIN_SIZE, GRAIN_SIZE);
        }
      } else if (world.grid[x][y] === CellType.EMPTY) {
        const coords = gridPosToCoords(world, { x: x, y: y });
        if (ctx) {
          ctx.fillStyle = EMPTY_COLOR;
          ctx.fillRect(coords.x, coords.y, GRAIN_SIZE, GRAIN_SIZE);
        }
      }
    }
  }

  window.requestAnimationFrame(gameLoop);
};

// Start game
window.requestAnimationFrame(gameLoop);
