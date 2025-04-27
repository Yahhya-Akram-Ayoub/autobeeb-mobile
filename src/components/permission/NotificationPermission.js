import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  Platform,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Color, Languages} from '../../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

const NotificationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Check permission when app is opened or comes into focus
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    checkNotificationPermission(); // Initial check

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      checkNotificationPermission();
    }
  };

  const checkNotificationPermission = async () => {
    (async () => {
      let lang = await AsyncStorage.getItem('language');
      let country = await AsyncStorage.getItem('cca2');

      if (!!lang && !!country) {
        if (Platform.OS === 'android') {
          const status = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
          setTimeout(() => {
            handlePermissionStatus(status);
          }, 15000);
        }
      } else {
        // setTimeout(() => {
        //   checkNotificationPermission();
        // }, 2000);
      }
    })();
  };

  const handlePermissionStatus = status => {
    if (status === RESULTS.GRANTED) {
      setPermissionStatus('granted');
      setModalVisible(false); // Hide modal if permission is granted
    } else if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
      setPermissionStatus('denied');
      setModalVisible(true); // Show modal if permission is denied
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      handlePermissionStatus(result);
    }
  };

  return (
    <View>
      {(permissionStatus === 'denied' || __DEV__) && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: '#fff',
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
            }}>
            <Pressable
              style={{
                position: 'absolute',
                top: 5,
                left: 30,
                zIndex: 150,
                borderRadius: 20,
                borderBlockColor: '#000',
              }}
              onPress={() => {
                setModalVisible(false);
              }}>
              <IconMC name="close" color={'#000'} size={25} />
            </Pressable>
            <Text
              style={{
                color: '#000',
                fontWeight: '900',
                fontSize: 18,
                marginTop: 100,
                marginBottom: 50,
              }}>
              {Languages.AutoBeebnotification}
            </Text>
            <Image
              source={require('../../images/NewLogo.png')}
              style={{width: 150, height: 150}}
              resizeMode="contain"
            />
            <View
              style={{
                width: 300,
                padding: 20,
                backgroundColor: 'white',
                borderRadius: 10,
              }}>
              <Text
                style={{
                  marginBottom: 20,
                  color: '#000',
                  fontWeight: '600',
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                {Languages.NotificationPermission}
              </Text>
            </View>

            <Pressable
              style={{
                backgroundColor: Color.primary,
                width: '80%',
                paddingVertical: 15,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 'auto',
                marginBottom: 50,
              }}
              onPress={() => {
                setModalVisible(false);
                requestNotificationPermission();
              }}>
              <Text style={{color: '#fff', fontWeight: '900', fontSize: 18}}>
                {Languages.GrantPermission}
              </Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default NotificationPermission;
