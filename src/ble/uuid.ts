// iOS CoreBluetooth shortens UUIDs derived from the standard Bluetooth Base
// UUID to their 16-/32-bit form (e.g. "FFE0"), while Android always returns
// the full 128-bit string (e.g. "0000ffe0-0000-1000-8000-00805f9b34fb").
// Normalize both to the full form before comparing across platforms.
const BLUETOOTH_BASE_UUID_SUFFIX = '00001000800000805f9b34fb';

export function normalizeUuid(uuid: string): string {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  if (hex.length === 4) {
    return `0000${hex}${BLUETOOTH_BASE_UUID_SUFFIX}`;
  }
  if (hex.length === 8) {
    return `${hex}${BLUETOOTH_BASE_UUID_SUFFIX}`;
  }
  return hex;
}

export function uuidsEqual(a: string, b: string): boolean {
  return normalizeUuid(a) === normalizeUuid(b);
}
