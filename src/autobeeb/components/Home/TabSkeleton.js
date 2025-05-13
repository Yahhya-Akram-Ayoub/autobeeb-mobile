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
    <View style={styles.tabWrapper}>
      <View style={styles.tabSkeleton}>
        <Animated.View style={[styles.shimmer, {transform: [{translateX}]}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabWrapper: {
    margin: 2,
    width: Layout.screenWidth * 0.31,
    height: Layout.screenWidth * 0.29,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSkeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default TabSkeleton;
