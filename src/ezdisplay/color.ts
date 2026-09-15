// The LDM-6432-BLE4's color codes are plain RGB332: bits 7-5 = red (0-7),
// bits 4-2 = green (0-7), bits 1-0 = blue (0-3). Confirmed against the
// command list's worked examples (e.g. code 96 = 0b01100000 -> R=3 "red",
// code 2 = 0b00000010 -> B=2 "blue", code 4 = 0b00000100 -> G=1 "green").
export function rgb332(r: number, g: number, b: number): number {
  const clamp = (value: number, max: number) => Math.max(0, Math.min(max, Math.round(value)));
  return (clamp(r, 7) << 5) | (clamp(g, 7) << 2) | clamp(b, 3);
}

// Convenience for standard 8-bit-per-channel RGB (e.g. from a color picker).
export function rgb888ToColorCode(r: number, g: number, b: number): number {
  return rgb332(r >> 5, g >> 5, b >> 6);
}

export const COLOR = {
  BLACK: rgb332(0, 0, 0),
  RED: rgb332(7, 0, 0),
  GREEN: rgb332(0, 7, 0),
  BLUE: rgb332(0, 0, 3),
  CYAN: rgb332(0, 7, 3),
  MAGENTA: rgb332(7, 0, 3),
  YELLOW: rgb332(7, 7, 0),
  WHITE: rgb332(7, 7, 3),
} as const;
