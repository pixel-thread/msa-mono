import * as Network from 'expo-network';

/**
 * Checks whether the device currently has an active internet connection.
 *
 * This verifies:
 * - The device is connected to a network
 * - The internet is reachable
 *
 * @returns Promise<boolean>
 * - `true` if internet connection is available
 * - `false` otherwise
 *
 * @example
 * const connected = await isConnectedToNetwork();
 *
 * if (connected) {
 *   console.log("Internet available");
 * }
 */
export async function isConnectedToNetwork(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();

  return Boolean(state.isConnected && state.isInternetReachable);
}
