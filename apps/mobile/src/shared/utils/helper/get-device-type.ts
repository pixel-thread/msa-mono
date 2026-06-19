import * as Device from 'expo-device';

export const getDeviceType = () => {
  switch (Device.deviceType) {
    case Device.DeviceType.PHONE:
      return 'phone';

    case Device.DeviceType.TABLET:
      return 'tablet';

    default:
      return 'unknown';
  }
};
