import React, {memo, useMemo} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {
  CommonActions,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons'; // or your preferred icon lib
import {useSelector} from 'react-redux';
import {Color, Languages} from '../../common';
import IconIon from 'react-native-vector-icons/Ionicons';

const BottomNavigationBar = ({appRoot}) => {
  const navigation = useNavigation();
  const {unreadMessages} = useSelector(state => state?.chat);
  const firstScreenInStack = useNavigationState(state =>
    !state.routeNames || !state.routeNames?.length
      ? 'HomeScreen'
      : state.routeNames[0],
  );
  const tabItems = [
    {
      label: Languages.Home,
      icon: 'home',
      route: 'HomeScreen',
      active: 'HomeScreen',
    },
    {
      label: Languages.MyChats,
      icon: 'chat',
      route: 'MessagesScreen',
      hasBadge: true,
      active: 'MessagesScreen',
    },
    {
      label: Languages.MyOffers,
      icon: 'playlist-check',
      route: 'ActiveOffers',
      active: 'ActiveOffers',
    },
    {
      label: Languages.Profile,
      icon: 'account',
      route: 'DrawerStack',
      active: 'Drawer',
    },
  ];
  const handleNavigate = screen => {
    if (appRoot) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: appRoot,
              state: {
                routes: [{name: screen}],
                index: 0,
              },
            },
          ],
        }),
      );
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      {tabItems.map((item, index) => {
        const isActive =
          item.active === firstScreenInStack ||
          (item.route === 'ActiveOffers' &&
            firstScreenInStack === 'SplashScreen'); // to handle PostOfferScreen

        return (
          <Pressable
            key={index}
            onPress={() => handleNavigate(item.route)}
            style={[styles.tabItem, isActive && {gap: 3}]}>
            <View style={[styles.iconWrapper, isActive && styles.activeIcon]}>
              <View style={{height: 25, maxHeight: 25, minHeight: 25}}>
                {item.icon == 'chat' ? (
                  <IconIon
                    name="chatbubbles"
                    color={isActive ? Color.secondary : Color.tabBarInactive}
                    size={20}
                    style={{marginTop: 2}}
                  />
                ) : (
                  <IconMC
                    name={item.icon}
                    size={25}
                    color={isActive ? Color.secondary : Color.tabBarInactive} // you can update with active state logic
                  />
                )}
              </View>

              {item.hasBadge && unreadMessages > 0 && (
                <View style={styles.badge}>
                  <Text numberOfLines={1} style={styles.badgeText}>
                    {unreadMessages}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 12,
    paddingTop: 10,
    height: 70,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 17,
    // color: Color.tabBarInactive,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeIcon: {
    backgroundColor: 'rgba(179, 157, 219, 0.45)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
});

export default memo(BottomNavigationBar);
