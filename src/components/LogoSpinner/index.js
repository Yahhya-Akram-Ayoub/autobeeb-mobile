//noinspection JSUnresolvedVariable
import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import {Color} from '../../common';
class LogoSpinner extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {fullStretch, style, logo} = this.props;
    return (
      <View
        style={[
          fullStretch ? styles.container_full_stretch : styles.container,
          style,
        ]}>
        <ActivityIndicator
          color={Color.primary}
          size={Platform.select({
            ios: 'large',
            android: 80,
          })}></ActivityIndicator>
      </View>
    );
    return (
      // old wheel
      <View
        style={[
          fullStretch ? styles.container_full_stretch : styles.container,
          style,
        ]}>
        <Animatable.Image
          source={require('../../images/NewLogo.png')}
          animation="rotate"
          iterationCount={'infinite'}
          useNativeDriver
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: null,
    width: null,
  },
  container_full_stretch: {
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: Dimensions.get('screen').width * 0.4,
    width: Dimensions.get('screen').width * 0.4,
  },
});

LogoSpinner.propTypes = {
  logo: PropTypes.any,
  fullStretch: PropTypes.bool,
};

//noinspection JSUnusedGlobalSymbols
LogoSpinner.defaultProps = {
  fullStretch: false,
};

export default LogoSpinner;
