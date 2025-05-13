import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import Layout from '../../constants/Layout';

const BlogsRowSkeleton = () => {
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
      <View style={styles.headerRow}>
        <Animated.View style={[styles.shimmer, {transform: [{translateX}]}]} />
      </View>

      <View style={styles.blogCard}>
        <Animated.View style={[styles.shimmer, {transform: [{translateX}]}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EBEBEB',
    paddingBottom: 10,
    marginTop: 10,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerRow: {
    marginTop: 10,
    alignSelf: 'center',
    width: Layout.screenWidth * 0.95,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  titleBox: {
    height: 20,
    width: Layout.screenWidth * 0.95,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  blogCard: {
    marginTop: 10,
    alignSelf: 'center',
    width: Layout.screenWidth * 0.95,
    height: (Layout.screenWidth * 0.95) / 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default BlogsRowSkeleton;
