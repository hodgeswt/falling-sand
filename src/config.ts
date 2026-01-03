export const resetConfigToDefault = () => {
  updateConfig(defaultConfig);
};
import { defined, isDarkMode, isType } from "./utils";

export enum GrainColorMode {
  STATIC = 'Static',
  RAINBOW = 'Rainbow'
}

export type Config = {
  grainSize: number;
  grainColorMode: GrainColorMode;
  grainBaseColor: string;
  groundColor: string;
  emptyColor: string;
  colorVariation: number;
  tickSpeed: number;
}

const isConfig = (obj: any): obj is Config => {
  if (!defined(obj)) {
    return false;
  }

  return (
    isType(obj.grainSize, 'number')
    && isType(obj.grainColorMode, 'string')
    && isType(obj.grainBaseColor, 'string')
    && isType(obj.groundColor, 'string')
    && isType(obj.emptyColor, 'string')
    && isType(obj.colorVariation, 'number')
    && isType(obj.tickSpeed, 'number')
  )
}

const defaultConfig = {
  grainSize: 20,
  grainColorMode: GrainColorMode.RAINBOW,
  grainBaseColor: '#E1C16E',
  groundColor: '#6E260E',
  emptyColor: isDarkMode() ? '#181818' : '#ffffff',
  colorVariation: 12,
  tickSpeed: 25,
} as Config;

let config = defaultConfig;
let configLoaded = false;

const configKey = 'CONFIGURATION';

export const updateConfig = (newConfig: Config) => {
  localStorage.setItem(configKey, JSON.stringify(newConfig));
  config = newConfig;
}

export const getConfig = (): Config => {
  if (configLoaded) {
    return config;
  }

  const savedConfig = localStorage.getItem(configKey);
  try {
    const loadedConfig = JSON.parse(savedConfig);
    if (isConfig(loadedConfig)) {
      config = loadedConfig;
      configLoaded = true;
      return config;
    } else {
      updateConfig(config);
      return defaultConfig;
    }
  } catch {
    updateConfig(config);
    return config;
  }
}

window.matchMedia('(prefers-color-scheme: dark)').matches && (() => {
  const newConfig = getConfig();
  newConfig.emptyColor = '#181818';
  updateConfig(newConfig);

})();
