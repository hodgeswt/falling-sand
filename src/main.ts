import { getConfig, GrainColorMode } from "./config";
import { colorGrade, gridPosToCoords, CellType, getRainbowColor } from "./utils";
import {
  addGrain,
  Coords,
  getWorldSize,
  newWorld,
  updateGrainPositions,
  World,
} from "./world";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const canvasContainer = document.getElementById(
  "game-container"
) as HTMLElement;

let world: World = newWorld({ width: 0, height: 0 }, { width: 0, height: 0 });
let firstLoop = true;

const resetWorld = () => {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  firstLoop = true;

  const [gridSize, canvasSize] = getWorldSize(
    canvas.width,
    canvas.height,
    getConfig().grainSize
  );

  world = newWorld(gridSize, canvasSize);
};

resetWorld();

window.addEventListener("resize", resetWorld);

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => resetWorld());
}

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
  const config = getConfig();

  // Prevent running too fast
  if (dt < config.tickSpeed) {
    window.requestAnimationFrame(gameLoop);
    return;
  }
  prevTime = time;

  let grainAdded = false;
  if (pointerDown) {
    grainAdded = true;
    addGrain(world, pointerCoords);
  }

  // Don't repaint unless:
  // 1. This is our first render
  // 2. We've added a grain
  // 3. Our grains have moved
  if (!updateGrainPositions(world, dt) && !grainAdded && !firstLoop) {
    window.requestAnimationFrame(gameLoop);
    return;
  }

  firstLoop = false;

  for (let x = 0; x < world.size.width; x++) {
    for (let y = 0; y < world.size.height; y++) {
      // Paint our grains
      if (world.grid[x][y] === CellType.GRAIN) {
        const coords = gridPosToCoords(world, { x: x, y: y });
        if (ctx) {
          let fillColor = world.colorCache[x][y];
          if (fillColor === "") {
            if (config.grainColorMode === GrainColorMode.STATIC) {
              world.colorCache[x][y] = colorGrade(config.grainBaseColor);
              fillColor = colorGrade(config.grainBaseColor);
            } else {
              const c = getRainbowColor();
              world.colorCache[x][y] = c;
              fillColor = c;
            }

          }
          ctx.fillStyle = fillColor;
          ctx.fillRect(coords.x, coords.y, config.grainSize, config.grainSize);
        }
      }
      // Paint our ground
      else if (world.grid[x][y] === CellType.GROUND) {
        const coords = gridPosToCoords(world, { x: x, y: y });
        if (ctx) {
          ctx.fillStyle = config.groundColor;
          ctx.fillRect(coords.x, coords.y, config.grainSize, config.grainSize);
        }
      }
      // Clear empty cells
      else if (world.grid[x][y] === CellType.EMPTY) {
        const coords = gridPosToCoords(world, { x: x, y: y });
        if (ctx) {
          ctx.fillStyle = config.emptyColor;
          ctx.fillRect(coords.x, coords.y, config.grainSize, config.grainSize);
        }
      }
    }
  }

  window.requestAnimationFrame(gameLoop);
};

// Start game
window.requestAnimationFrame(gameLoop);
