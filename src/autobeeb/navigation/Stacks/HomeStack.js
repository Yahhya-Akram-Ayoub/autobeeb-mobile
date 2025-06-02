import React, {useEffect, useCallback} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {ExtractScreenObjFromUrl} from '../../../common';
import MakesScreen from '../../../navigation/MakesScreen';
import SellTypeScreen from '../../../navigation/SellTypeScreen';
import ChatScreen from '../../../navigation/ChatScreen';
import LoginScreen from '../../../navigation/LoginScreen';
import RegisterScreen from '../../../navigation/RegisterScreen';
import SearchScreen from '../../../navigation/SearchScreen';
import ListingsScreen from '../../../navigation/ListingsScreen';
import ForgotPassword from '../../../navigation/ForgotPassword';
import SettingScreen from '../../../navigation/SettingScreen';
import EditProfile from '../../../navigation/EditProfile';
import LanguageSelector from '../../../navigation/LanguageSelector';
import RecentListings from '../../../navigation/RecentListings';
import SpecialPlans from '../../../navigation/SpecialPlans';
import PostOfferScreen from '../../../navigation/PostOfferScreen';
import SectionsScreen from '../../../navigation/SectionsScreen';
import CategoriesScreen from '../../../navigation/CategoriesScreen';
import ChangePasswordScreen from '../../../navigation/ChangePasswordScreen';
import DealerSignUp from '../../../navigation/DealerSignUp';
import DealersScreen from '../../../navigation/DealersScreen';
import DealerProfileScreen from '../../../navigation/DealerProfileScreen';
import UserProfileScreen from '../../../navigation/UserProfileScreen';
import InactiveOffers from '../../../navigation/InactiveOffers';
import PrivacyPolicy from '../../../navigation/PrivacyPolicy';
import SearchResult from '../../../navigation/SearchResult';
import FavoriteScreen from '../../../navigation/FavoriteScreen';
import BlogDetails from '../../../navigation/BlogDetails';
import BlogsScreen from '../../../navigation/BlogsScreen';
import CliQScreen from '../../../navigation/CliQScreen';
import PaymentDetailsAutobeeb from '../../../navigation/PaymentDetailsAutobeeb';
import RecentlyViewedScreen from '../../../navigation/RecentlyViewedScreen';
import SubscriptionsScreen from '../../../navigation/SubscriptionsScreen';
import CarDetails from '../../../navigation/CarDetails';
import {
  HomeScreen,
  ErrorScreen,
  ListingDetailsScreen,
  ListingReportScreen,
} from '../../screens';
import {TranstionSettings} from './Transtion';

const Stack = createNativeStackNavigator();

const HomeStack = ({stackRef}) => {
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

  const handleOpenURL = useCallback(
    async event => {
      const url = event.url;
      const {screen, params} = await ExtractScreenObjFromUrl(url);
      navigation.navigate(screen, params ?? undefined);
    },
    [navigation],
  );

  useEffect(() => {
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleOpenURL({url});
      }
    };
    checkInitialUrl();

    const _linkHandler = Linking.addEventListener('url', handleOpenURL);
    return () => {
      _linkHandler.remove();
    };
  }, [handleOpenURL]);

  return (
    <Stack.Navigator
      ref={stackRef}
      screenOptions={{
        headerShown: false,
        initialRouteName: 'HomeScreen',
        ...TranstionSettings,
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="SellTypeScreen" component={SellTypeScreen} />
      <Stack.Screen name="MakesScreen" component={MakesScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="BlogDetails" component={BlogDetails} />
      <Stack.Screen name="BlogsScreen" component={BlogsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="ListingsScreen" component={ListingsScreen} />
      <Stack.Screen name="SpecialPlans" component={SpecialPlans} />
      <Stack.Screen name="CliQScreen" component={CliQScreen} />
      <Stack.Screen
        name="PaymentDetailsAutobeeb"
        component={PaymentDetailsAutobeeb}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="LanguageSelector" component={LanguageSelector} />
      <Stack.Screen name="RecentListings" component={RecentListings} />
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
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="CarDetails" component={ListingDetailsScreen} />
      <Stack.Screen name="PostOfferScreen" component={PostOfferScreen} />
      <Stack.Screen name="SectionsScreen" component={SectionsScreen} />
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />

      <Stack.Screen name="DealerSignUp" component={DealerSignUp} />
      <Stack.Screen name="DealersScreen" component={DealersScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen
        name="DealerProfileScreen"
        component={DealerProfileScreen}
      />
      <Stack.Screen name="InactiveOffers" component={InactiveOffers} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="SearchResult" component={SearchResult} />
      <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
      <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
      <Stack.Screen
        name="RecentlyViewedScreen"
        component={RecentlyViewedScreen}
      />
      <Stack.Screen
        name="SubscriptionsScreen"
        component={SubscriptionsScreen}
      />
      <Stack.Screen
        name="ListingReportScreen"
        component={ListingReportScreen}
      />
    </Stack.Navigator>
  );
};

export {HomeStack};
