import React, {useEffect} from 'react';
import {View, StatusBar, I18nManager, LogBox} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Styles, Languages} from './common';
import {MyToast, MyNetInfo} from './containers';
import {applyMiddleware, compose, createStore} from 'redux';
import {persistStore} from 'redux-persist';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './redux';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {MySignalR, NotificationPermission} from './components';
import AutobeebApp from './autobeeb/navigation/indesx';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// Suppress log warnings
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
console.disableYellowBox = true;

// Setup Redux store
const middleware = [thunk];
const store = compose(applyMiddleware(...middleware))(createStore)(reducers);
persistStore(store);

const ReduxWrapper = () => {
  useEffect(() => {
    const setupLanguage = async () => {
      const result = await AsyncStorage.getItem('language');
      if (result !== null) {
        I18nManager.forceRTL(result === 'ar');
        Languages.setLanguage(result);
      }
    };

    setupLanguage();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <SafeAreaView style={{flex: 1}}>
          <Provider store={store}>
            <View style={Styles.app}>
              <MyToast />
              <StatusBar backgroundColor="#fff" barStyle="dark-content" />
              <AutobeebApp />
              <MyNetInfo />
              <NotificationPermission />
              <MySignalR />
            </View>
          </Provider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default ReduxWrapper;
