/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry, Text, TextInput} from 'react-native';
import {name as appName} from './app.json';
import {WebView} from 'react-native-webview';
import setDefaultProps from 'react-native-simple-default-props';
import ReduxWrapper from './src/ReduxWrapper';

// Apply WebView default settings early
if (!WebView.defaultProps) WebView.defaultProps = {};
WebView.defaultProps.useWebKit = true;

// Set default props
const customTextInputProps = {
  allowFontScaling: false,
  style: {
    fontFamily: 'Cairo-Regular',
    fontSize: 17,
  },
};
const customTextProps = {
  allowFontScaling: false,
  style: {
    fontFamily: 'Cairo-Regular',
    fontSize: 17,
  },
};

setDefaultProps(Text, customTextProps);
setDefaultProps(TextInput, customTextInputProps);

// Startup project
AppRegistry.registerComponent(appName, () => ReduxWrapper);
