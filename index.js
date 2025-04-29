/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import ReduxWrapper from './src/ReduxWrapper';

AppRegistry.registerComponent(appName, () => ReduxWrapper);

//  "react-native-country-picker-modal-kensoftware": "file:./src/components/react-native-country-picker-modal",