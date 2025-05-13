import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {Drawer} from '../../../components';
import EditProfile from '../../../navigation/EditProfile';
import SettingScreen from '../../../navigation/SettingScreen';
import PaymentDetailsAutobeeb from '../../../navigation/PaymentDetailsAutobeeb';
import RecentListings from '../../../navigation/RecentListings';
import SpecialPlans from '../../../navigation/SpecialPlans';
import CliQScreen from '../../../navigation/CliQScreen';
import LoginScreen from '../../../navigation/LoginScreen';
import ForgotPassword from '../../../navigation/ForgotPassword';
import ChangePasswordScreen from '../../../navigation/ChangePasswordScreen';
import {DealerPlusRenewal} from '../../../components/DealerPlusRenewal';
import RegisterScreen from '../../../navigation/RegisterScreen';
import CarDetails from '../../../navigation/CarDetails';
import PostOfferScreen from '../../../navigation/PostOfferScreen';
import SectionsScreen from '../../../navigation/SectionsScreen';
import DealerSignUp from '../../../navigation/DealerSignUp';
import DealersScreen from '../../../navigation/DealersScreen';
import UserProfileScreen from '../../../navigation/UserProfileScreen';
import DealerProfileScreen from '../../../navigation/DealerProfileScreen';
import PrivacyPolicy from '../../../navigation/PrivacyPolicy';
import SearchResult from '../../../navigation/SearchResult';
import FavoriteScreen from '../../../navigation/FavoriteScreen';
import SubscriptionsScreen from '../../../navigation/SubscriptionsScreen';
import {DrawerScreen} from '../../screens';

const Stack = createNativeStackNavigator();

const ProfileStack = ({stackRef}) => {
  const navigation = useNavigation();
  const user = useSelector(x => x.user.user);

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
        initialRouteName: 'Drawer',
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      }}>
      <Stack.Screen name="Drawer" component={DrawerScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />

      <Stack.Screen
        name="PaymentDetailsAutobeeb"
        component={PaymentDetailsAutobeeb}
      />
      <Stack.Screen name="RecentListings" component={RecentListings} />
      <Stack.Screen name="SpecialPlans" component={SpecialPlans} />
      <Stack.Screen name="CliQScreen" component={CliQScreen} />

      {!user && (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
          />
        </>
      )}
      <Stack.Screen name="DealerPlusRenewal" component={DealerPlusRenewal} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="CarDetails" component={CarDetails} />
      <Stack.Screen name="PostOfferScreen" component={PostOfferScreen} />
      <Stack.Screen name="SectionsScreen" component={SectionsScreen} />
      <Stack.Screen name="DealerSignUp" component={DealerSignUp} />
      <Stack.Screen name="DealersScreen" component={DealersScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen
        name="DealerProfileScreen"
        component={DealerProfileScreen}
      />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="SearchResult" component={SearchResult} />
      <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
      <Stack.Screen
        name="SubscriptionsScreen"
        component={SubscriptionsScreen}
      />
    </Stack.Navigator>
  );
};

export {ProfileStack};
