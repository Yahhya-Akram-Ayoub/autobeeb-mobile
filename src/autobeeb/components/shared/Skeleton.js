import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { screenWidth } from '../../constants/Layout';

const SkeletonLoader = ({
  containerStyle,
  shimmerColors = ['#E0E0E0', '#F5F5F5', '#E0E0E0'],
  animationDuration = 1500,
  borderRadius = 8,
  children,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      shimmerAnimation.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
      ).start();
    };

    startAnimation();
  }, [shimmerAnimation, animationDuration]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return (
    <View style={[containerStyle, {overflow: 'hidden', borderRadius}]}>
      <View style={[StyleSheet.absoluteFillObject, styles.shimmerContainer]}>
        <Animated.View
          style={[
            styles.shimmerGradient,
            {
              transform: [{translateX}],
            },
          ]}>
          <LinearGradient
            colors={shimmerColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
      {children}
    </View>
  );
};

// Alternative simple skeleton without gradient (if LinearGradient is not available)
const SimpleSkeletonLoader = ({
  containerStyle,
  backgroundColor = '#E0E0E0',
  animationDuration = 1000,
  borderRadius = 8,
  children,
}) => {
  const opacityAnimation = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 0.3,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startAnimation();
  }, [opacityAnimation, animationDuration]);

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          backgroundColor,
          opacity: opacityAnimation,
          borderRadius,
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: '#E0E0E0',
  },
  shimmerGradient: {
    width: 350,
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

export {SkeletonLoader, SimpleSkeletonLoader};

// Usage Examples:

/*
// Example 1: Your ListingBanner with Skeleton
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SkeletonLoader, SimpleSkeletonLoader} from './SkeletonLoader';
import {screenWidth} from '../../constants/Layout';

const ListingBannerWithSkeleton = ({loading, images, isSpecial, imageBasePath}) => {
  const isEmpty = images?.length === 0;
  const hasImages = images?.length > 0;

  // Container style that matches your original component
  const containerStyle = {
    height: screenWidth / 1.2,
    width: screenWidth,
  };

  if (loading) {
    return (
      <SkeletonLoader
        containerStyle={[containerStyle, styles.centeredContent]}
        borderRadius={12}
        shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
        animationDuration={1200}
      />
    );
  }

  return (
    <View style={[containerStyle, isEmpty && styles.centeredContent]}>
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
*/

// Example 2: Card Skeleton
const CardSkeleton = () => {
  const cardStyle = {
    width: '100%',
    height: 200,
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  };

  return (
    <SkeletonLoader
      containerStyle={cardStyle}
      borderRadius={8}
      shimmerColors={['#F0F0F0', '#FFFFFF', '#F0F0F0']}
    >
      {/* Optional: Add inner skeleton elements */}
      <View style={{padding: 16}}>
        <SimpleSkeletonLoader
          containerStyle={{width: '60%', height: 16, marginBottom: 8}}
          borderRadius={4}
        />
        <SimpleSkeletonLoader
          containerStyle={{width: '40%', height: 12, marginBottom: 16}}
          borderRadius={4}
        />
        <SimpleSkeletonLoader
          containerStyle={{width: '100%', height: 80}}
          borderRadius={6}
        />
      </View>
    </SkeletonLoader>
  );
};

// Example 3: List Item Skeleton
const ListItemSkeleton = () => {
  const itemStyle = {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 1,
    height: 80,
  };

  return (
    <View style={itemStyle}>
      {/* Avatar skeleton */}
      <SkeletonLoader
        containerStyle={{width: 48, height: 48, marginRight: 12}}
        borderRadius={24}
      />
      
      {/* Content skeleton */}
      <View style={{flex: 1, justifyContent: 'center'}}>
        <SimpleSkeletonLoader
          containerStyle={{width: '70%', height: 16, marginBottom: 8}}
          borderRadius={4}
        />
        <SimpleSkeletonLoader
          containerStyle={{width: '50%', height: 12}}
          borderRadius={4}
        />
      </View>
    </View>
  );
};

// Example 4: Grid Item Skeleton
const GridItemSkeleton = ({itemWidth, itemHeight}) => {
  const gridItemStyle = {
    width: itemWidth || 150,
    height: itemHeight || 200,
    margin: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  };

  return (
    <SkeletonLoader
      containerStyle={gridItemStyle}
      borderRadius={8}
    />
  );
};

// Example 5: Complete Page Skeleton with multiple elements
const PageSkeleton = () => {
  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5', padding: 16}}>
      {/* Header skeleton */}
      <SkeletonLoader
        containerStyle={{width: '100%', height: 60, marginBottom: 20}}
        borderRadius={8}
      />
      
      {/* Banner skeleton - using your exact container style */}
      <SkeletonLoader
        containerStyle={{
          height: screenWidth / 1.2,
          width: screenWidth - 32, // Account for padding
          marginBottom: 20,
        }}
        borderRadius={12}
      />
      
      {/* List items skeleton */}
      {Array.from({length: 5}).map((_, index) => (
        <ListItemSkeleton key={index} />
      ))}
    </View>
  );
};
