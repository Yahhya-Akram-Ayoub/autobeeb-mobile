import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import IconFa from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Layout from '../../constants/Layout';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';

const DealerBanner = ({
  item,
  cca2 = 'ALL',
  full = false,
  dealerProfile = false,
  detailsScreen = false,
  mobile,
  date = new Date(),
}) => {
  const navigation = useNavigation();
  const chat = useSelector(state => state.chat);

  const [failOverImage, setFailOverImage] = useState(false);
  const [failOverProfileImage, setFailOverProfileImage] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const coverPhoto = item.FullImagePath;
  const profilePhoto = item?.User?.FullImagePath;
  const Dealer = item.User;
  const isOnline = chat.onlineUsers?.includes(Dealer?.ID);
  const DifferentCountry = cca2 !== 'ALL' && cca2 && cca2 !== item.ISOCode;

  const handlePhonePress = (phoneNumber, userId) => {
    if (showPhone) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      setShowPhone(true);
      if (userId) {
        KS.UpdateMobileClick({UserId: userId});
      }
    }
  };

  const renderPhoneButton = (phoneNumber, userId) => {
    const displayNumber = showPhone
      ? `\u200E${phoneNumber}`
      : `${phoneNumber}`.replace(/.{4}$/, 'xxxx');

    return (
      <TouchableOpacity
        style={styles.phoneButton}
        onPress={() => handlePhonePress(phoneNumber, userId)}>
        <Text style={[styles.phoneText, !full && {fontSize: 14}]}>
          {displayNumber}
        </Text>
      </TouchableOpacity>
    );
  };

  const bannerWidth = dealerProfile
    ? Layout.screenWidth
    : full
    ? Layout.screenWidth * 0.95
    : Layout.screenWidth * 0.85;

  const bannerHeight = dealerProfile
    ? Layout.screenWidth / 1.7
    : full
    ? (Layout.screenWidth * 0.95) / 1.56
    : (Layout.screenWidth * 0.85) / 1.56;

  if (!Dealer) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: bannerWidth,
          height: bannerHeight,
          borderRadius: dealerProfile ? 0 : 5,
          marginVertical: dealerProfile ? 0 : 5,
          borderWidth: full ? 0 : 1,
          borderColor: full ? 'transparent' : '#ddd',
        },
        DifferentCountry && {
          borderWidth: 3,
          borderColor: Color.primary,
        },
      ]}
      onPress={() =>
        navigation.navigate('DealerProfileScreen', {userid: Dealer.ID})
      }
      disabled={dealerProfile}>
      <FastImage
        style={[
          styles.bannerImage,
          {
            width: bannerWidth,
            height: bannerHeight,
            borderRadius: dealerProfile ? 0 : 5,
          },
        ]}
        imageStyle={{borderRadius: dealerProfile ? 0 : 5}}
        resizeMode="cover"
        source={
          item.ThumbImage && !failOverImage
            ? {uri: 'https://autobeeb.com/' + coverPhoto + '_750x420.jpg'}
            : require('../../../images/Oldplaceholder.png')
        }
        onError={() => setFailOverImage(true)}>
        {!dealerProfile && (
          <View style={styles.adsBadge}>
            <Text style={styles.adsText}>
              {Languages.Ads + '' + item.ListingsCount}
            </Text>
          </View>
        )}

        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.5)',
            'rgba(0,0,0,0.6)',
            'rgba(0,0,0,.7)',
          ]}
          style={styles.gradient}>
          <View style={styles.profileContainer}>
            <View>
              {Dealer && Dealer.ThumbImage && !failOverProfileImage ? (
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: `https://autobeeb.com/${profilePhoto}_400x400.jpg?time=${date}`,
                  }}
                  onError={() => setFailOverProfileImage(true)}
                />
              ) : (
                <IconFa
                  name="user-circle"
                  size={50}
                  color={'#fff'}
                  style={styles.profileFallback}
                />
              )}
              {isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.infoContainer}>
              <Text numberOfLines={1} style={styles.dealerName}>
                {Dealer.Name}
              </Text>

              <View style={styles.locationContainer}>
                {DifferentCountry && (
                  <FastImage
                    style={styles.flagImage}
                    resizeMode="contain"
                    source={{
                      uri: `https://autobeeb.com/wsImages/flags/${item.ISOCode}.png`,
                    }}
                  />
                )}
                {item.CityName && item.CountryName && !detailsScreen && (
                  <Text numberOfLines={1} style={styles.locationText}>
                    {item.CountryName + ', ' + item.CityName}
                  </Text>
                )}
              </View>

              {detailsScreen && (
                <Text style={styles.memberSinceText}>
                  {Languages.MemberSince +
                    Moment(Dealer.RegistrationDate).format('YYYY-MM-DD')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.phoneButtonsContainer}>
            {!!(Dealer.Phone && !item.HideMobile) &&
              renderPhoneButton(mobile || Dealer.Phone, Dealer.ID)}
            {item.HideMobile &&
              mobile &&
              mobile !== Dealer.Phone &&
              renderPhoneButton(mobile, Dealer.ID)}
            {!!item.Phone && renderPhoneButton(item.Phone, item.ID)}
          </View>
        </LinearGradient>

        {DifferentCountry && <View style={styles.differentCountryOverlay} />}
      </FastImage>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  bannerImage: {
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  adsBadge: {
    position: 'absolute',
    backgroundColor: 'green',
    borderBottomLeftRadius: 5,
    top: 0,
    zIndex: 10,
    right: 0,
    paddingHorizontal: 5,
  },
  adsText: {
    color: '#fff',
    textAlign: 'center',

  },
  gradient: {
    width: '100%',
    paddingBottom: 5,
  },
  profileContainer: {
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
  profileFallback: {
    marginRight: 15,
    flex: 1,
  },
  onlineIndicator: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: 'green',
    position: 'absolute',
    bottom: 5,
    end: 3,
  },
  infoContainer: {
    flex: 5,
  },
  dealerName: {
    color: '#fff',
    textAlign: 'left',
    fontSize: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  locationText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'left',
  },
  memberSinceText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'left',
  },
  phoneButtonsContainer: {
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
  },
  phoneText: {
    textAlign: 'left',
    color: '#fff',
  },
  differentCountryOverlay: {
    backgroundColor: 'rgba(128,128,128,0.3)',
    position: 'absolute',
    zIndex: 999,
    top: 0,
    width: '100%',
    height: '100%',
  },
});

export default DealerBanner;
