import {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Linking} from 'react-native';
import FastImage from 'react-native-fast-image';
import Moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {AppIcon, Icons} from './AppIcon';

const UserBanner = ({user: userData, userId, listingId}) => {
  const navigation = useNavigation();
  const [showPhone, setShowPhone] = useState(false);
  const [user, setUser] = useState(null);
  const isOnline = false; // handle later

  useEffect(() => {
    if (userId && !userData) loadData();
    if (userData && !userId) {
      setUser(userData);
    }
  }, [userId]);

  const loadData = () => {
    KS.GetUserCore({userId: userId, langId: Languages.langID}).then(userRes => {
      setUser(userRes.user);
    });
  };

  const handlePhonePress = () => {
    if (showPhone) {
      Linking.openURL(`tel:${user.phone}`);
    } else {
      setShowPhone(true);
      KS.UpdateMobileClick({
        UserId: userId,
        ListingId: listingId,
      });
    }
  };

  if (!user) return <View />;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate('UserProfileScreen', {
          userid: user.id,
        })
      }>
      <View style={styles.imageWrapper}>
        <FastImage
          style={styles.image}
          resizeMode="contain"
          source={
            user?.thumbImage
              ? {
                  uri: `https://autobeeb.com/${user.fullImagePath}_400x400.jpg`,
                }
              : require('../../../images/seller.png')
          }
        />
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.userInfo}>
        <Text numberOfLines={1} style={styles.userName}>
          {user.name}
        </Text>

        <Text style={styles.memberSince}>
          {Languages.MemberSince +
            Moment(user.registrationDate).format('YYYY-MM-DD')}
        </Text>

        <TouchableOpacity style={styles.callButton} onPress={handlePhonePress}>
          <AppIcon
            type={Icons.FontAwesome}
            name="phone"
            size={16}
            color={Color.secondary}
          />
          <Text numberOfLines={1} style={styles.phoneText}>
            {showPhone
              ? `\u200E${user.phone}`
              : `${user.phone}`.replace(/.{4}$/, 'xxxx')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Color.secondary,
    padding: 15,
    borderRadius: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 5,
  },
  onlineDot: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: 'green',
    position: 'absolute',
    bottom: -5,
    end: 0,
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    textAlign: 'center',
    fontSize: 17,
    color: '#000',
    lineHeight: 24,
    fontFamily: Constants.fontFamilySemiBold,
  },
  memberSince: {
    lineHeight: 24,
    fontSize: 12,
    color: Color.blackTextSecondary,
    fontFamily: Constants.fontFamilySemiBold,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Color.secondary,
    borderRadius: 3,
    paddingHorizontal: 12,
  },
  phoneText: {
    color: Color.secondary,
    fontSize: 14,
    fontFamily: Constants.fontFamilyBold,
  },
});

export default UserBanner;
