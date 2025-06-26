import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import {Languages} from '../common';
import Geolocation from '@react-native-community/geolocation';
import {check, request, PERMISSIONS} from 'react-native-permissions';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import AppIcon from 'react-native-vector-icons/FontAwesome';

export class LocationSelect extends Component {
  constructor(props) {
    super(props);
    this.changeSubscription = null;
    this.state = {
      marginBottom: 20,
      isLoading: true,
      mapRegion: this.props.initialRegion || {
        latitude: 33.3141,
        longitude: 44.367,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
    };
  }

  componentDidMount() {
    this.checkPermission();
    this.changeSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
    setTimeout(() => {
      this.setState({isLoading: false});
    }, 5000);
  }
  componentWillUnmount() {
    this.changeSubscription?.remove();
  }

  checkPermission = () => {
    if (Platform.OS == 'android') {
      check('android.permission.ACCESS_FINE_LOCATION').then(response => {
        if (response != 'granted') {
          request('android.permission.ACCESS_FINE_LOCATION')
            .then(value => {
              if (value == 'granted') {
                this.watchPosition();
              }
            })
            .catch(error => {});
        } else if (response == 'granted') {
          this.watchPosition();
        }
      });
    } else {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(response => {
        if (response != 'granted') {
          request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
            .then(value => {
              if (value == 'granted') {
                this.watchPosition();
              }
            })
            .catch(error => {});
        } else if (response == 'granted') {
          this.watchPosition();
        }
      });
    }
  };

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState?.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground, recheck GPS status
      this.watchPosition();
    }
    this.setState({appState: nextAppState});
  };

  _watchPosition = () => {
    Geolocation.getCurrentPosition(
      position => {
     
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        };
        this.setState({markerPosition: region, mapRegion: region});
      },
      error => {
        if (error.code === 2) {
          // Error code 2 means GPS is disabled on Android
          Alert.alert(Languages.EnableGPS, Languages.GPSisDisabled, [
            {
              text: Languages.OpenSettings,
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.sendIntent(
                    'android.settings.LOCATION_SOURCE_SETTINGS',
                  );
                } else {
                  Linking.openURL('app-settings:');
                }
              },
            },
            {text: Languages.Cancel, style: 'cancel'},
          ]);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  watchPosition = () => {
    if (Platform.OS === 'android') {
      // Prompt user to enable GPS
      promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      }).finally(() => {
        this._watchPosition();
      });
    } else {
      this._watchPosition();
    }
  };

  render() {
    return (
      <View style={styles.MapContainer}>
        {false && (
          <TouchableOpacity
            onPress={() => {
              this.props.onClose();
            }}
            style={{
              position: 'absolute',
              left: I18nManager.isRTL ? 0 : 20,
              right: I18nManager.isRTL ? 20 : 0,

              zIndex: 100,
              top: 50,
            }}>
            <AppIcon name={'close'} color={'#000'} size={30} />
          </TouchableOpacity>
        )}
        <MapView
          ref={instance => (this.map = instance)}
          region={this.state.mapRegion}
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={[styles.map, {marginBottom: this.state.marginBottom}]}
          onMapReady={() => {
            this.setState({marginBottom: 0});
            if (Platform.OS == 'android') {
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              ).then(response => {
                if (response != 'granted') {
                  alert(Languages.EnableLocation);
                } else {
                  setTimeout(() => {
                    if (this.map && this.state.markerPosition) {
                      this.map.animateToRegion(
                        {
                          latitude: this.state.markerPosition?.latitude,
                          longitude: this.state.markerPosition?.longitude,
                          longitudeDelta: 0.009,
                          latitudeDelta: 0.009,
                        },
                        2000,
                      );
                      setTimeout(() => {
                        this.setState({isLoading: false});
                      }, 4000);
                    }
                  }, 500);
                }
              });
            }
          }}
          onPress={region => {
            this.setState({
              mapRegion: {
                latitude: region.nativeEvent.coordinate?.latitude,
                longitude: region.nativeEvent.coordinate?.longitude,
                longitudeDelta: 0.009,
                latitudeDelta: 0.009,
              },
            });
          }}
          loadingEnabled
          showsUserLocation
          initialRegion={this.props.initialRegion}>
          {this.state.mapRegion && <Marker coordinate={this.state.mapRegion} />}
        </MapView>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            position: 'absolute',
            width: '100%',
            bottom: 20,
            zIndex: 20,
          }}>
          {!this.state.isLoading && (
            <TouchableOpacity
              style={{
                paddingHorizontal: 30,
                paddingVertical: 15,
                backgroundColor: 'green',
                borderRadius: 10,
              }}
              onPress={() => {
                //console.log(this.state.mapRegion, this.state.markerPosition);
                this.props.onLocationConfirm(this.state.mapRegion);
                this.props.onClose();
              }}>
              <Text style={{fontSize: 18, color: '#fff'}}>
                {Languages.Confirm}
              </Text>
            </TouchableOpacity>
          )}

          {!this.state.isLoading && (
            <TouchableOpacity
              style={{
                paddingHorizontal: 30,
                paddingVertical: 15,
                backgroundColor: 'crimson',
                borderRadius: 10,
                zIndex: 20,
              }}
              onPress={() => {
                //console.log(this.state.mapRegion, this.state.markerPosition);
                this.props.onClose();
              }}>
              <Text style={{fontSize: 18, color: '#fff'}}>
                {Languages.Cancel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MapContainer: {
    // ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    flex: 1,
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  map: {
    flex: 1,
    //  ...StyleSheet.absoluteFillObject,
  },
});
export default LocationSelect;
