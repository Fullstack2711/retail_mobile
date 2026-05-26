/**
 * @format
 */

import 'react-native-gesture-handler';
import '@react-native-firebase/app';
import { enableFreeze } from 'react-native-screens';
import { AppRegistry } from 'react-native';

enableFreeze(true);
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
