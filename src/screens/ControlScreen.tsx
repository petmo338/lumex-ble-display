import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { bleService } from '../ble/BleService';
import * as cmd from '../ezdisplay/commands';
import { COLOR } from '../ezdisplay/color';
import type { CharacteristicRef } from './InspectorScreen';

interface Props {
  device: Device;
  writeChar: CharacteristicRef;
  notifyChar: CharacteristicRef | null;
  onBack: () => void;
}

export function ControlScreen({ device, writeChar, notifyChar, onBack }: Props) {
  const [log, setLog] = useState<string[]>([]);
  const [rawCommand, setRawCommand] = useState('');
  const [text, setText] = useState('HELLO');
  const [withResponse, setWithResponse] = useState(true);
  const [brightness, setBrightness] = useState(8);
  const logRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const appendLog = (line: string) => {
    setLog(prev => [...prev.slice(-49), line]);
    requestAnimationFrame(() => logRef.current?.scrollToEnd({ animated: true }));
  };

  useEffect(() => {
    if (!notifyChar) {
      return;
    }
    const sub = bleService.monitor(
      device.id,
      notifyChar.serviceUUID,
      notifyChar.uuid,
      value => appendLog(`< ${value}`),
      err => appendLog(`! notify error: ${err.message}`),
    );
    return () => sub.remove();
  }, [device.id, notifyChar]);

  const send = async (command: string) => {
    appendLog(`> ${command}`);
    try {
      await bleService.writeAscii(
        device.id,
        writeChar.serviceUUID,
        writeChar.uuid,
        command,
        withResponse,
      );
    } catch (e) {
      appendLog(`! write error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>{'< Back to inspector'}</Text>
      </Pressable>
      <Text style={styles.title}>{device.name ?? device.id}</Text>

      <View style={styles.row}>
        <Text>Write with response</Text>
        <Switch value={withResponse} onValueChange={setWithResponse} />
      </View>

      <Text style={styles.section}>Quick actions</Text>
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={() => send(cmd.displayOn())}>
          <Text style={styles.buttonText}>Display on</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => send(cmd.displayOff())}>
          <Text style={styles.buttonText}>Display off</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => send(cmd.clearDisplay())}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Brightness ({brightness})</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.button}
          onPress={() => setBrightness(b => Math.max(0, b - 1))}>
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => setBrightness(b => Math.min(11, b + 1))}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => send(cmd.setBrightness(brightness))}>
          <Text style={styles.buttonText}>Apply</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Text</Text>
      <TextInput style={styles.textInput} value={text} onChangeText={setText} />
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.button}
          onPress={() => send(cmd.setCharacterColor(COLOR.WHITE))}>
          <Text style={styles.buttonText}>White text</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => send(cmd.setCharacterColor(COLOR.RED))}>
          <Text style={styles.buttonText}>Red text</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => send(cmd.write8x16String(0, 0, text))}>
          <Text style={styles.buttonText}>Write</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Raw AT command</Text>
      <View style={styles.buttonRow}>
        <TextInput
          style={[styles.textInput, styles.flex1]}
          value={rawCommand}
          onChangeText={setRawCommand}
          placeholder="e.g. atf2=(8)"
          autoCapitalize="none"
        />
        <Pressable
          style={styles.button}
          onPress={() => rawCommand.trim() && send(rawCommand.trim())}>
          <Text style={styles.buttonText}>Send</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Log</Text>
      <ScrollView ref={logRef} style={styles.log}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logLine}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  back: { color: '#0066cc', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  section: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  buttonRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { color: 'white', fontWeight: '500' },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  flex1: { flex: 1 },
  log: {
    flex: 1,
    marginTop: 6,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 8,
  },
  logLine: { color: '#0f0', fontFamily: 'monospace', fontSize: 12 },
});
