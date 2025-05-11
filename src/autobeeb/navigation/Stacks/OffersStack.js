import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {OffersScreen} from '../../screens';
import {CardStyleInterpolators} from '@react-navigation/stack';
import ActiveOffers from '../../../navigation/ActiveOffers';
import ChatScreen from '../../../navigation/ChatScreen';
import EditProfile from '../../../navigation/EditProfile';
import PostOfferScreen from '../../../navigation/PostOfferScreen';
import SpecialPlans from '../../../navigation/SpecialPlans';
import CliQScreen from '../../../navigation/CliQScreen';
import CarDetails from '../../../navigation/CarDetails';
import DealersScreen from '../../../navigation/DealersScreen';
import UserProfileScreen from '../../../navigation/UserProfileScreen';
import DealerProfileScreen from '../../../navigation/DealerProfileScreen';

const Stack = createNativeStackNavigator();

const OffersStack = ({stackRef}) => {
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
        initialRouteName: 'ActiveOffers',
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      }}>
      <Stack.Screen name="ActiveOffers" component={ActiveOffers} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="PostOfferScreen" component={PostOfferScreen} />
      <Stack.Screen name="SpecialPlans" component={SpecialPlans} />
      <Stack.Screen name="CliQScreen" component={CliQScreen} />
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

export {OffersStack};
