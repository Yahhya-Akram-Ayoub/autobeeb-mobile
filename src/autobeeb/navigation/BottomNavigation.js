import React, {useEffect} from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
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

const Tab = createBottomTabNavigator();
const hideOnScreens = ['ListingsScreen', 'CarDetails', 'SearchResult'];

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

  const getTabOptions = (
    route,
    label,
    iconName,
    isIonIcon = false,
    showBadge = false,
  ) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Default';
    const isHidden = hideOnScreens.includes(routeName);

    return {
      tabBarStyle: {
        display: isHidden ? 'none' : 'flex',
        ...styles.BottomBarStyle,
      },
      tabBarLabel: ({color, focused}) => (
        <Text style={styles.labelStyle}>{label}</Text>
      ),
      tabBarIcon: ({focused}) => (
        <View style={[{position: 'relative'}, focused && styles.ActiveIcon]}>
          {isIonIcon ? (
            <IconIon
              name={iconName}
              color={focused ? Color.secondary : Color.tabBarInactive}
              size={22}
            />
          ) : (
            <IconMC
              name={iconName}
              color={focused ? Color.secondary : Color.tabBarInactive}
              size={25}
            />
          )}
          {showBadge && unreadMessages > 0 && (
            <View style={styles.badgeStyle}>
              <Text style={styles.badgeText}>{unreadMessages}</Text>
            </View>
          )}
        </View>
      ),
      tabBarButton: props => (
        <Pressable {...props} android_ripple={null}>
          {props.children}
        </Pressable>
      ),
    };
  };

  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeStack}
        listeners={{
          tabPress: e => handleResetStack(e, 'HomeScreen', 'HomeScreen'),
        }}
        options={({route}) => getTabOptions(route, Languages.Home, 'home')}
      />
      <Tab.Screen
        name="MessagesScreen"
        component={ChatStack}
        listeners={{
          tabPress: e =>
            handleResetStack(e, 'MessagesScreen', 'MessagesScreen'),
        }}
        options={({route}) =>
          getTabOptions(route, Languages.MyChats, 'chatbubbles', true, true)
        }
      />
      <Tab.Screen
        name="ActiveOffers"
        component={OffersStack}
        listeners={{
          tabPress: e => handleResetStack(e, 'ActiveOffers', 'ActiveOffers'),
        }}
        options={({route}) =>
          getTabOptions(route, Languages.MyOffers, 'playlist-check')
        }
      />
      <Tab.Screen
        name="DrawerStack"
        component={ProfileStack}
        listeners={{
          tabPress: e => handleResetStack(e, 'DrawerStack', 'Drawer'),
        }}
        options={({route}) =>
          getTabOptions(route, Languages.Profile, 'account')
        }
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
