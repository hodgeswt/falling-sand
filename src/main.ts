import { getConfig, GrainColorMode, resetConfigToDefault } from "./config";
import { updateConfig } from "./config";
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
let modalOpen = false;

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
  if (pointerDown && !modalOpen) {
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

// --- Config Modal Logic ---
const openBtn = document.getElementById("open-config-modal") as HTMLButtonElement;
const modal = document.getElementById("config-modal") as HTMLDivElement;
const form = document.getElementById("config-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-modal") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-default-config") as HTMLButtonElement;

// Info modal elements
const infoBtn = document.getElementById("open-info-modal") as HTMLButtonElement;
const infoModal = document.getElementById("info-modal") as HTMLDivElement;
const closeInfoBtn = document.getElementById("close-info-modal") as HTMLButtonElement;
infoBtn.addEventListener("click", () => {
  modalOpen = true;
  infoModal.style.display = "flex";
});

closeInfoBtn.addEventListener("click", () => {
  modalOpen = false;
  infoModal.style.display = "none";
});
resetBtn.addEventListener("click", () => {
  resetConfigToDefault();
  hideModal();
  resetWorld();
});

function showModal() {
  modalOpen = true;
  const config = getConfig();
  (form.elements.namedItem("grainSize") as HTMLInputElement).value = config.grainSize.toString();
  (form.elements.namedItem("grainColorMode") as HTMLSelectElement).value = config.grainColorMode;
  (form.elements.namedItem("grainBaseColor") as HTMLInputElement).value = config.grainBaseColor;
  (form.elements.namedItem("groundColor") as HTMLInputElement).value = config.groundColor;
  (form.elements.namedItem("emptyColor") as HTMLInputElement).value = config.emptyColor;
  (form.elements.namedItem("colorVariation") as HTMLInputElement).value = config.colorVariation.toString();
  modal.style.display = "flex";
}

function hideModal() {
  modalOpen = false;
  modal.style.display = "none";
}

openBtn.addEventListener("click", showModal);
cancelBtn.addEventListener("click", hideModal);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const config = getConfig();
  const newConfig = {
    grainSize: parseInt((form.elements.namedItem("grainSize") as HTMLInputElement).value),
    grainColorMode: (form.elements.namedItem("grainColorMode") as HTMLSelectElement).value as GrainColorMode,
    grainBaseColor: (form.elements.namedItem("grainBaseColor") as HTMLInputElement).value,
    groundColor: (form.elements.namedItem("groundColor") as HTMLInputElement).value,
    emptyColor: (form.elements.namedItem("emptyColor") as HTMLInputElement).value,
    colorVariation: parseInt((form.elements.namedItem("colorVariation") as HTMLInputElement).value),
    tickSpeed: config.tickSpeed, // keep tickSpeed unchanged
  };
  updateConfig(newConfig);
  hideModal();
  resetWorld();
});
