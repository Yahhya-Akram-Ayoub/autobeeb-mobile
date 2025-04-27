import {useEffect, useRef} from 'react';
import {Animated, Dimensions, StyleSheet, View} from 'react-native';

const SkeletonTabFilter = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      -Dimensions.get('window').width,
      Dimensions.get('window').width,
    ],
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
    width: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 5,
  },
  skeletonBox: {
    height: 28,
    width: 75,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default SkeletonTabFilter;
