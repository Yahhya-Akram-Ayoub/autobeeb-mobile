import React, {Component} from 'react';
import {
  View,
  Platform,
  Image,
  TouchableOpacity,
  Text,
  I18nManager,
} from 'react-native';

import {Styles, Color, Constants, Images, Languages} from './common';
import {NavigationBarIcon, CartIcons} from './components';
import {openDrawer} from './Omni';
import Entypo from 'react-native-vector-icons/Entypo';

// Icons for HeaderBar
const Logo = navigation => (
  <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
    <Image source={Images.NewLogo} style={Styles.Common.logo} />
  </TouchableOpacity>
);

const NoClickLogo = () => (
  <Image source={Images.NewLogo} style={Styles.Common.logo} />
);

const hitSlop = {top: 20, right: 20, bottom: 20, left: 20};
const Menu = () => (
  <TouchableOpacity
    hitSlop={hitSlop}
    onPress={openDrawer}
    style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 20,
    }}>
    <Entypo name="menu" size={35} color={Color.secondary} />
  </TouchableOpacity>
);

const EmptyView = () => (
  <View
    style={[
      Styles.Common.Row,
      Constants.RTL ? {left: -10} : {right: -5},
      Platform.OS !== 'ios' && {right: -12},
    ]}
  />
);

const HeaderRight = navigation => (
  <View
    style={[
      Styles.Common.Row,
      {justifyContent: 'center', alignItems: 'center', flexDirection: 'row'},
    ]}>
    <TouchableOpacity style={{}} onPress={() => navigation.navigate('Search')}>
      <Text
        style={{
          fontFamily: 'Cairo-Regular',
          color: Color.primary,
        }}>
        {Languages.Search}
      </Text>
    </TouchableOpacity>

    <NavigationBarIcon
      icon={Images.IconSearch}
      size={18}
      onPress={() => navigation.navigate('Search')}
      color={'#D24B92'}
    />
  </View>
);

const HeaderHomeRight = (navigation, item) => (
  <View
    style={[
      Styles.Common.Row,
      Constants.RTL ? {left: -10} : {right: 5},
      Platform.OS !== 'ios' && {right: -12},
    ]}>
    <NavigationBarIcon icon={Images.IconGrid} size={17} color={Color.primary} />
  </View>
);

const CartWishListIcons = navigation => <CartIcons navigation={navigation} />;

const Back = navigation => (
  <TouchableOpacity
    hitSlop={hitSlop}
    onPress={() => {
      navigation.goBack();
    }}>
    <Image
      source={Images.icons.back}
      style={[
        Styles.Common.toolbarIcon,
        I18nManager.isRTL && {transform: [{rotate: '180deg'}]},
      ]}
    />
  </TouchableOpacity>
);

export {
  Logo,
  NoClickLogo,
  Menu,
  HeaderRight,
  EmptyView,
  CartWishListIcons,
  HeaderHomeRight,
  Back,
};
