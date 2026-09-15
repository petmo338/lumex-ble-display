import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { bleService, DiscoveredCharacteristic, DiscoveredService } from '../ble/BleService';

export interface CharacteristicRef {
  serviceUUID: string;
  uuid: string;
}

interface Props {
  device: Device;
  onBack: () => void;
  onReady: (write: CharacteristicRef, notify: CharacteristicRef | null) => void;
}

function badge(label: string, active: boolean) {
  return (
    <View style={[styles.badge, active ? styles.badgeOn : styles.badgeOff]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function InspectorScreen({ device, onBack, onReady }: Props) {
  const [services, setServices] = useState<DiscoveredService[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [writeChar, setWriteChar] = useState<CharacteristicRef | null>(null);
  const [notifyChar, setNotifyChar] = useState<CharacteristicRef | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const discovered = await bleService.discoverGatt(device);
        if (!cancelled) {
          setServices(discovered);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [device]);

  const renderCharacteristic = (c: DiscoveredCharacteristic) => {
    const isWrite =
      writeChar?.uuid === c.uuid && writeChar.serviceUUID === c.serviceUUID;
    const isNotify =
      notifyChar?.uuid === c.uuid && notifyChar.serviceUUID === c.serviceUUID;

    return (
      <View key={c.uuid} style={styles.charRow}>
        <Text style={styles.charUuid} numberOfLines={1}>
          {c.uuid}
        </Text>
        <View style={styles.badgeRow}>
          {badge('R', c.isReadable)}
          {badge('W', c.isWritableWithResponse)}
          {badge('WNR', c.isWritableWithoutResponse)}
          {badge('N', c.isNotifiable)}
        </View>
        <View style={styles.charActions}>
          {(c.isWritableWithResponse || c.isWritableWithoutResponse) && (
            <Pressable
              style={[styles.smallButton, isWrite && styles.smallButtonActive]}
              onPress={() => setWriteChar({ serviceUUID: c.serviceUUID, uuid: c.uuid })}>
              <Text style={[styles.smallButtonText, isWrite && styles.smallButtonTextActive]}>
                {isWrite ? 'Write ✓' : 'Use as write'}
              </Text>
            </Pressable>
          )}
          {c.isNotifiable && (
            <Pressable
              style={[styles.smallButton, isNotify && styles.smallButtonActive]}
              onPress={() => setNotifyChar({ serviceUUID: c.serviceUUID, uuid: c.uuid })}>
              <Text style={[styles.smallButtonText, isNotify && styles.smallButtonTextActive]}>
                {isNotify ? 'Notify ✓' : 'Use as notify'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>{'< Back to scan'}</Text>
      </Pressable>
      <Text style={styles.title}>{device.name ?? device.id}</Text>
      <Text style={styles.hint}>
        Lumex doesn't publish GATT UUIDs for this module. Pick the
        characteristic that accepts writes (commonly the only writable one on
        these UART-bridge modules), and a notify one if present, to receive
        the module's 'E' ready byte.
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {!services && !error && <Text style={styles.hint}>Discovering services...</Text>}
      <ScrollView>
        {services?.map(service => (
          <View key={service.uuid} style={styles.service}>
            <Text style={styles.serviceUuid}>{service.uuid}</Text>
            {service.characteristics.map(renderCharacteristic)}
          </View>
        ))}
      </ScrollView>
      <Pressable
        style={[styles.continueButton, !writeChar && styles.continueButtonDisabled]}
        disabled={!writeChar}
        onPress={() => writeChar && onReady(writeChar, notifyChar)}>
        <Text style={styles.continueButtonText}>Continue to control screen</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  back: { color: '#0066cc', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  hint: { color: '#666', marginVertical: 8 },
  error: { color: '#b00020', marginBottom: 8 },
  service: { marginBottom: 16 },
  serviceUuid: { fontWeight: '600', marginBottom: 4 },
  charRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  charUuid: { fontSize: 13, fontFamily: 'monospace' },
  badgeRow: { flexDirection: 'row', gap: 6, marginVertical: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeOn: { backgroundColor: '#d3f0d3' },
  badgeOff: { backgroundColor: '#eee' },
  badgeText: { fontSize: 11 },
  charActions: { flexDirection: 'row', gap: 8 },
  smallButton: {
    borderWidth: 1,
    borderColor: '#0066cc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallButtonActive: { backgroundColor: '#0066cc' },
  smallButtonText: { color: '#0066cc', fontSize: 12 },
  smallButtonTextActive: { color: 'white' },
  continueButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: { backgroundColor: '#aac4e0' },
  continueButtonText: { color: 'white', fontWeight: '600' },
});
