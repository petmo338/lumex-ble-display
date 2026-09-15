// Confirmed by direct GATT probing against a physical LDM-6432-BLE4
// (Lumex publishes none of this). The module advertises 0000ffe0 and
// exposes several FFFx characteristics underneath it; only fff1 actually
// reaches the display's AT command parser - the others (fff2/fff3/fff5,
// and the separate f000ffc0 TI-pattern service) accepted writes without
// error but had no effect on the display.
// The advertised local name truncates to "LUM232882" (length-budget in the
// ADV packet), but the full GAP device name read after connecting is
// "LUMEX232882" - match on the common prefix to catch either form.
export const LUMEX_DEVICE_NAME_PREFIX = 'LUM';

export const LUMEX_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
export const LUMEX_WRITE_CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
// Untested: the only notifiable characteristic in the same service: likely
// carries the 'E' ready-byte the datasheet describes, but not yet confirmed.
export const LUMEX_NOTIFY_CHARACTERISTIC_UUID = '0000fff4-0000-1000-8000-00805f9b34fb';

// iOS (CoreBluetooth) requires pairing to subscribe to notifications on this
// module and will prompt for a passkey the first time; Android/Linux (BlueZ)
// never required pairing at all for the same operations. Confirmed passkey: 123456.
// Not needed for LUMEX_WRITE_CHARACTERISTIC_UUID alone, only for notify.
