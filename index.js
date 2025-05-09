/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';
import ReduxWrapper from './src/ReduxWrapper';

enableScreens();

AppRegistry.registerComponent(appName, () => ReduxWrapper);
