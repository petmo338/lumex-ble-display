import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { requestBlePermissions } from './permissions';
import { asciiToBase64, base64ToAscii } from './base64';

export interface DiscoveredCharacteristic {
  uuid: string;
  serviceUUID: string;
  isReadable: boolean;
  isWritableWithResponse: boolean;
  isWritableWithoutResponse: boolean;
  isNotifiable: boolean;
}

export interface DiscoveredService {
  uuid: string;
  characteristics: DiscoveredCharacteristic[];
}

class BleService {
  private manager = new BleManager();

  async waitForPoweredOn(): Promise<void> {
    const state = await this.manager.state();
    if (state === State.PoweredOn) {
      return;
    }
    return new Promise(resolve => {
      const sub = this.manager.onStateChange(state2 => {
        if (state2 === State.PoweredOn) {
          sub.remove();
          resolve();
        }
      }, true);
    });
  }

  requestPermissions(): Promise<boolean> {
    return requestBlePermissions();
  }

  // The datasheet never names a broadcast prefix, so this scans everything
  // in range; the caller filters by name/RSSI in the UI instead.
  scanForDevices(
    onDevice: (device: Device) => void,
    onError: (error: Error) => void,
  ): () => void {
    this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        onError(error);
        return;
      }
      if (device) {
        onDevice(device);
      }
    });
    return () => this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<Device> {
    const device = await this.manager.connectToDevice(deviceId, { autoConnect: false });
    await device.discoverAllServicesAndCharacteristics();
    return device;
  }

  async disconnect(deviceId: string): Promise<void> {
    const isConnected = await this.manager.isDeviceConnected(deviceId);
    if (isConnected) {
      await this.manager.cancelDeviceConnection(deviceId);
    }
  }

  async discoverGatt(device: Device): Promise<DiscoveredService[]> {
    const services = await device.services();
    const result: DiscoveredService[] = [];
    for (const service of services) {
      const characteristics = await service.characteristics();
      result.push({
        uuid: service.uuid,
        characteristics: characteristics.map(c => ({
          uuid: c.uuid,
          serviceUUID: c.serviceUUID,
          isReadable: c.isReadable,
          isWritableWithResponse: c.isWritableWithResponse,
          isWritableWithoutResponse: c.isWritableWithoutResponse,
          isNotifiable: c.isNotifiable,
        })),
      });
    }
    return result;
  }

  async writeAscii(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    text: string,
    withResponse: boolean,
  ): Promise<void> {
    const value = asciiToBase64(text);
    if (withResponse) {
      await this.manager.writeCharacteristicWithResponseForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        value,
      );
    } else {
      await this.manager.writeCharacteristicWithoutResponseForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        value,
      );
    }
  }

  monitor(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    onValue: (ascii: string) => void,
    onError: (error: Error) => void,
  ): Subscription {
    return this.manager.monitorCharacteristicForDevice(
      deviceId,
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          onError(error);
          return;
        }
        if (characteristic?.value) {
          onValue(base64ToAscii(characteristic.value));
        }
      },
    );
  }

  destroy(): void {
    this.manager.destroy();
  }
}

export const bleService = new BleService();
export type { Device };
