/**
 * @format
 */

import {
  DISPLAY_PRESETS,
  MAX_CHARS_PER_LINE_8X16,
  MAX_LINES_8X16,
} from '../src/ezdisplay/presets';
import { buildPresetCommands, PRESET_RENDERS } from '../src/ezdisplay/render';
import { clearDisplay, write8x16String } from '../src/ezdisplay/commands';

describe('display presets', () => {
  it('defines exactly 10 presets', () => {
    expect(DISPLAY_PRESETS).toHaveLength(10);
  });

  it('has unique ids', () => {
    const ids = DISPLAY_PRESETS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every preset within the 64x32 8x16-font grid', () => {
    for (const preset of DISPLAY_PRESETS) {
      expect(preset.lines.length).toBeGreaterThan(0);
      expect(preset.lines.length).toBeLessThanOrEqual(MAX_LINES_8X16);
      for (const line of preset.lines) {
        expect(line.length).toBeLessThanOrEqual(MAX_CHARS_PER_LINE_8X16);
      }
    }
  });

  it('builds a clear-then-write command sequence per preset', () => {
    const preset = DISPLAY_PRESETS[0];
    const commands = buildPresetCommands(preset);
    expect(commands[0]).toBe(clearDisplay());
    preset.lines.forEach((line, row) => {
      expect(commands[row + 1]).toBe(write8x16String(row, 0, line));
    });
    expect(commands).toHaveLength(preset.lines.length + 1);
  });

  it('precomputes commands once at module load for every preset', () => {
    expect(PRESET_RENDERS).toHaveLength(DISPLAY_PRESETS.length);
    PRESET_RENDERS.forEach(({ preset, commands }) => {
      expect(commands).toEqual(buildPresetCommands(preset));
    });
  });
});
