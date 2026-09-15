const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// react-native-ble-plx exchanges characteristic values as base64 strings.
// Implemented locally so callers don't need to pull in `buffer`/`base-64`
// just to send short ASCII AT commands.
export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;

    result += CHARS[b0 >> 2];
    result += CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    result += b1 === undefined ? '=' : CHARS[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    result += b2 === undefined ? '=' : CHARS[b2 & 0x3f];
  }
  return result;
}

export function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of clean) {
    const value = CHARS.indexOf(char);
    if (value === -1) {
      continue;
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

export function asciiToBase64(text: string): string {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytesToBase64(bytes);
}

export function base64ToAscii(base64: string): string {
  return Array.from(base64ToBytes(base64))
    .map(byte => String.fromCharCode(byte))
    .join('');
}
