import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  FlatList,
  View,
  TouchableOpacity,
  I18nManager,
  StyleSheet,
} from 'react-native';
import {AppIcon, Icons} from './AppIcon';

const HorizontalSwiper = ({
  data = [],
  autoLoop = false,
  intervalValue = 4000,
  renderItem,
  showButtons = false,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [onScrollDisabled, setOnScrollDisabled] = useState(false);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  const scrollToIndex = index => {
    sliderRef.current?.scrollToIndex({animated: true, index});
  };

  const clearExistingInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetInterval = useCallback(() => {
    clearExistingInterval();
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex === data.length - 1 ? 0 : prevIndex + 1;
        scrollToIndex(nextIndex);
        setOnScrollDisabled(true);
        setTimeout(() => setOnScrollDisabled(false), 1000);
        return nextIndex;
      });
    }, intervalValue);
  }, [data.length, intervalValue]);

  useEffect(() => {
    if (autoLoop && data.length > 1) {
      resetInterval();
      return clearExistingInterval;
    }
  }, [autoLoop, data.length, resetInterval]);

  const onPressRight = () => {
    if (currentIndex < data.length - 1) {
      resetInterval();
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
      setOnScrollDisabled(true);
      setTimeout(() => setOnScrollDisabled(false), 500);
    }
  };

  const onPressLeft = () => {
    if (currentIndex > 0) {
      resetInterval();
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
      setOnScrollDisabled(true);
      setTimeout(() => setOnScrollDisabled(false), 500);
    }
  };

  return (
    <View>
      {showButtons && currentIndex > 0 && (
        <TouchableOpacity style={styles.leftButton} onPress={onPressLeft}>
          <View style={styles.chevronButton}>
            <AppIcon
              type={Icons.Entypo}
              name={
                I18nManager.isRTL ? 'chevron-thin-right' : 'chevron-thin-left'
              }
              color="#fff"
              size={20}
            />
          </View>
        </TouchableOpacity>
      )}

      {showButtons && currentIndex < data.length - 1 && (
        <TouchableOpacity style={styles.rightButton} onPress={onPressRight}>
          <View style={styles.chevronButton}>
            <AppIcon
              type={Icons.Entypo}
              name={
                I18nManager.isRTL ? 'chevron-thin-left' : 'chevron-thin-right'
              }
              color="#fff"
              size={20}
            />
          </View>
        </TouchableOpacity>
      )}

      <FlatList
        ref={sliderRef}
        horizontal
        pagingEnabled
        data={data}
        keyExtractor={(_, index) => index.toString()}
        style={[{flexGrow: 0, paddingBottom: 10}, style]}
        contentContainerStyle={{flexGrow: 0}}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        // If scroll update behavior is needed, re-enable this logic
        // onScroll={(e) => {
        //   resetInterval();
        //   if (!onScrollDisabled) {
        //     const index = Math.round(
        //       e.nativeEvent.contentOffset.x / Layout.screenWidth
        //     );
        //     setCurrentIndex(index);
        //   }
        // }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  leftButton: {
    position: 'absolute',
    top: '40%',
    left: 40,
    zIndex: 15,
    justifyContent: 'center',
  },
  rightButton: {
    position: 'absolute',
    top: '40%',
    right: 40,
    zIndex: 15,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  chevronButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HorizontalSwiper;
