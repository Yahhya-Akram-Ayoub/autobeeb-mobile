import React, {useRef, useEffect} from 'react';
import {View, Pressable, Text, Animated, StyleSheet} from 'react-native';
import {Color} from '../../common';
import {useSelector} from 'react-redux';
import {AppIcon, Icons} from '../components/shared/AppIcon';

const BottomTabBar = ({state, descriptors, navigation}) => {
  const {unreadMessages} = useSelector(state => state.chat || {});
  const animatedValues = useRef(
    state.routes.map((_, index) => ({
      scale: new Animated.Value(state.index === index ? 1 : 0.9),
      opacity: new Animated.Value(state.index === index ? 1 : 0.6),
    })),
  ).current;

  useEffect(() => {
    animatedValues.forEach((anim, index) => {
      const isFocused = index === state.index;
      Animated.parallel([
        Animated.spring(anim.scale, {
          toValue: isFocused ? 1 : 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: isFocused ? 1 : 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [state.index]);

  const tabBarStyle =
    descriptors[state.routes[state.index].key]?.options?.tabBarStyle;
  return (
    <View style={[styles.tabBar, tabBarStyle]}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = options.tabBarIconName;
        const isIonIcon = options.tabBarIonIcon;
        const showBadge = options.tabBarShowBadge;

        const {scale, opacity} = animatedValues[index];

        return (
          <Pressable key={index} onPressIn={onPress} style={styles.tabButton}>
            <Animated.View
              style={[
                styles.iconWrapper,
                {transform: [{scale}], opacity},
                isFocused && styles.activeIcon,
              ]}>
              {isIonIcon ? (
                <AppIcon
                  type={Icons.Ionicons}
                  name={iconName}
                  size={22}
                  color={isFocused ? Color.secondary : '#000'}
                />
              ) : (
                <AppIcon
                  type={Icons.MaterialCommunityIcons}
                  name={iconName}
                  size={25}
                  color={isFocused ? Color.secondary : '#000'}
                />
              )}
              {showBadge && unreadMessages > 0 && (
                <View style={styles.badgeStyle}>
                  <Text style={styles.badgeText}>{unreadMessages}</Text>
                </View>
              )}
            </Animated.View>
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    color: '#000',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: 'rgba(179, 157, 219, 0.45)',
    borderRadius: 15,
    paddingVertical: 2,
    width: 50,
  },
  badgeStyle: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
  },
});

export default BottomTabBar;
