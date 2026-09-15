// AT command set for the Lumex ezDisplay family (covers the LDM-6432-BLE4),
// transcribed from Lumex's "ezDisplay Command List v2.0" (HEX & AT reference,
// https://www.lumex.com/product-detail/ezDisplay). Every command below has a
// matching HEX opcode for the raw UART/HEX mode; only the AT (ASCII) form is
// implemented here since that's what's practical to send from a phone app.
//
// Protocol shape, per the datasheet's own worked examples:
//   at<code>=(arg1,arg2,...)
// e.g. "atf2=(8)" sets brightness to 8. The module answers with a single
// 'E' ("available") byte once it's ready for the next command - callers
// that care about flow control should watch the notify characteristic for
// that byte before sending the next one, especially for bulk image data.
//
// NOTE: the exact GATT service/characteristic UUIDs for the BLE4 variant
// are not published by Lumex - use the Inspector screen in this app to
// discover them from the physical module, since they aren't in the datasheet.

export type AtArg = number | string;

export function atCommand(code: string, args: AtArg[] = []): string {
  return `at${code}=(${args.join(',')})`;
}

export const EZ_CODE = {
  // Character mode
  SET_BACKGROUND_COLOR: 'ec',
  SET_CHARACTER_COLOR: 'ef',
  WRITE_5X7_CHAR: '80',
  WRITE_5X7_STRING: '81',
  WRITE_8X16_CHAR: '82',
  WRITE_8X16_STRING: '83',

  // Graphic mode
  DRAW_LINE: '90',
  DRAW_RECT: '91',
  DRAW_FILLED_RECT: '92',
  DRAW_SQUARE: '93',
  DRAW_CIRCLE: '94',
  DRAW_FILLED_CIRCLE: '95',
  DRAW_TRIANGLE_UP: '96',
  DRAW_FILLED_TRIANGLE_UP: '97',
  DRAW_TRIANGLE_DOWN: '98',
  DRAW_FILLED_TRIANGLE_DOWN: '99',
  DRAW_TRIANGLE_LEFT: '9a',
  DRAW_FILLED_TRIANGLE_LEFT: '9b',
  DRAW_TRIANGLE_RIGHT: '9c',
  DRAW_FILLED_TRIANGLE_RIGHT: '9d',
  SET_PIXEL_DEFAULT_COLOR: '9e',
  CLEAR_PIXEL: '9f',
  SET_PIXEL_COLOR: 'ee',

  // Animation mode
  SCROLL_IMAGE_UP: 'a0',
  SCROLL_IMAGE_DOWN: 'a1',
  SCROLL_IMAGE_LEFT: 'a2',
  SCROLL_IMAGE_RIGHT: 'a3',
  ERASE_IMAGE_UP: 'a4',
  ERASE_IMAGE_DOWN: 'a5',
  ERASE_IMAGE_LEFT: 'a6',
  ERASE_IMAGE_RIGHT: 'a7',
  DISPLAY_IMAGE_INSIDE_OUT: 'a8',
  DISPLAY_IMAGE_OUTSIDE_IN: 'a9',
  ERASE_IMAGE_INSIDE_OUT: 'aa',
  ERASE_IMAGE_OUTSIDE_IN: 'ab',
  SHIFT_ROW_UP: 'ac',
  SHIFT_ROW_DOWN: 'ad',
  SHIFT_COLUMN_LEFT: 'ae',
  SHIFT_COLUMN_RIGHT: 'af',
  FLY_IN_UP: 'b0',
  FLY_IN_DOWN: 'b1',
  FLY_IN_LEFT: 'b2',
  FLY_IN_RIGHT: 'b3',
  FLY_IN_UP_LEFT: 'b4',
  FLY_IN_UP_RIGHT: 'b5',
  FLY_IN_DOWN_LEFT: 'b6',
  FLY_IN_DOWN_RIGHT: 'b7',
  SET_PATTERN_EDIT_SCROLL_FLAG: 'bc',
  SET_MULTI_PAGE_INTERVAL: 'be',
  SET_ANIMATION_SPEED: 'bf',
  SCROLL_DISPLAY_UP: 'd2',
  SCROLL_DISPLAY_DOWN: 'd3',
  SCROLL_DISPLAY_LEFT: 'd4',
  SCROLL_DISPLAY_RIGHT: 'd5',
  SCROLL_SECTION_UP: 'd6',
  SCROLL_SECTION_DOWN: 'd7',
  SCROLL_SECTION_LEFT: 'd8',
  SCROLL_SECTION_RIGHT: 'd9',
  SET_ANIMATION_PAGE_COUNT: 'df',
  SET_AUTOMATIC_ANIMATION_MODE: 'fd',

  // Color management
  RECOLOR_ALL_PIXELS: 'c0',
  SWAP_COLOR: 'cc',
  SET_COLOR_CHANGE_EFFECT: 'cd',
  SET_FADE_EFFECT: 'ce',
  SWAP_COLOR_IN_AREA: 'cf',

  // System control
  CLEAR_DISPLAY: 'd0',
  SHOW_DISPLAY_MEMORY: 'd1',
  SET_PAGE0_EEPROM_WRITE_FLAG: 'bd',
  DISPLAY_OFF: 'f0',
  DISPLAY_ON: 'f1',
  SET_BRIGHTNESS: 'f2',
  SET_CONFIG_MODE: 'f7',
  SET_DISPLAY_PAGE: 'fc',
  WRITE_PAGE_TO_EEPROM: 'fe',
  DISPLAY_FIRMWARE_REVISION: '20',
} as const;

export function setBrightness(level: number): string {
  return atCommand(EZ_CODE.SET_BRIGHTNESS, [level]); // 0-11
}

export function displayOn(): string {
  return atCommand(EZ_CODE.DISPLAY_ON);
}

export function displayOff(): string {
  return atCommand(EZ_CODE.DISPLAY_OFF);
}

export function clearDisplay(): string {
  return atCommand(EZ_CODE.CLEAR_DISPLAY);
}

export function setBackgroundColor(colorCode: number): string {
  return atCommand(EZ_CODE.SET_BACKGROUND_COLOR, [colorCode]);
}

export function setCharacterColor(colorCode: number): string {
  return atCommand(EZ_CODE.SET_CHARACTER_COLOR, [colorCode]);
}

export function write8x16String(line: number, column: number, text: string): string {
  return atCommand(EZ_CODE.WRITE_8X16_STRING, [line, column, text]);
}

export function write5x7String(line: number, column: number, text: string): string {
  return atCommand(EZ_CODE.WRITE_5X7_STRING, [line, column, text]);
}

export function setPixel(x: number, y: number, colorCode: number): string {
  return atCommand(EZ_CODE.SET_PIXEL_COLOR, [x, y, colorCode]);
}

export function drawLine(x0: number, y0: number, x1: number, y1: number, colorCode: number): string {
  return atCommand(EZ_CODE.DRAW_LINE, [x0, y0, x1, y1, colorCode]);
}

export function drawRect(x0: number, y0: number, x1: number, y1: number, colorCode: number): string {
  return atCommand(EZ_CODE.DRAW_RECT, [x0, y0, x1, y1, colorCode]);
}

export function fillRect(x0: number, y0: number, x1: number, y1: number, colorCode: number): string {
  return atCommand(EZ_CODE.DRAW_FILLED_RECT, [x0, y0, x1, y1, colorCode]);
}
