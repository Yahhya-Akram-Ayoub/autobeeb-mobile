import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import MessagesScreen from '../../../navigation/MessagesScreen';
import ChatScreen from '../../../navigation/ChatScreen';
import CarDetails from '../../../navigation/CarDetails';
import DealersScreen from '../../../navigation/DealersScreen';
import UserProfileScreen from '../../../navigation/UserProfileScreen';
import DealerProfileScreen from '../../../navigation/DealerProfileScreen';
import HomeScreen from '../../../navigation/HomeScreen';

const Stack = createNativeStackNavigator();

const ChatStack = ({stackRef}) => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      const state = stackRef?.current?.getState?.();
      if (!!state && state?.routes.length > 1) {
        stackRef.current?.popToTop?.();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      ref={stackRef}
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        initialRouteName: 'MessagesScreen',
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      }}>
      <Stack.Screen name="MessagesScreen" component={HomeScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="CarDetails" component={CarDetails} />
      <Stack.Screen name="DealersScreen" component={DealersScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen
        name="DealerProfileScreen"
        component={DealerProfileScreen}
      />
    </Stack.Navigator>
  );
};

export {ChatStack};
