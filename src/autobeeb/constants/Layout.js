import {Dimensions, Platform} from 'react-native';

const {width, height} = Dimensions.get('screen');
export {width as screenWidth};
export {height as screenHeight};

export default {
  screenWidth: width,
  screenHeight: height,
  isSmallDevice: width < 375,
  isLargeDevice: width > 768,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};
