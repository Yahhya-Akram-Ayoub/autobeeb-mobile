import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import IconFa from 'react-native-vector-icons/FontAwesome';
import Moment from 'moment';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth * 0.8;
const CARD_HEIGHT = CARD_WIDTH / 1.56;

const DealersBanner = ({
  item,
  dealerProfile = false,
  mobile,
  detailsScreen,
}) => {
  const navigation = useNavigation();
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const chat = useSelector(state => state.chat);
  const [showPhone, setShowPhone] = useState(false);
  const [failOverImage, setFailOverImage] = useState(false);
  const [failOverProfileImage, setFailOverProfileImage] = useState(false);
  const [date] = useState(new Date());
  const cca2 = ViewingCountry?.cca2;
  const Dealer = item?.User;
  const isOnline = chat.onlineUsers?.includes(Dealer?.ID);
  const DifferentCountry =
    `${item.ISOCode}`.toLocaleLowerCase() !== `${cca2}`.toLocaleLowerCase() &&
    item.ISOCode !== 'ALL';

  const handlePhonePress = (number, userId) => {
    if (showPhone) {
      Linking.openURL(`tel:${number}`);
    } else {
      setShowPhone(true);
      if (userId) KS.UpdateMobileClick({UserId: userId});
    }
  };

  const navigateToProfile = () => {
    navigation.navigate('DealerProfileScreen', {userid: Dealer.ID});
  };

  return (
    <TouchableOpacity
      style={[styles.card, DifferentCountry && styles.highlighted]}
      onPress={navigateToProfile}
      disabled={dealerProfile}>
      <FastImage
        style={styles.image}
        imageStyle={styles.imageInner}
        resizeMode="cover"
        source={
          item.ThumbImage && !failOverImage
            ? {uri: `https://autobeeb.com/${item.FullImagePath}_750x420.jpg`}
            : require('../../../images/Oldplaceholder.png')
        }
        onError={() => setFailOverImage(true)}>
        {!dealerProfile && (
          <View style={styles.adsBadge(isOnline)}>
            <Text style={styles.adsText}>
              {Languages.Ads + ' ' + item.ListingsCount}
            </Text>
          </View>
        )}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.3)',
            'rgba(0,0,0,0.5)',
            'rgba(0,0,0,0.7)',
          ]}
          style={styles.gradientOverlay}>
          <View style={styles.contentWrapper}>
            <View style={styles.profileContainer}>
              {Dealer?.ThumbImage && !failOverProfileImage ? (
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: `https://autobeeb.com/${Dealer.FullImagePath}_400x400.jpg?time=${date}`,
                  }}
                  onError={() => setFailOverProfileImage(true)}
                />
              ) : (
                <IconFa name="user-circle" size={50} color="#fff" />
              )}
              {isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.detailsContainer}>
              <Text numberOfLines={1} style={styles.name}>
                {Dealer?.Name}
              </Text>
              <View style={styles.locationRow}>
                {DifferentCountry && (
                  <FastImage
                    style={styles.flag}
                    resizeMode="contain"
                    source={{
                      uri: `https://autobeeb.com/wsImages/flags/${item.ISOCode}.png`,
                    }}
                  />
                )}
                {!!item.CityName && !!item.CountryName && !detailsScreen && (
                  <Text numberOfLines={1} style={styles.locationText}>
                    {item.CountryName + ', ' + item.CityName}
                  </Text>
                )}
              </View>
              {Dealer && detailsScreen && (
                <Text style={styles.memberSince}>
                  {Languages.MemberSince +
                    Moment(Dealer.RegistrationDate).format('YYYY-MM-DD')}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.actionsRow}>
            {!!Dealer?.Phone && !item.HideMobile && (
              <TouchableOpacity
                style={styles.phoneBtn}
                onPress={() => handlePhonePress(Dealer.Phone, Dealer.ID)}>
                <Text style={styles.phoneText}>
                  {showPhone
                    ? `‎${Dealer.Phone}`
                    : `${Dealer.Phone}`.replace(/.{4}$/, 'xxxx')}
                </Text>
              </TouchableOpacity>
            )}
            {!!item.Phone && (
              <TouchableOpacity
                style={styles.phoneBtn}
                onPress={() => handlePhonePress(item.Phone, Dealer.ID)}>
                <Text style={styles.phoneText}>
                  {showPhone
                    ? `‎${item.Phone}`
                    : `${item.Phone}`.replace(/.{4}$/, 'xxxx')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </FastImage>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: Color.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageInner: {
    borderRadius: 12,
  },
  adsBadge: isOnline => ({
    position: 'absolute',
    backgroundColor: isOnline ? 'green' : Color.primary,
    borderBottomLeftRadius: 12,
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  }),
  adsText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Constants.fontFamilyBold,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 0,
  },
  profileContainer: {
    position: 'relative',
    marginRight: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Constants.fontFamilyBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  flag: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  locationText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Constants.fontFamilySemiBold,
  },
  memberSince: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 4,
  },
  phoneBtn: {
    backgroundColor: Color.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  phoneText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default DealersBanner;
