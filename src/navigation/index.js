import React, {useCallback, useEffect} from 'react';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {Text, StyleSheet, View, Linking} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {SplashScreen} from '../containers';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import SearchScreen from './SearchScreen';
import ListingsScreen from './ListingsScreen';
import HomeScreen from './HomeScreen';
import ForgotPassword from './ForgotPassword';
import SettingScreen from './SettingScreen';
import EditProfile from './EditProfile';
import MessagesScreen from './MessagesScreen';
import ChatScreen from './ChatScreen';
import LanguageSelector from './LanguageSelector';
import RecentListings from './RecentListings';
import CarDetails from './CarDetails';
import SpecialPlans from './SpecialPlans';
// import SpecialSubscription from './SpecialSubscription';
import SellTypeScreen from './SellTypeScreen';
import MakesScreen from './MakesScreen';
import PostOfferScreen from './PostOfferScreen';
import SectionsScreen from './SectionsScreen';
import CategoriesScreen from './CategoriesScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import DealerSignUp from './DealerSignUp';
import DealersScreen from './DealersScreen';
import DealerProfileScreen from './DealerProfileScreen';
import UserProfileScreen from './UserProfileScreen';
import ActiveOffers from './ActiveOffers';
import InactiveOffers from './InactiveOffers';
import PrivacyPolicy from './PrivacyPolicy';
import SearchResult from './SearchResult';
import FavoriteScreen from './FavoriteScreen';
import BlogDetails from './BlogDetails';
import Color from './../common/Color';
import Languages from './../common/Languages';
import Drawer from './../components/Drawer';
import BlogsScreen from './BlogsScreen';
import RecentlyViewedScreen from './RecentlyViewedScreen';
import SubscriptionsScreen from './SubscriptionsScreen';
import PaymentDetailsAutobeeb from './PaymentDetailsAutobeeb';
import CliQScreen from './CliQScreen';
import {useDispatch, useSelector} from 'react-redux';
import {CommonActions} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import {DealerPlusRenewal} from '../components/DealerPlusRenewal';
import {actions} from '../redux/UserRedux';
import messaging from '@react-native-firebase/messaging';
import KS from '../services/KSAPI';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconIon from 'react-native-vector-icons/Ionicons';
import {ExtractScreenObjFromUrl} from '../common';

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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AppStack = ({route, navigation}) => {
  const user = useSelector(x => x.user.user);
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
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        initialRouteName: 'HomeScreen',
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
      <Stack.Screen name="CarDetails" component={CarDetails} />
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
      <Stack.Screen
        name="RecentlyViewedScreen"
        component={RecentlyViewedScreen}
      />
      <Stack.Screen
        name="SubscriptionsScreen"
        component={SubscriptionsScreen}
      />
    </Stack.Navigator>
  );
};

const DrawerStack = () => {
  const user = useSelector(x => x.user.user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        cardShadowEnabled: false,
        tabBarStyle: {display: 'none'},
        initialRouteName: 'Drawer',
      }}>
      <Stack.Screen name="Drawer" component={Drawer} />
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

const ChatStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        cardShadowEnabled: false,
        tabBarStyle: {display: 'none'},
        initialRouteName: 'MessagesScreen',
      }}>
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
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

const MyOffersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        cardShadowEnabled: false,
        tabBarStyle: {display: 'none'},
      }}
      navigationOptions={{
        headerVisible: false,
        initialRouteName: 'ActiveOffers',
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

const hideOnScreens = ['ListingsScreen', 'CarDetails', 'SearchResult'];
const BottomNavigation = () => {
  let {unreadMessages} = useSelector(state => state?.chat);
  const navigation = useNavigation();

  const setupNotification = () => {
    messaging().onNotificationOpenedApp(async remoteMessage => {
      const notification = remoteMessage;
      if (notification && notification.data) {
        navigateToChatScreen(notification.data);
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const notification = remoteMessage;
          if (notification && notification.data) {
            navigateToChatScreen(notification.data);
          }
        }
      });

    messaging().setBackgroundMessageHandler(remoteMessage => {
      if (remoteMessage) {
        const notification = remoteMessage;
        if (notification && notification.data) {
          navigateToChatScreen(notification.data);
        }
      }
    });
  };

  const navigateToChatScreen = ({SessionId, UserId, ReceiverId}) => {
    KS.GetChatSession({SessionId, LangId: Languages.ID}).then(res => {
      let entity = !!res.Session.RelatedEntity
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

  setupNotification();

  const handleResetStack = ({screen_name}) => {
    try {
      navigation.dispatch(StackActions.popToTop());
    } catch (err) {
      // no things
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerVisible: false,
        cardShadowEnabled: false,
        tabBarStyle: styles.BottomBarStyle,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="HomeScreen"
      labeled={true}
      shifting={false}
      activeColor={Color.secondary}
      inactiveColor={Color.tabBarInactive}
      navigationOptions={{
        navigationOptions: false,
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={AppStack}
        listeners={{
          tabPress: () => {
            handleResetStack('HomeScreen');
          },
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
              ...styles.BottomBarStyle,
            },
            tabBarLabel: ({color, focused}) => (
              <Text style={styles.labelStyle}>{Languages.Home}</Text>
            ),
            tabBarIcon: ({focused, color}) => (
              <View style={focused && styles.ActiveIcon}>
                <IconMC
                  name="home"
                  color={focused ? Color.secondary : Color.tabBarInactive}
                  size={25}
                />
              </View>
            ),
          };
        }}
      />
      <Tab.Screen
        name="MessagesScreen"
        component={ChatStack}
        listeners={{
          tabPress: () => {
            handleResetStack('MessagesScreen');
          },
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
              ...styles.BottomBarStyle,
            },
            tabBarLabel: ({color, focused}) => (
              <Text style={styles.labelStyle}>{Languages.MyChats}</Text>
            ),
            tabBarIcon: ({focused, color}) => (
              <View
                style={[{position: 'relative'}, focused && styles.ActiveIcon]}>
                <IconIon
                  name="chatbubbles"
                  color={focused ? Color.secondary : Color.tabBarInactive}
                  size={20}
                />
                {!!unreadMessages && (
                  <View
                    style={{
                      position: 'absolute',
                      right: -6,
                      top: -6,
                      backgroundColor: 'red',
                      width: 18,
                      height: 18,
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                      {unreadMessages}
                    </Text>
                  </View>
                )}
              </View>
            ),
          };
        }}
      />
      <Tab.Screen
        name="ActiveOffers"
        component={MyOffersStack}
        listeners={{
          tabPress: () => {
            handleResetStack('ActiveOffers');
          },
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
              ...styles.BottomBarStyle,
            },
            tabBarLabel: ({color, focused}) => (
              <Text style={styles.labelStyle}>{Languages.MyOffers}</Text>
            ),
            tabBarIcon: ({focused, color}) => (
              <View style={focused && styles.ActiveIcon}>
                <IconMC
                  name="playlist-check"
                  color={focused ? Color.secondary : Color.tabBarInactive}
                  size={25}
                />
              </View>
            ),
          };
        }}
      />
      <Tab.Screen
        name="DrawerStack"
        component={DrawerStack}
        listeners={{
          tabPress: () => {
            handleResetStack('DrawerStack');
          },
        }}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
          const isTabBarHidden = hideOnScreens.includes(routeName);

          return {
            tabBarStyle: {
              display: isTabBarHidden ? 'none' : 'flex',
              ...styles.BottomBarStyle,
            },
            tabBarLabel: ({color, focused}) => (
              <Text style={styles.labelStyle}>{Languages.Profile}</Text>
            ),
            tabBarIcon: ({focused, color}) => (
              <View style={focused && styles.ActiveIcon}>
                <IconMC
                  name="account"
                  color={focused ? Color.secondary : Color.tabBarInactive}
                  size={25}
                />
              </View>
            ),
          };
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen
          name="CarDetails"
          component={CarDetails}
          options={({route}) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
            const isTabBarHidden = hideOnScreens.includes(routeName);
            return {
              tabBarStyle: {
                display: isTabBarHidden ? 'none' : 'flex',
                ...styles.BottomBarStyle,
              },
            };
          }}
        />
        <Stack.Screen name="LanguageSelector" component={LanguageSelector} />
        <Stack.Screen name="App" component={BottomNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
