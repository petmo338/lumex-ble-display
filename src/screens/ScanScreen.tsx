import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { bleService } from '../ble/BleService';

interface Props {
  onSelectDevice: (device: Device) => void;
}

export function ScanScreen({ onSelectDevice }: Props) {
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stopScan: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const granted = await bleService.requestPermissions();
      if (!granted) {
        setError('Bluetooth permission was denied.');
        return;
      }
      await bleService.waitForPoweredOn();
      if (cancelled) {
        return;
      }
      setReady(true);
      stopScan = bleService.scanForDevices(
        device => {
          setDevices(prev => {
            const next = new Map(prev);
            next.set(device.id, device);
            return next;
          });
        },
        err => setError(err.message),
      );
    })();

    return () => {
      cancelled = true;
      stopScan?.();
    };
  }, []);

  const sortedDevices = useMemo(() => {
    const list = Array.from(devices.values());
    const needle = filter.trim().toLowerCase();
    const filtered = needle
      ? list.filter(
          d =>
            d.name?.toLowerCase().includes(needle) ||
            d.id.toLowerCase().includes(needle),
        )
      : list;
    return filtered.sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
  }, [devices, filter]);

  const renderItem = useCallback(
    ({ item }: { item: Device }) => (
      <Pressable style={styles.row} onPress={() => onSelectDevice(item)}>
        <View style={styles.rowText}>
          <Text style={styles.name}>{item.name ?? '(unnamed device)'}</Text>
          <Text style={styles.id}>{item.id}</Text>
        </View>
        <Text style={styles.rssi}>{item.rssi ?? '?'} dBm</Text>
      </Pressable>
    ),
    [onSelectDevice],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby BLE devices</Text>
      <Text style={styles.hint}>
        Lumex doesn't publish a fixed advertised name for the LDM-6432-BLE4 -
        find yours by proximity/RSSI, then confirm it in the Inspector.
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {!ready && !error && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.hint}>Waiting for Bluetooth...</Text>
        </View>
      )}
      <TextInput
        style={styles.filterInput}
        placeholder="Filter by name or id"
        value={filter}
        onChangeText={setFilter}
      />
      <FlatList
        data={sortedDevices}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          ready ? <Text style={styles.hint}>Scanning...</Text> : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  hint: { color: '#666', marginBottom: 8 },
  error: { color: '#b00020', marginBottom: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowText: { flexShrink: 1 },
  name: { fontSize: 16, fontWeight: '500' },
  id: { fontSize: 12, color: '#888' },
  rssi: { fontSize: 12, color: '#666' },
});
