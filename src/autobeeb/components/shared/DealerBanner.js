import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Linking, StyleSheet} from 'react-native';
import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {Color, Constants, Languages} from '../../../common';
import {AppIcon, Icons} from './AppIcon';
import KS from '../../../services/KSAPI';
import {screenWidth} from '../../constants/Layout';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const DealerBanner = ({userId, dealer, listingId}) => {
  const [showPhone, setShowPhone] = useState(false);
  const [failOverImage, setFailOverImage] = useState(false);
  const [failOverProfileImage, setFailOverProfileImage] = useState(false);
  const [differentCountry, setDifferentCountry] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const {cca2} = ViewingCountry;
  const isOnline = false; // handle later

  useEffect(() => {
    if (userId && !dealer) loadData();
    if (dealer && !userId) {
      setUser(dealer);
      const _differentCountry =
        cca2.toLowerCase() !== 'all' &&
        cca2.toLowerCase() !== dealer?.isoCode?.toLowerCase();
      setDifferentCountry(_differentCountry);
    }
  }, [userId]);

  const loadData = () => {
    KS.GetUserCore({userId: userId, langId: Languages.langID}).then(userRes => {
      setUser(userRes.user);
      const _differentCountry =
        cca2.toLowerCase() !== 'all' &&
        cca2.toLowerCase() !== userRes.user?.isoCode?.toLowerCase();
      setDifferentCountry(_differentCountry);
    });
  };

  const imageSource =
    user?.coverThumbImage && !failOverImage
      ? {uri: `https://autobeeb.com/${user?.coverFullImagePath}_750x420.jpg`}
      : require('../../../images/Oldplaceholder.png');

  const profileImage =
    user?.thumbImage && !failOverProfileImage
      ? {
          uri: `https://autobeeb.com/${user?.fullImagePath}_400x400.jpg`,
        }
      : null;

  const handlePhonePress = number => {
    if (showPhone) {
      Linking.openURL(`tel:${number}`);
    } else {
      setShowPhone(true);
      KS.UpdateMobileClick({UserId: user.ID, ListingId: listingId});
    }
  };
  if (!user) return <View />;

  return (
    <TouchableOpacity
      style={[
        styles.containerStyles,
        differentCountry && styles.containerStylesDC,
      ]}
      onPress={() =>
        navigation.navigate('DealerProfileScreen', {userid: user.id})
      }>
      <FastImage
        style={styles.coverStyle}
        resizeMode="cover"
        source={imageSource}
        onError={() => setFailOverImage(true)}
      />
      <View style={styles.adCountBox}>
        <Text style={styles.adCountText}>
          {Languages.Ads + '' + user.activeListings}
        </Text>
      </View>
      <LinearGradient colors={styles.gradientColors}>
        <View style={styles.profileRow}>
          <View>
            {profileImage ? (
              <FastImage
                style={styles.profileImage}
                source={profileImage}
                onError={() => setFailOverProfileImage(true)}
              />
            ) : (
              <AppIcon
                type={Icons.FontAwesome}
                name="user-circle"
                size={50}
                color="#fff"
                style={styles.icon}
              />
            )}
            {isOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.nameInfo}>
            <Text numberOfLines={1} style={styles.nameText}>
              {user.name}
            </Text>
            <View style={styles.locationRow}>
              {differentCountry && (
                <FastImage
                  style={styles.flagImage}
                  resizeMode="contain"
                  source={{
                    uri: `https://autobeeb.com/wsImages/flags/${user.isoCode}.png`,
                  }}
                />
              )}
              {user.cityName && user.countryName && (
                <Text numberOfLines={1} style={styles.cityText}>
                  {user.countryName + ', ' + user.cityName}
                </Text>
              )}
            </View>

            <Text style={styles.memberSince}>
              {Languages.MemberSince +
                Moment(user.registrationDate).format('YYYY-MM-DD')}
            </Text>
          </View>
        </View>
        <View style={styles.phoneRow}>
          {!!(user.phone && !user.hideMobile) && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => handlePhonePress(user.phone)}>
              <Text style={[styles.phoneText]}>
                {showPhone
                  ? `\u200E${user.mobile || user.phone}`
                  : `${user.mobile || user.phone}`.replace(/.{4}$/, 'xxxx')}
              </Text>
            </TouchableOpacity>
          )}
          {user.hideMobile && user.mobile && user.mobile !== user.phone && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => handlePhonePress(user.phone)}>
              <Text style={[styles.phoneText]}>
                {showPhone
                  ? `\u200E${user.mobile}`
                  : `${user.mobile}`.replace(/.{4}$/, 'xxxx')}
              </Text>
            </TouchableOpacity>
          )}
          {!!user.phone && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => {
                if (showPhone) {
                  Linking.openURL(`tel:${user.phone}`);
                } else {
                  setShowPhone(true);
                  user.id &&
                    KS.UpdateMobileClick({
                      UserId: user.id,
                      ListingId: listingId,
                    });
                }
              }}>
              <Text style={[styles.phoneText]}>
                {showPhone
                  ? `\u200E${user.phone}`
                  : `${user.phone}`.replace(/.{4}$/, 'xxxx')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
      {differentCountry && <View style={styles.overlay} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyles: {
    alignSelf: 'center',
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 5,
    justifyContent: 'flex-end',
  },
  containerStylesDC: {borderWidth: 2, borderColor: Color.primary},
  coverStyle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  adCountBox: {
    position: 'absolute',
    backgroundColor: Color.primary,
    borderBottomLeftRadius: 5,
    top: 0,
    zIndex: 10,
    right: 0,
    paddingHorizontal: 5,
  },
  adCountText: {
    color: '#fff',
    textAlign: 'center',
  },
  nameInfo: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
  },
  gradientColors: [
    'rgba(0,0,0,0)',
    'rgba(0,0,0,0.4)',
    'rgba(0,0,0,0.5)',
    'rgba(0,0,0,0.6)',
    'rgba(0,0,0,.7)',
  ],
  profileRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 5,
  },
  icon: {
    marginRight: 15,
    flex: 1,
  },
  onlineDot: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: 'green',
    position: 'absolute',
    bottom: 5,
    end: 3,
  },
  nameText: {
    color: '#fff',
    fontSize: 14,
    zIndex: 3,
    fontFamily: Constants.fontFamilyBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  cityText: {
    color: '#fff',
    fontSize: 12,
    zIndex: 3,
    fontFamily: Constants.fontFamilyBold,
  },
  memberSince: {
    color: '#fff',
    fontSize: 12,
    zIndex: 3,
    fontFamily: Constants.fontFamilyBold,
  },
  phoneRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 5,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  phoneButton: {
    backgroundColor: Color.secondary,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 5,
    zIndex: 1000,
  },
  phoneText: {
    textAlign: 'left',
    color: '#fff',
  },
  overlay: {
    backgroundColor: 'rgba(128,128,128,0.3)',
    position: 'absolute',
    zIndex: 2,
    top: 0,
    width: '100%',
    height: '100%',
  },
});

export default DealerBanner;
