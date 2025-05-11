import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import Layout from '../../constants/Layout';

const BannerSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-Layout.screenWidth, Layout.screenWidth],
  });

  return (
    <View style={styles.container}>
      <View style={styles.skeletonBox}>
        <Animated.View style={[styles.shimmer, {transform: [{translateX}]}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Layout.screenWidth,
    height: Layout.screenWidth / 2.5,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  skeletonBox: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default BannerSkeleton;
