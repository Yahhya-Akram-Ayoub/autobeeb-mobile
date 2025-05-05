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
  Platform,
  BackHandler,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AutobeebModal = forwardRef((props, ref) => {
  const {
    children,
    style,
    backdropOpacity = 0.7,
    onOpened,
    onClosed,
    backButtonClose = true,
    swipeToClose = false, // Not implemented in this version
    entry = 'bottom',
    fullScreen,
  } = props;

  const [visible, setVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onOpened) onOpened();
      });
    },
    close: () => {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        if (onClosed) onClosed();
      });
    },
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        if (!!ref?.current) ref?.current?.close();
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
      }}
      backButtonClose={true}
      entry="bottom"
      backdropPressToClose
      swipeToClose={false}>
      {
        <TouchableWithoutFeedback onPress={() => ref?.current?.close()}>
          <View style={[styles.backdrop, {opacity: backdropOpacity}]} />
        </TouchableWithoutFeedback>
      }

      <Animated.View
        style={[
          styles.modalContainer,
          style,
          fullScreen && {maxHeight: SCREEN_HEIGHT},
        ]}>
        {children}
      </Animated.View>
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
});

export default AutobeebModal;
