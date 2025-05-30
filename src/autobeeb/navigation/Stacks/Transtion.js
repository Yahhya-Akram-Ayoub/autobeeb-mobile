import {CardStyleInterpolators} from '@react-navigation/stack';

export const fadeFromCenter = ({current, next, closing}) => {
  return {
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          scale: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.92, 1], // Slight scale effect for smoothness
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
      }),
    },
  };
};

export const transitionSpec = {
  open: {
    animation: 'timing',
    config: {
      duration: 300,
      useNativeDriver: true,
    },
  },
  close: {
    animation: 'timing',
    config: {
      duration: 250,
      useNativeDriver: true,
    },
  },
};

export const TranstionSettings = {
  animationEnabled: true,
  animation: 'fade',
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
  transitionSpec: transitionSpec,
  gestureEnabled: false,
};
