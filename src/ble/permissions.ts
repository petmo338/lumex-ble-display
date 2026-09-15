import { PermissionsAndroid, Platform } from 'react-native';

// Android 12+ (API 31+) split Bluetooth into its own runtime permissions;
// below that, BLE scanning is gated behind location permission instead.
export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(results).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED,
    );
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return status === PermissionsAndroid.RESULTS.GRANTED;
}
