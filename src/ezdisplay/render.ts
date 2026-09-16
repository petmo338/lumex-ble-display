// Turns a DisplayPreset into the exact AT command sequence the module needs
// to show it: clear whatever's on screen, then write each line. Building
// this from raw text every tap would be cheap either way, but since presets
// are static we precompute PRESET_RENDERS once at module load - tapping a
// button just replays an already-built array instead of re-deriving it.
import { clearDisplay, write8x16String } from './commands';
import { DISPLAY_PRESETS, DisplayPreset } from './presets';

export function buildPresetCommands(preset: DisplayPreset): string[] {
  return [
    clearDisplay(),
    ...preset.lines.map((line, row) => write8x16String(row, 0, line)),
  ];
}

export interface PresetRender {
  preset: DisplayPreset;
  commands: string[];
}

export const PRESET_RENDERS: PresetRender[] = DISPLAY_PRESETS.map(preset => ({
  preset,
  commands: buildPresetCommands(preset),
}));
