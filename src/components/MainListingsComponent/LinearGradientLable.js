import React, {useMemo} from 'react';
import {I18nManager, Platform, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LinearGradientLable = React.memo(
  ({Lable, LinearColors}) => {
    const containerStyle = useMemo(() => {
      return [
        {
          padding: 3,
          paddingVertical: 0,
          zIndex: 10,
          minWidth: 45,
        },
        I18nManager.isRTL ? {left: 0} : {right: 0},
        Platform.select({
          ios: {
            borderBottomLeftRadius: I18nManager.isRTL ? 5 : 0,
            borderBottomRightRadius: I18nManager.isRTL ? 0 : 5,
          },
          android: {
            borderBottomLeftRadius: I18nManager.isRTL ? 5 : 0,
            borderBottomRightRadius: I18nManager.isRTL ? 0 : 5,
          },
        }),
      ];
    }, [I18nManager.isRTL]);

    return (
      <LinearGradient
        colors={LinearColors}
        start={{x: 0.6, y: 0}}
        style={containerStyle}>
        <Text
          numberOfLines={1}
          style={{
            color: '#fff',
          }}>
          {Lable}
        </Text>
      </LinearGradient>
    );
  },
  (prevProps, nextProps) =>
    prevProps.Lable === nextProps.Lable &&
    JSON.stringify(prevProps.LinearColors) ===
      JSON.stringify(nextProps.LinearColors)
);

export {LinearGradientLable};
