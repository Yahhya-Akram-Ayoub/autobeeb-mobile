import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import Layout from '../../constants/Layout';

const TabSkeleton = () => {
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
        <Animated.View
          style={[styles.shimmer, {transform: [{translateX}]}]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.screenWidth * 0.01,
  },
  skeletonBox: {
    width: Layout.screenWidth * 0.31, // 31% of the screen width for the tab size
    height: Layout.screenWidth * 0.29, // Adjusting height for tab item
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default TabSkeleton;
