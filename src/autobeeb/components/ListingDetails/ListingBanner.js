import {useRef, useState} from 'react';
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

const ListingBanner = ({loading, images, isSpecial, imageBasePath}) => {
  const isEmpty = images?.length === 0;
  const hasImages = images?.length > 0;

  if (loading)
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
        <BannersSwiper images={images} imageBasePath={imageBasePath} />
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
