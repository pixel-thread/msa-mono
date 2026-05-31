import * as Device from 'expo-device';

export const getDeviceType = () => {
  switch (Device.deviceType) {
    case Device.DeviceType.PHONE:
      return 'phone';

    case Device.DeviceType.TABLET:
      return 'tablet';

    case Device.DeviceType.TV:
      return 'tv';

    default:
      return 'unknown';
  }
};
