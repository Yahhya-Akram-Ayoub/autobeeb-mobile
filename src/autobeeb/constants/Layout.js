import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('screen');

export default {
  screenWidth: width,
  screenHeight: height,
  isSmallDevice: width < 375,
  isLargeDevice: width > 768,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};
