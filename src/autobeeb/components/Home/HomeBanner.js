import {Linking, StyleSheet, TouchableOpacity} from 'react-native';
import Layout from '../../constants/Layout';
import Swiper from 'react-native-swiper';
import {useSelector} from 'react-redux';
import {View} from 'react-native-animatable';
import {ExtractScreenObjFromUrl} from '../../../common';
import FastImage from 'react-native-fast-image';
import KS from '../../../services/KSAPI';
import BannerSkeleton from './BannerSkeleton';

const BannersDisplayed = [];
const HomeBanner = () => {
  const {
    homePageData: {NewBanners},
    isFetching,
  } = useSelector(state => state.home);

  const handleIndexChanged = async index => {
    if (!BannersDisplayed.includes(index)) {
      BannersDisplayed.push(index);
      const _banner = NewBanners[index];
      KS.BannerViewed(_banner.ID);
    }
  };

  const onPressBanner = async banner => {
    let url = banner.Link;
    if (!url) return;

    KS.BannerClick({
      bannerID: banner.ID,
    });

    const {screen, params} = await ExtractScreenObjFromUrl(url);
    if (!!screen) {
      this.props.navigation.navigate(screen, !!params && params);
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <Swiper
      showsPagination={false}
      height={Layout.screenWidth / 2.5}
      width={Layout.screenWidth}
      autoplay={true}
      onIndexChanged={handleIndexChanged}
      autoplayTimeout={5}
      loop>
      {isFetching ? (
        <BannerSkeleton key={10000} />
      ) : (
        NewBanners.map((banner, index) => {
          handleIndexChanged(0);
          if (banner)
            return (
              <TouchableOpacity
                style={{flex: 1}}
                disabled={!banner.Link}
                onPress={() => {
                  onPressBanner(banner);
                }}
                key={index}>
                <FastImage
                  style={styles.BannerImage}
                  resizeMode={FastImage.resizeMode.stretch}
                  source={{
                    uri: `https://autobeeb.com/${banner.FullImagePath}_1000x400.jpg`,
                  }}
                />
              </TouchableOpacity>
            );
        })
      )}
    </Swiper>
  );
};

export default HomeBanner;

const styles = StyleSheet.create({
  BannerImage: {
    width: Layout.screenWidth,
    height: Layout.screenWidth / 2.5,
  },
});
