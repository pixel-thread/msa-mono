import * as Device from 'expo-device';

export function isExpoGo(): boolean {
  return Device.isDevice ? false : true;
}
