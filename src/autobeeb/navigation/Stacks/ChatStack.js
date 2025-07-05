import {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import MessagesScreen from '../../../navigation/MessagesScreen';
import ChatScreen from '../../../navigation/ChatScreen';
import CarDetails from '../../../navigation/CarDetails';
import DealersScreen from '../../../navigation/DealersScreen';
import UserProfileScreen from '../../../navigation/UserProfileScreen';
import DealerProfileScreen from '../../../navigation/DealerProfileScreen';
import {TranstionSettings} from './Transtion';
import {ListingDetailsScreen} from '../../screens';

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
      initialRouteName={'MessagesScreen'}
      screenOptions={{
        headerShown: false,
        initialRouteName: 'MessagesScreen',
        ...TranstionSettings,
      }}>
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="CarDetails" component={ListingDetailsScreen} />
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
