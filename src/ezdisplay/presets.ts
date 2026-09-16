// Predefined single/two-line messages for one-tap display on the
// LDM-6432-BLE4 (confirmed 64x32 px - see product listings, Lumex's own
// datasheet doesn't state it). The 8x16 font is an 8px-wide x 16px-tall
// glyph, so the physical panel only ever fits an 8-character x 2-line grid
// (64/8 = 8 columns, 32/16 = 2 rows) - every preset below is kept inside
// that grid so it renders exactly as authored instead of getting silently
// cut off or wrapped by the module.
export const MAX_CHARS_PER_LINE_8X16 = 8;
export const MAX_LINES_8X16 = 2;

export interface DisplayPreset {
  id: string;
  // Shown on the preset button in the app; can be longer/friendlier than
  // what actually fits on the panel.
  label: string;
  // What actually gets written to the display, one entry per 8x16 text
  // row (max 2), each already fitted to MAX_CHARS_PER_LINE_8X16.
  lines: string[];
}

export const DISPLAY_PRESETS: DisplayPreset[] = [
  { id: 'stop', label: 'STOP', lines: ['STOP'] },
  { id: 'slow-vehicle', label: 'SLOW MOVING VEHICLE', lines: ['SLOW', 'VEHICLE'] },
  { id: 'student-driver', label: 'STUDENT DRIVER', lines: ['STUDENT', 'DRIVER'] },
  { id: 'wide-load', label: 'WIDE LOAD', lines: ['WIDE', 'LOAD'] },
  { id: 'braking', label: 'BRAKING', lines: ['BRAKING'] },
  { id: 'turning-left', label: 'TURNING LEFT', lines: ['TURNING', 'LEFT'] },
  { id: 'turning-right', label: 'TURNING RIGHT', lines: ['TURNING', 'RIGHT'] },
  { id: 'hazard', label: 'HAZARD', lines: ['HAZARD'] },
  { id: 'thank-you', label: 'THANK YOU', lines: ['THANK', 'YOU'] },
  { id: 'sorry', label: 'SORRY', lines: ['SORRY'] },
];

// Fails fast (at import time, so a test or app boot catches it immediately)
// if a future edit adds a preset that the 8x16 grid can't actually show.
for (const preset of DISPLAY_PRESETS) {
  if (preset.lines.length === 0 || preset.lines.length > MAX_LINES_8X16) {
    throw new Error(
      `Preset "${preset.id}" has ${preset.lines.length} lines; the 8x16 font on this display only fits ${MAX_LINES_8X16}.`,
    );
  }
  for (const line of preset.lines) {
    if (line.length > MAX_CHARS_PER_LINE_8X16) {
      throw new Error(
        `Preset "${preset.id}" line "${line}" is ${line.length} chars; the 8x16 font on this display only fits ${MAX_CHARS_PER_LINE_8X16} per line.`,
      );
    }
  }
}
