import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Modal,
  View,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import MyToast from '../../containers/MyToast';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AutobeebModal = forwardRef((props, ref) => {
  const {
    children,
    style,
    backdropOpacity = 0.7,
    onOpened,
    onClosed,
    fullScreen,
    keyboardResponsive = false,
    backButtonClose = true,
    onRequestClose = null,
    entry = 'bottom', // new
    animationDuration = 300, // new
    exitDuration = 150, // new
    moveType,
  } = props;

  const [visible, setVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start(() => {
        if (onOpened) onOpened();
      });
    },
    close: () => {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: exitDuration,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        if (onClosed) onClosed();
      });
    },
    isOpen: () => {
      return visible;
    },
  }));

  const getAnimatedStyle = () => {
    if (!moveType) {
      return {};
    }
    if (moveType === 'fade') {
      return {
        opacity: animatedValue,
      };
    }

    if (moveType === 'scale') {
      return {
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
        opacity: animatedValue,
      };
    }

    // Default is 'slide'
    switch (entry) {
      case 'top':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-SCREEN_HEIGHT, 0],
              }),
            },
          ],
        };
      case 'center':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        };
      case 'bottom':
      default:
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [SCREEN_HEIGHT, 0],
              }),
            },
          ],
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        if (onRequestClose) {
          onRequestClose();
        } else {
          if (ref?.current) ref?.current?.close();
          else {
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }).start(() => {
              setVisible(false);
              if (onClosed) onClosed();
            });
          }
        }
      }}
      backButtonClose={backButtonClose}
      entry={entry}
      backdropPressToClose
      swipeToClose={false}>
      {
        <TouchableWithoutFeedback onPress={() => ref?.current?.close()}>
          <View style={[styles.backdrop, {opacity: backdropOpacity}]} />
        </TouchableWithoutFeedback>
      }

      <Animated.View
        style={[
          !keyboardResponsive && styles.modalContainer,
          !!keyboardResponsive && styles.modalContainerStiky,
          style,
          fullScreen && {maxHeight: SCREEN_HEIGHT},
          getAnimatedStyle(),
        ]}>
        {children}
      </Animated.View>
      {visible && <MyToast />}
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
    minHeight: SCREEN_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  modalContainerStiky: {
    maxHeight: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
});

export default AutobeebModal;
