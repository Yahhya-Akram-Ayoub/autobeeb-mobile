import React, {useEffect, useState} from 'react';
import {
  Platform,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {Color, Constants, Languages} from '../../../common';
import Layout from '../../constants/Layout';
import {AppIcon, Icons} from '../shared/AppIcon';

const DeaweHeader = ({data}) => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const isDealer = !!user?.IsDealer;
  const [hasBanner, setHasBanner] = useState(true);
  const [hasImage, setHasImage] = useState(true);
  const [phoneClicks, setPhoneClicks] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  const handleEdit = () => {
    navigation.navigate(isDealer ? 'DealerSignUp' : 'EditProfile', {
      Edit: true,
    });
  };

  useEffect(() => {
    if (data) {
      setPhoneClicks(
        (data?.Statistic?.TotalClicks ?? 0) +
          (data?.Statistic?.ProfileClicks ?? 0),
      );
      setTotalViews(
        (data?.Statistic?.ViewsClicks ?? 0) + (data?.Statistic?.ScViews ?? 0),
      );
    }
  }, [data]);

  if (!user) {
    return <View />;
  }

  const bannerHeight = Layout.screenWidth / 1.77;

  return (
    <View
      style={StyleSheet.flatten([
        styles.headerContainer,
        {height: isDealer ? bannerHeight : 85},
      ])}>
      {!!totalViews && (
        <View style={styles.ViewsBanner}>
          <AppIcon
            type={Icons.FontAwesome5}
            name={'eye'}
            size={19}
            color={'#fff'}
          />
          <Text style={styles.phoneBannerText}>{totalViews}</Text>
        </View>
      )}

      {isDealer && !!phoneClicks && (
        <View style={styles.phoneBanner}>
          <AppIcon
            type={Icons.Entypo}
            name={'phone'}
            size={19}
            color={'#fff'}
          />
          <Text style={styles.phoneBannerText}>{phoneClicks}</Text>
        </View>
      )}

      {isDealer && (
        <TouchableOpacity
          onPress={handleEdit}
          style={[styles.bannerTouchable, {height: bannerHeight}]}>
          {hasBanner ? (
            <Image
              style={[styles.bannerImage, {height: bannerHeight}]}
              resizeMode="cover"
              source={{
                uri: `http://autobeeb.com/content/dealers/${user.ID}/${user.ID}_1024x653.jpg?Trigger=${user.trigger}`,
              }}
              onError={() => setHasBanner(false)}
            />
          ) : (
            <Image
              style={[styles.placeholderImage, {height: bannerHeight}]}
              resizeMode="contain"
              source={require('../../../images/Oldplaceholder.png')}
            />
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleEdit} style={{flex: 1}}>
        <LinearGradient
          colors={
            isDealer
              ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']
              : [
                  'rgba(255,255,255,0.3)',
                  'rgba(255,255,255,0.5)',
                  'rgba(255,255,255,0.8)',
                ]
          }
          style={StyleSheet.flatten([
            styles.gradientContainer,
            {marginTop: isDealer ? 130 : 0},
          ])}>
          {user?.ThumbImage && hasImage ? (
            <Image
              style={styles.profileImage}
              source={{
                uri: `https://autobeeb.com/${user.FullImagePath}_400x400.jpg`,
              }}
              onError={() => setHasImage(false)}
            />
          ) : (
            <AppIcon
              type={Icons.FontAwesome}
              name="user-circle"
              size={50}
              color={isDealer ? 'white' : 'black'}
              style={styles.fallbackIcon}
            />
          )}

          <TouchableOpacity style={styles.nameContainer} disabled>
            <Text
              style={[styles.nameText, {color: isDealer ? '#fff' : '#000'}]}>
              {user?.Name?.charAt(0).toUpperCase() + user?.Name?.slice(1, 22)}
            </Text>
            <Text
              style={[styles.editText, {color: isDealer ? '#fff' : '#000'}]}>
              {Languages.EditProfile}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default DeaweHeader;

const styles = StyleSheet.create({
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    paddingTop: Platform.select({ios: 5, android: 25}),
  },
  logo: {
    width: Layout.screenWidth * 0.6,
    height: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    paddingTop: Platform.select({ios: isIphoneX() ? 25 : 5, android: 0}),
  },
  bannerTouchable: {
    position: 'absolute',
    width: Layout.screenWidth,
  },
  bannerImage: {
    width: Layout.screenWidth,
  },
  placeholderImage: {
    alignSelf: 'center',
  },
  gradientContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 10,
    marginVertical: 15,
  },
  fallbackIcon: {
    marginLeft: 10,
    marginVertical: 15,
  },
  nameContainer: {
    marginLeft: 10,
  },
  nameText: {
    fontSize: 18,
    textAlign: 'left',
  },
  editText: {
    fontSize: 16,
    textAlign: 'left',
  },
  phoneBannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Constants.fontFamilyBold,
  },
  phoneBanner: {
    width: 'auto',
    padding: 5,
    position: 'absolute',
    zIndex: 10,
    right: 5,
    top: 40,
    borderRadius: 5,
    backgroundColor: Color.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  ViewsBanner: {
    width: 'auto',
    padding: 5,
    position: 'absolute',
    zIndex: 10,
    right: 5,
    top: 5,
    borderRadius: 5,
    backgroundColor: Color.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
