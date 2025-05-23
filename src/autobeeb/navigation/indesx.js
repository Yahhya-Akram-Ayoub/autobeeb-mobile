import React, {useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import BottomNavigation from './BottomNavigation';
import {navigationRef} from './NavigationService'; // optional custom ref module
import SplashScreen from '../../containers/SplashScreen';
import LanguageSelector from '../../navigation/LanguageSelector';
import {CardStyleInterpolators} from '@react-navigation/stack';

enableScreens(true); // performance optimization

const Stack = createNativeStackNavigator();

const AutobeebApp = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
        initialRouteName="SplashScreen">
        <Stack.Screen
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          }}
          name="SplashScreen"
          component={SplashScreen}
        />
        <Stack.Screen
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          }}
          name="LanguageSelector"
          component={LanguageSelector}
        />
        <Stack.Screen
          name="App"
          component={() => <BottomNavigation navigationRef={navigationRef} />}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AutobeebApp;
