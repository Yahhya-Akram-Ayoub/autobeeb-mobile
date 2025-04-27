/**
 * Created by Kensoftware on 28/02/2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import {Styles, Languages} from '../../common';
let unsubscribe = undefined;
class MyNetInfo extends React.Component {
  constructor(props) {
    super(props);

    this.skipFirstToast = true;
  }

  componentDidMount() {
    unsubscribe = NetInfo.addEventListener(state => {
      this._handleConnectionChange(state.isConnected);
    });
  }

  componentWillUnmount() {
    if (unsubscribe()) unsubscribe();
  }

  _handleConnectionChange = isConnected => {
    this.props.updateConnectionStatus(isConnected);
    if (!isConnected) return;

    if (!this.skipFirstToast) {
      //  toast('Regain internet connection');
    } else {
      this.skipFirstToast = false;
    }
  };

  render() {
    const {netInfo} = this.props;

    if (netInfo.isConnected) return <View />;
    return (
      <View style={styles.connectionStatus}>
        <Image
          style={{
            width: Dimensions.get('screen').width * 0.5,
            aspectRatio: 0.85114503816,
            height: Dimensions.get('screen').width,
          }}
          resizeMode="cover"
          source={require('../../images/NoConnection.png')}
        />
        <Text
          style={{
            color: '#f00',
            textAlign: 'center',
            fontSize: 35,
            marginTop: 10,
            fontFamily: 'Cairo-Bold',
          }}>
          {Languages.NoConnection}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  connectionStatus: {
    position: 'absolute',
    height: '100%',
    bottom: 0,
    width: Styles.width,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

MyNetInfo.propTypes = {
  netInfo: PropTypes.object.isRequired,
  updateConnectionStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    netInfo: state.netInfo,
  };
};

const mapDispatchToProps = dispatch => {
  const {actions} = require('./../../redux/NetInfoRedux');

  return {
    updateConnectionStatus: isConnected =>
      dispatch(actions.updateConnectionStatus(isConnected)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyNetInfo);
