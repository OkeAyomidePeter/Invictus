import { Platform } from 'react-native';

export function isMediaKeySupported(): boolean {
  return Platform.OS === 'android';
}
