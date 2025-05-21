import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {useDispatch, useSelector} from 'react-redux';
import {Styles, Languages} from '../../common';
import {actions as NetInfoActions} from '../../redux/NetInfoRedux';

const MyNetInfo = () => {
  const dispatch = useDispatch();
  const netInfo = useSelector(state => state.netInfo);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectionChange(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectionChange = isConnected => {
    dispatch(NetInfoActions.updateConnectionStatus(isConnected));
    if (!isConnected) return;
  };

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
};

const styles = StyleSheet.create({
  connectionStatus: {
    position: 'absolute',
    height: '100%',
    bottom: 0,
    width: Styles.width,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  connectionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MyNetInfo;
