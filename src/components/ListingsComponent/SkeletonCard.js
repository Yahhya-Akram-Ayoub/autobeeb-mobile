import {useEffect, useRef} from 'react';
import {Animated, Dimensions, StyleSheet, View} from 'react-native';

const SkeletonCard = () => {
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
    width: Dimensions.get('window').width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonBox: {
    height: 290,
    width: '95%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default SkeletonCard;
