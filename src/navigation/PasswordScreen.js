/**
 * Created by Kensoftware on 19/02/2017.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  I18nManager,
} from 'react-native';
import {connect} from 'react-redux';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Color, Languages, Styles, Constants} from '../common';
import {ButtonIndex} from '../components';
import Toast from 'react-native-root-toast';
import KS from '../services/KSAPI';
import messaging from '@react-native-firebase/messaging';
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from 'react-native-google-signin';
import PhoneInput from 'react-native-phone-input';
import DeviceInfo from 'react-native-device-info';

import CountryPicker from '../components/CountryModal/CountryPickerModal';

//GoogleSignin.configure ();

class PasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      username:
        (this.props.route.params?.AuthData ?? 0) != 0
          ? this.props.route.params?.AuthData?.Username
          : '',
      password: '',
      isLoading: false,
      logInFB: false,
      userInfo: null,
      logInFB: false,
      loading: false,
      modalVisible: false,
    };

    this.onLoginPressHandle = this.onLoginPressHandle.bind(this);
    this.checkConnection = this.checkConnection.bind(this);
    this.onSignUpHandle = this.onSignUpHandle.bind(this);

    this.onUsernameEditHandle = username => this.setState({username});
    this.onPasswordEditHandle = password => this.setState({password});

    this.focusPassword = () => this.refs.password && this.refs.password.focus();
  }

  resetData = {
    index: 0,
    key: null,
    actions: this.props.navigation.navigate('HomeScreen'),
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  setPushNotification(id) {
    const _this = this;
    FCM = messaging();
    // check to make sure the user is authenticated

    // requests permissions from the user
    FCM.requestPermission();
    // gets the device's push token
    FCM.getToken().then(token => {
      //  alert(token)
      // stores the token in the user's document
      //   //console.log("ya   " + token + "  yazeed");
      //  _this.props.updateUserPushToken({ id: id, token: token });
    });
  }

  _signIn = async callback => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (callback) callback(userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // alert("canceled")
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        //  alert("in progress")
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        //   alert("no services")
        // play services not available or outdated
      } else {
        alert(JSON.stringify(error));
        //alert("error")
        // some other error happened
      }
    }
  };

  onLoginPressHandle() {
    const {login, navigation} = this.props;

    const {username, password, loading} = this.state;
    if (loading) return;
    //this.setState({ isLoading: true });
    _this = this;
    _this.setState({loading: true});
    KS.AutobeebLogin({
      name: username,
      pass: password,
      langid: Languages.langID,
    }).then(function (data) {
      if (data === undefined) {
        showToast("Can't get data from server");
        _this.setState({loading: false});
      } else if (data.result === 0) {
        showToast(Languages.EmailOrPassIncorrect, 1500);
        _this.setState({loading: false});
      } else {
        _this.setState({loading: false});
        login(data);
        _this.setPushNotification(data.uid);

        AsyncStorage.setItem('user', JSON.stringify(data), () => {
          if (_this.props.needLogin) {
            _this.props.navigation.goBack();
          } else {
            this.props.navigation.navigate('HomeScreen');
            // navigation.dispatch(StackActions.reset(resetData));
          }
        });
      }
    });
  }

  onSignUpHandle() {
    this.props.onViewSignUp();
    const {navigate} = this.props.navigation;
    navigate('PasswordScreen');
  }

  checkConnection() {
    const {netInfo} = this.props;
    if (!netInfo.isConnected) {
      showToast('No connection');
      this.setState({loading: false});
    }
    return netInfo.isConnected;
  }

  initUser(token) {
    return fetch(
      'https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' +
        token,
    )
      .then(response => response.json())
      .then(json => {
        var user = {};
        // Some user object has been set up somewhere, build that user here
        user.name = json.name;
        user.id = json.id;
        //user.user_friends = json.friends
        user.email = json.email;
        //user.username = json.name;
        //user.loading = false
        user.loggedIn = true;

        return user;
        //user.avatar = setAvatar(json.id)
      })
      .catch(() => {
        reject('ERROR GETTING DATA FROM FACEBOOK');
      });
  }

  onPressFlag() {
    this.countryPicker.openModal();
  }

  selectCountry(country) {
    this.phone.selectCountry(country.cca2.toLowerCase());
    this.setState({cca2: country.cca2});
  }

  render() {
    const {username, password, isLoading, loading} = this.state;
    const _this = this;

    return (
      <View style={styles.containerTopLevel}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              onPress={() => this.setModalVisible(false)}
              style={{height: 60, justifyContent: 'center'}}>
              <Text
                style={{
                  color: '#fff',
                  backgroundColor: Color.primary,
                  flex: 1,
                  textAlign: 'center',
                  paddingTop: 20,
                  fontSize: 18,
                  fontFamily: 'Cairo-Regular',
                }}>
                الرجوع
              </Text>
            </TouchableOpacity>

            <WebView
              source={{
                uri: 'https://www.autobeeb.com/Dynamic/-32',
              }}
              style={{flex: 1}}
            />
          </View>
        </Modal>

        <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../images/autobeeb.png')}
                style={[styles.logo, styles.container]}
                resizeMode={'contain'}
              />
            </View>
            <View style={styles.subContain}>
              <Text style={{color: '#000'}}>{Languages.Password}</Text>

              <View
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#eee',
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                }}>
                <PhoneInput
                  ref={ref => {
                    this.phone = ref;
                  }}
                  textStyle={{color: '#000'}}
                  autoFocus
                  allowZeroAfterCountryCode={false}
                  value={this.state.username}
                  onChangePhoneNumber={username => {
                    // if (username.match("[a-zA-Z]+")) {
                    //   username.replace("+", "");
                    // }

                    this.setState({username});
                  }}
                  style={{
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                  }}
                  onPressFlag={this.onPressFlag.bind(this)}
                  textProps={{
                    placeholder: Languages.EnterMobileOrEmail,
                    keyboardType: 'default',
                    maxLength: 16,
                  }}
                />
                <CountryPicker
                  filterPlaceholder={Languages.Search}
                  hideAlphabetFilter
                  ref={ref => {
                    this.countryPicker = ref;
                  }}
                  onChange={value => this.selectCountry(value)}
                  translation={Languages.translation}
                  filterable
                  autoFocusFilter={false}
                  closeable
                  transparent
                  cca2={this.state.cca2}>
                  <View />
                </CountryPicker>
              </View>

              <Text style={styles.title}>{Languages.Password}</Text>

              <View
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#eee',
                  paddingHorizontal: 5,
                  //   paddingVertical: 10
                }}>
                <TextInput
                  placeholder={Languages.EnterYourPassword}
                  style={{paddingVertical: 0}}
                  secureTextEntry
                  value={this.state.password}
                  onChangeText={password => {
                    this.setState({password});
                  }}
                />
              </View>
              <ButtonIndex
                text={Languages.SignUp}
                containerStyle={styles.loginButton}
                onPress={() => {
                  let deviceID = DeviceInfo.getUniqueId();
                  let AuthData = this.props.route.params?.AuthData ?? 0;
                  KS.LoginUser({
                    username: this.state.username,
                    langid: Languages.langID,
                    deviceID: deviceID,
                    name: this.state.name,
                    password: this.state.password,
                    isocode: this.props.route.params?.isoCode ?? 0,
                    otpconfirmed: AuthData.OTPConfirmed,
                  }).then(data => {
                    //      console.log(JSON.stringify(data));
                    if (data && data.Success == 1) {
                      this.props.navigation.navigate('ConfirmOtpScreen', {
                        LoginData: data,
                      });
                    } else {
                      alert('something went wrong');
                    }
                  });
                }}
                textStyle={{
                  fontFamily: Constants.fontFamily,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                this.setModalVisible(true);
              }}>
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  textAlign: 'center',
                  fontSize: 17,
                  paddingHorizontal: 30,
                }}>
                {Languages.ByContinuing}
                <Text style={{color: Color.primary}}> {Languages.Terms} </Text>
                {Languages.AndPrivacy}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}
function showToast(text, time = 2000) {
  let toast = Toast.show(text, {
    duration: time,
    backgroundColor: Color.primary,
    position: Toast.positions.BOTTOM,
    shadow: true,
    shadowColor: '#adb1b2',
    animation: true,
    hideOnPress: true,
    delay: 0,
    onShow: () => {
      // calls on toast\`s appear animation start
    },
    onShown: () => {
      // calls on toast\`s appear animation end.
    },
    onHide: () => {
      // calls on toast\`s hide animation start.
    },
    onHidden: () => {
      // calls on toast\`s hide animation end.
    },
  });

  // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
  setTimeout(function () {
    Toast.hide(toast);
  }, time);
}

const styles = StyleSheet.create({
  containerTopLevel: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: Constants.mediumFont,
    paddingVertical: 10,
    color: '#383737',
  },
  container: {
    marginTop: 30,

    // flex: 1,
    //  backgroundColor: Color.background,
  },
  logoWrap: {
    ...Styles.Common.ColumnCenter,
    flexGrow: 1,
  },
  logo: {
    width: Styles.width * 0.8,
    height: (Styles.width * 0.6) / 2,
  },
  subContain: {
    paddingHorizontal: Styles.width * 0.1,
    marginTop: 30,
    justifyContent: 'center',
    alignContent: 'center',
    paddingBottom: 15,
  },
  loginForm: {
    marginTop: 15,
  },
  inputWrap: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    borderColor: Color.blackDivide,
    fontFamily: Constants.fontFamily,
    borderBottomWidth: 1,
    paddingTop: 10,
    marginBottom: 10,
  },
  input: {
    borderColor: '#9B9B9B',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    height: 40,
    marginTop: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 8,
    flex: 1,
  },
  twitterButton: {
    //  marginVertical: 10,
    backgroundColor: '#00ACED',
    borderRadius: 5,
    // height: 25,
    fontFamily: Constants.fontFamily,

    elevation: 1,
  },
  loginButton: {
    //  marginVertical: 10,
    backgroundColor: Color.primary,
    marginTop: 15,
    borderRadius: 5,
    // height: 25,
    fontFamily: Constants.fontFamily,

    elevation: 1,
  },
  separatorWrap: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    flexGrow: 1,
    borderColor: Color.blackTextDisable,
  },
  separatorText: {
    color: Color.blackTextDisable,
    paddingHorizontal: 5,
    fontFamily: Constants.fontFamily,
  },
  fbButton: {
    backgroundColor: Color.facebook,
    alignSelf: 'center',
    borderRadius: 2,
    elevation: 2,
  },
  ggButton: {
    marginVertical: 10,
    //  backgroundColor: "#DD4B39",
    borderRadius: 5,
    elevation: 0,
  },
  signUp: {
    color: Color.blackTextSecondary,
    fontFamily: Constants.fontFamily,
    fontSize: 15,
    // marginTop: 20
  },
  highlight: {
    fontWeight: 'bold',
    color: '#ca227b',
    fontSize: 18,
  },
});

const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: 'transparent',
  placeholderTextColor: Color.blackTextSecondary,
  fontFamily: Constants.fontFamily,
};

PasswordScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = ({netInfo, user}) => ({netInfo, user});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/UserRedux');
  return {
    login: user => actions.login(dispatch, user),
    logout: () => dispatch(actions.logout(dispatch)),
    facebookLogin: (user, callback) =>
      actions.facebookLogin(dispatch, user, callback),
    GoogleSignin: (email, callback) =>
      actions.GoogleSignin(dispatch, email, callback),
    GooglePassword: (email, name, callback) =>
      actions.GooglePassword(dispatch, email, name, callback),

    getFacebookUser: (user, callback) =>
      actions.getFacebookUser(dispatch, user, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordScreen);
