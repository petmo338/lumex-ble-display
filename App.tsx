/**
 * Lumex LDM-6432-BLE4 BLE control app
 *
 * @format
 */

import React, { useCallback, useState } from 'react';
import { Alert, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Device } from 'react-native-ble-plx';
import { bleService } from './src/ble/BleService';
import { uuidsEqual } from './src/ble/uuid';
import {
  LUMEX_NOTIFY_CHARACTERISTIC_UUID,
  LUMEX_SERVICE_UUID,
  LUMEX_WRITE_CHARACTERISTIC_UUID,
} from './src/ezdisplay/knownDevice';
import { ScanScreen } from './src/screens/ScanScreen';
import { InspectorScreen, CharacteristicRef } from './src/screens/InspectorScreen';
import { ControlScreen } from './src/screens/ControlScreen';

type Screen =
  | { name: 'scan' }
  | { name: 'inspect'; device: Device }
  | {
      name: 'control';
      device: Device;
      writeChar: CharacteristicRef;
      notifyChar: CharacteristicRef | null;
    };

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>({ name: 'scan' });

  const handleSelectDevice = useCallback(async (device: Device) => {
    try {
      const connected = await bleService.connect(device.id);
      const services = await bleService.discoverGatt(connected);
      const allCharacteristics = services.flatMap(s => s.characteristics);
      const writeMatch = allCharacteristics.find(
        c =>
          uuidsEqual(c.serviceUUID, LUMEX_SERVICE_UUID) &&
          uuidsEqual(c.uuid, LUMEX_WRITE_CHARACTERISTIC_UUID),
      );

      if (writeMatch) {
        const notifyMatch = allCharacteristics.find(
          c =>
            uuidsEqual(c.serviceUUID, LUMEX_SERVICE_UUID) &&
            uuidsEqual(c.uuid, LUMEX_NOTIFY_CHARACTERISTIC_UUID),
        );
        setScreen({
          name: 'control',
          device: connected,
          writeChar: { serviceUUID: writeMatch.serviceUUID, uuid: writeMatch.uuid },
          notifyChar: notifyMatch
            ? { serviceUUID: notifyMatch.serviceUUID, uuid: notifyMatch.uuid }
            : null,
        });
      } else {
        setScreen({ name: 'inspect', device: connected });
      }
    } catch (e) {
      Alert.alert('Connection failed', e instanceof Error ? e.message : String(e));
    }
  }, []);

  const handleReady = useCallback(
    (device: Device, writeChar: CharacteristicRef, notifyChar: CharacteristicRef | null) => {
      setScreen({ name: 'control', device, writeChar, notifyChar });
    },
    [],
  );

  let content;
  if (screen.name === 'scan') {
    content = <ScanScreen onSelectDevice={handleSelectDevice} />;
  } else if (screen.name === 'inspect') {
    content = (
      <InspectorScreen
        device={screen.device}
        onBack={() => setScreen({ name: 'scan' })}
        onReady={(writeChar, notifyChar) => handleReady(screen.device, writeChar, notifyChar)}
      />
    );
  } else {
    content = (
      <ControlScreen
        device={screen.device}
        writeChar={screen.writeChar}
        notifyChar={screen.notifyChar}
        onBack={() => setScreen({ name: 'inspect', device: screen.device })}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
