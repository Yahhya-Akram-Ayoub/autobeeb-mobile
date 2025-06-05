import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Linking} from 'react-native';
import {Color, ExtractScreenObjFromUrl, Languages} from '../../../common';
import KS from '../../../services/KSAPI';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {screenWidth} from '../../constants/Layout';

const ListingAutobeebBanner = () => {
  const navigation = useNavigation();
  const [banner, setbBanner] = useState();
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const {cca2} = ViewingCountry;
  const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

  useEffect(() => {
    KS.BannersGet({
      isoCode: cca2,
      langID: Languages.langID,
      placementID: 9,
    }).then(data => {
      if (`${data?.Success}` === '1' && data.Banners?.length > 0) {
        const _banner = data.Banners[getRandomInt(data.Banners.length - 1)];
        setbBanner(_banner);
        KS.BannerViewed(_banner.ID);
      }
    });
  }, []);

  if (!banner) return <View />;

  const handlePress = async () => {
    const url = banner.Link;
    if (!url) return;

    KS.BannerClick({bannerID: banner.ID});

    const {screen, params} = await ExtractScreenObjFromUrl(url);

    if (screen) {
      navigation.navigate(screen, params || {});
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity disabled={!banner.Link} onPress={handlePress}>
        <FastImage
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${banner.FullImagePath}.png`,
          }}
          style={styles.banner}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: Color.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 8,
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    width: screenWidth - 14,
    elevation: 7,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
  },
  banner: {
    width: screenWidth * 0.8,
    height: (screenWidth * 0.8) / 1.8,
    alignSelf: 'center',
  },
});

export default ListingAutobeebBanner;
