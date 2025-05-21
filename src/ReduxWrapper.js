/**
 * Created by Kensoftware on 19/02/2017.
 */
import React from 'react';
import {
  View,
  StatusBar,
  Text,
  TextInput,
  I18nManager,
  LogBox,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Styles, Languages} from './common';
import {MyToast, MyNetInfo} from './containers';
import Navigation from './navigation';
import {applyMiddleware, compose, createStore} from 'redux';
import {persistStore} from 'redux-persist';
import {Provider} from 'react-redux';
// import messaging from '@react-native-firebase/messaging';
import {WebView} from 'react-native-webview';
import thunk from 'redux-thunk';
const middleware = [thunk];
import reducers from './redux';
// import {MySignalR} from './components';
import setDefaultProps from 'react-native-simple-default-props';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MySignalR, NotificationPermission} from './components';
import {StackActions} from '@react-navigation/native';
import AutobeebApp from './autobeeb/navigation/indesx';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

let store = null;
console.disableYellowBox = true;
store = compose(applyMiddleware(...middleware))(createStore)(reducers);

persistStore(store);

const customTextInputProps = {
  style: {
    fontFamily: 'Cairo-Regular',
    fontSize: 17,
  },
};
const customTextProps = {
  style: {
    fontFamily: 'Cairo-Regular',
    fontSize: 17,
  },
};
// const MemoizedMySignalR = React.memo(() => <MySignalR />, [0]);
export default class ReduxWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };

    AsyncStorage.getItem('language', (err, result) => {
      if (result !== null) {
        I18nManager.forceRTL(result == 'ar');
        Languages.setLanguage(result);
      }
    });

    setDefaultProps(Text, customTextProps);
    setDefaultProps(TextInput, customTextInputProps);
    if (WebView.defaultProps == null) WebView.defaultProps = {};
    WebView.defaultProps.useWebKit = true;
    //this.goToScreen = this.goToScreen.bind(this);
    //this.setupNotification = this.setupNotification.bind(this);
  }

  goToScreen = (
    routeName,
    params,
    isReset = false,
    subRouteName = undefined,
  ) => {
    const navigator = this.navigator;
    if (subRouteName == undefined) {
      navigator &&
        navigator.dispatch({
          type: 'Navigation/NAVIGATE',
          routeName: routeName,
          params,
        });
    } else {
      if (isReset) {
        const resetAction = StackActions.reset({
          routeName: routeName,
          index: 0,
          actions: this.props.navigation.navigate(subRouteName),
        });
        navigator.navigate(subRouteName);
      } else {
        const navigateAction = StackActions.navigate({
          routeName: routeName,
          params: params,
          action: this.props.navigation.navigate(
            subRouteName ? subRouteName : routeName,
          ),
        });

        navigator.dispatch(navigateAction);
      }
    }
  };

  componentDidMount() {
    if (Text.defaultProps == null) Text.defaultProps = {};
    if (TextInput.defaultProps == null) TextInput.defaultProps = {};

    Text.defaultProps.allowFontScaling = false;
    Text.defaultProps.style = {fontFamily: 'Cairo-Regular'};

    TextInput.defaultProps.allowFontScaling = false;
    // this.setupNotification();
  }

  render() {
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
  }
}
