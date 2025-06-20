import {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  I18nManager,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {screenWidth} from '../../constants/Layout';
import SpecialOfferBadge from './SpecialOfferBadge';
import BannersSwiper from './BannersSwiper';
import {SkeletonLoader} from '../shared/Skeleton';
import KS from '../../../services/KSAPI';
import {useSelector} from 'react-redux';

let refreshFlag = 0;
const ListingBanner = ({
  listingId,
  loading,
  images,
  isSpecial,
  imageBasePath,
  isNeedRefresh,
}) => {
  const isEmpty = images?.length === 0;
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const [loadingRefersh, setLoadingRefersh] = useState(false);
  const [photos, setPhotos] = useState(images ?? []);
  const [hasImages, setHasImages] = useState(images?.length > 0);

  useEffect(() => {
    if ((!photos || !photos.length) && images?.length) {
      setHasImages(images?.length > 0);
      setPhotos(images);
    }
  }, [images]);

  useEffect(() => {
    if (isNeedRefresh)
      setInterval(() => {
        if (refreshFlag < 4) {
          refreshImages();
          refreshFlag++;
        }
      }, 5000);
  }, []);

  const refreshImages = () => {
    KS.GetListingCore({
      id: listingId,
      userId: user?.ID,
      currencyId: 1,
      langId: 1,
      increaseViews: false,
    })
      .then(res => {
        setLoadingRefersh(true);
        setPhotos(res.images);
        setHasImages(res?.images?.length > 0);
      })
      .finally(() => {
        setTimeout(() => {
          setLoadingRefersh(false);
        }, 500);
      });
  };

  if (loading || loadingRefersh)
    return (
      <SkeletonLoader
        containerStyle={[styles.container, styles.centeredContent]}
        borderRadius={12}
        shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
        animationDuration={1200}
      />
    );

  return (
    <View style={[styles.container, isEmpty && styles.centeredContent]}>
      {isSpecial && <SpecialOfferBadge />}

      {hasImages ? (
        <BannersSwiper images={photos} imageBasePath={imageBasePath} />
      ) : (
        <FastImage
          style={styles.placeholderImage}
          resizeMode="contain"
          source={require('../../../images/placeholder.png')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenWidth / 1.2,
    width: screenWidth,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    height: screenWidth / 1.2,
    width: screenWidth * 0.7,
    alignSelf: 'center',
  },
});

export default ListingBanner;
