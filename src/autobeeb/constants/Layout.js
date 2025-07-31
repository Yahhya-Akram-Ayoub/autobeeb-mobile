import {Dimensions, Platform} from 'react-native';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const {width, height} = Dimensions.get('screen');
export {width as screenWidth};
export {height as screenHeight};
export {isIOS};
export {isAndroid};

export default {
  screenWidth: width,
  screenHeight: height,
  isSmallDevice: width < 375,
  isLargeDevice: width > 768,
  isIOS,
  isAndroid,
};
