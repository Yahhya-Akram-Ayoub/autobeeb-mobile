import React, {useEffect, useRef} from 'react';
import {View, Pressable, Text, Animated, StyleSheet} from 'react-native';
import {
  useNavigation,
  getFocusedRouteNameFromRoute,
  CommonActions,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIon from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import {useSelector} from 'react-redux';
import {ChatStack, OffersStack, ProfileStack, HomeStack} from './Stacks';
import KS from '../../services/KSAPI';
import {Color, Languages} from '../../common';
import {CardStyleInterpolators} from '@react-navigation/stack';
import BottomTabBar from './BottomTabBar';

const Tab = createBottomTabNavigator();
const hideOnScreens = [
  'ListingsScreen',
  'CarDetails',
  'SearchResult',
  'ListingReportScreen',
];

const BottomNavigation = ({navigationRef}) => {
  const {unreadMessages} = useSelector(state => state.chat || {});
  const navigation = useNavigation();

  const navigateToChatScreen = ({SessionId, UserId}) => {
    KS.GetChatSession({SessionId, LangId: Languages.ID}).then(res => {
      const entity = res.Session?.RelatedEntity
        ? JSON.parse(res.Session.RelatedEntity)
        : {};
      navigation.navigate('ChatScreen', {
        targetID: UserId,
        ownerName: res.Session.SecondPartyName,
        description: entity?.Name,
        entityID: entity?.ID,
        sessionID: SessionId,
      });
    });
  };

  const setupNotification = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.data) navigateToChatScreen(remoteMessage.data);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data) navigateToChatScreen(remoteMessage.data);
      });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (remoteMessage?.data) navigateToChatScreen(remoteMessage.data);
    });
  };

  useEffect(() => {
    setupNotification();
  }, []);

  const handleResetStack = (event, stackName, screenName) => {
    event.preventDefault();
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: stackName, state: {routes: [{name: screenName}]}}],
      }),
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeStack}
        listeners={{
          tabPress: e => handleResetStack(e, 'HomeScreen', 'HomeScreen'),
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
            },
            tabBarLabel: Languages.Home,
            tabBarIconName: 'home',
            tabBarIonIcon: false,
            tabBarShowBadge: false,
          };
        }}
      />
      <Tab.Screen
        name="MessagesScreen"
        component={ChatStack}
        listeners={{
          tabPress: e =>
            handleResetStack(e, 'MessagesScreen', 'MessagesScreen'),
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
            },
            tabBarLabel: Languages.MyChats,
            tabBarIconName: 'chatbubbles',
            tabBarIonIcon: true,
            tabBarShowBadge: true,
          };
        }}
      />
      <Tab.Screen
        name="ActiveOffers"
        component={OffersStack}
        listeners={{
          tabPress: e => handleResetStack(e, 'ActiveOffers', 'ActiveOffers'),
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
            },
            tabBarLabel: Languages.MyOffers,
            tabBarIconName: 'playlist-check',
            tabBarIonIcon: false,
            tabBarShowBadge: false,
          };
        }}
      />
      <Tab.Screen
        name="DrawerStack"
        component={ProfileStack}
        listeners={{
          tabPress: e => handleResetStack(e, 'DrawerStack', 'Drawer'),
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
            },
            tabBarLabel: Languages.Profile,
            tabBarIconName: 'account',
            tabBarIonIcon: false,
            tabBarShowBadge: false,
          };
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  labelStyle: {fontSize: 12, lineHeight: 18},
  BottomBarStyle: {
    paddingBottom: 12,
    paddingTop: 8,
    height: 70,
  },
  ActiveIcon: {
    backgroundColor: 'rgba(179, 157, 219, 0.45)',
    borderRadius: 15,
    paddingVertical: 2,
    width: 50,
    alignItems: 'center',
  },
});

export default BottomNavigation;
