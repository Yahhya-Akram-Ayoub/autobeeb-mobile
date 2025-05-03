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
  I18nManager,
  Platform,
  Keyboard,ActivityIndicator
} from 'react-native';
import {connect} from 'react-redux';

import {Color, Languages, Styles, Constants} from '../common';
import {ButtonIndex, OTPModal} from '../components';
import Toast from 'react-native-root-toast';
import KS from '../services/KSAPI';
import messaging from '@react-native-firebase/messaging';
import PhoneInput from 'react-native-phone-input';
import {toast} from '../Omni';
import CountryPicker from 'react-native-country-picker-modal';
import IconEn from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

//GoogleSignin.configure ();

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cca2: '',
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
      isEmailBasedCountry:
        this.props.route.params?.isEmailBasedCountry ?? false,
      hidePhone: this.props.route.params?.isEmailBasedCountry ?? false,
    };

    this.onLoginPressHandle = this.onLoginPressHandle.bind(this);
    this.checkConnection = this.checkConnection.bind(this);
    this.onSignUpHandle = this.onSignUpHandle.bind(this);

    this.onUsernameEditHandle = username => this.setState({username});
    this.onPasswordEditHandle = password => this.setState({password});

    this.focusPassword = () => this.refs.password && this.refs.password.focus();
  }

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
  componentDidMount() {
    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        this.setState({cca2: data});
      }
    });
    if (this.props.route.params?.isEmailBasedCountry) {
      this.setState({emailShown: true, hidePhone: true});
    }
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
          }
        });
      }
    });
  }

  onSignUpHandle() {
    this.props.onViewSignUp();
    const {navigate} = this.props.navigation;
    navigate('ForgotPassword');
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

  validateEmail(email) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  resendCode() {
    KS.ForgotPasswordInit({
      langid: Languages.langID,
      username: this.state.emailShown
        ? this.state.email
        : this.phone && this.phone.getValue(),
    }).then(data => {
      if (data && data.Success == 1) {
        if (data.Status == 1) {
          //     alert(JSON.stringify(data));

          this.refs.OTPModal.open();
        } else {
          toast(Languages.PleaseCheckYourInput);
        }
      }
    });
  }

  checkOTP() {
    const _this = this;
    const otp = this.state.otp;

    KS.ConfirmResetCode({
      resetCode: otp,
      username: _this.state.emailShown
        ? _this.state.email
        : _this.phone.getValue(),
      langid: Languages.langID,
    }).then(data => {
      //  console.log(JSON.stringify(data));
      if (data.Status == 1) {
        //   console.log("yaz2");

        //      console.log(JSON.stringify(data));

        this.setState({Username: data.Username});
        this.refs.OTPModal.close();
        this.props.navigation.navigate('ChangePasswordScreen', {
          user: data.User,
          Username: data.Username,
        });
      } else {
        toast(Languages.WrongOTP);

        setTimeout(() => {
          this.setState({otp: ''});
        }, 1800);
      }
    });
  }

  render() {
    const {username, password, isLoading, loading} = this.state;
    const _this = this;
    let AuthData = this.props.route.params?.AuthData ?? {};
    return (
      <View style={styles.containerTopLevel}>
        <OTPModal
          ref="OTPModal"
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.forgotpassOTPMessage}
          Username={
            this.state.emailShown
              ? this.state.email
              : this.phone && this.phone.getValue()
          }
          otp={this.state.otp}
          onChange={otp => {
            this.setState({otp});
          }}
          checkOTP={() => {
            this.checkOTP();
          }}
          toast={msg => {
            toast(msg);
          }}
          resendCode={() => {
            this.resendCode();
          }}
        />
        <ScrollView
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always">
          <TouchableOpacity
            style={{
              position: 'absolute',
              zIndex: 10,
              left: 10,
              top: Platform.select({ios: 40, android: 10}),
            }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <IconEn
              name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
              size={25}
              color={Color.primary}
            />
          </TouchableOpacity>

          <View
            style={[
              {flex: 1, justifyContent: 'center'},
              Platform.OS == 'ios' && {marginTop: 40},
            ]}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../images/autobeeb.png')}
                style={[styles.logo, styles.container]}
                resizeMode={'contain'}
              />
            </View>
            <View style={styles.subContain}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  justifyContent: 'center',
                }}>
                <Text style={[styles.fontStyle, {color: '#000'}]}>
                  {Languages.EnterYour + ' '}
                </Text>
                {!this.state.hidePhone && (
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      this.setState({emailShown: false});
                    }}>
                    <Text
                      style={[
                        styles.fontStyle,
                        !this.state.emailShown
                          ? {
                              color: Color.primary,
                              textDecorationLine: 'underline',
                            }
                          : {
                              color: Color.secondary,
                            },
                      ]}>
                      {Languages.Phone}
                    </Text>
                  </TouchableOpacity>
                )}

                {!this.state.hidePhone && (
                  <Text style={styles.fontStyle}>
                    {' ' + Languages.Or + ' '}
                  </Text>
                )}
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.setState({emailShown: true});
                  }}>
                  <Text
                    style={[
                      styles.fontStyle,
                      this.state.emailShown
                        ? {
                            color: Color.primary,
                            textDecorationLine: 'underline',
                          }
                        : {
                            color: Color.secondary,
                          },
                    ]}>
                    {Languages.Email}
                  </Text>
                </TouchableOpacity>
              </View>

              {!this.state.emailShown && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor:
                      this.phone && this.phone.isValidNumber()
                        ? 'green'
                        : '#eee',

                    backgroundColor:
                      this.phone && this.phone.isValidNumber()
                        ? 'rgba(0,255,0,0.2)'
                        : '#fff',

                    paddingHorizontal: 5,
                    borderRadius: 5,
                  }}>
                  {this.state.cca2 && (
                    <PhoneInput
                      ref={ref => {
                        this.phone = ref;
                      }}
                      autoFocus
                      style={{
                        height: 50,
                        flexDirection: I18nManager.isRTL
                          ? 'row-reverse'
                          : 'row',
                      }}
                      allowZeroAfterCountryCode={false}
                      value={this.state.username}
                      onChangePhoneNumber={username => {
                        if (
                          this.state.cca2 &&
                          this.phone.getISOCode() !=
                            this.state.cca2.toLowerCase()
                        ) {
                          this.phone.selectCountry(
                            this.state.cca2.toLowerCase(),
                          );
                          if (Platform.OS == 'ios') {
                            Keyboard.dismiss();
                            setTimeout(() => {
                              this.phone.focus();
                            }, 200);
                          }
                        } else {
                          this.setState({username});
                        }
                      }}
                      initialCountry={this.state.cca2.toLowerCase()}
                      onPressFlag={this.onPressFlag.bind(this)}
                      textProps={{
                        placeholder: Languages.EnterMobileOrEmail,
                        //    keyboardType: "default"
                      }}
                      flagStyle={{
                        resizeMode: 'contain',
                        borderRadius: 25,
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                      }}
                      textStyle={{
                        color: '#000',
                        height: 50,
                      }}
                    />
                  )}

                  <CountryPicker
                    filterPlaceholder={Languages.Search}
                    hideAlphabetFilter
                    ref={ref => {
                      this.countryPicker = ref;
                    }}
                    onChange={value => this.selectCountry(value)}
                    translation={Languages.translation}
                    filterable
                    textProps={{maxLength: 16}}
                    autoFocusFilter={false}
                    closeable
                    transparent
                    cca2={this.state.cca2}>
                    <View />
                  </CountryPicker>
                </View>
              )}

              {this.state.emailShown && (
                <TextInput
                  ref="email"
                  style={{
                    height: 40,

                    borderRadius: 5,

                    backgroundColor: this.validateEmail(this.state.email)
                      ? 'rgba(0,255,0,0.2)'
                      : '#fff',
                    borderColor: this.validateEmail(this.state.email)
                      ? 'green'
                      : '#eee',
                    borderWidth: 1,
                  }}
                  placeholder={Languages.EnterYourEmail}
                  onChangeText={text => {
                    this.setState({email: text.trim()});
                  }}
                  value={this.state.email}
                />
              )}

              <ButtonIndex
                text={
                  this.state.loading ? (
                    <ActivityIndicator
                      style={{marginVertical: 4}}
                      size="small"
                      color="#fff"
                    />
                  ) : (
                    Languages.Confirm
                  )
                }
                lo
                // disabled={this.state.ButtonDisabled}
                containerStyle={[
                  styles.loginButton,

                  this.phone &&
                    this.phone.isValidNumber() && {
                      backgroundColor: 'green',
                    },
                  this.refs.email &&
                    this.validateEmail(this.state.email) && {
                      backgroundColor: 'green',
                    },
                ]}
                onPress={() => {
                  this.setState({loading: true});
                  KS.ForgotPasswordInit({
                    langid: Languages.langID,
                    username: this.state.emailShown
                      ? this.state.email
                      : this.phone && this.phone.getValue(),
                  })
                    .then(data => {
                      if (data && data.Success == 1) {
                        if (data.Status == 1) {
                          this.refs.OTPModal.open();
                        } else {
                          toast(Languages.PleaseCheckYourInput);
                        }
                      }
                    })
                    .finally(() => {
                      this.setState({loading: false});
                    });
                }}
                textStyle={{
                  fontFamily: Constants.fontFamily,
                }}
              />
            </View>
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
  fontStyle: {
    fontSize: 18,
  },
  containerTopLevel: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: Constants.mediumFont,
    paddingVertical: 10,
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
    flex: 1,
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

ForgotPassword.propTypes = {
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
    storeUserData: (user, callback) =>
      actions.storeUserData(dispatch, user, callback),

    facebookLogin: (user, callback) =>
      actions.facebookLogin(dispatch, user, callback),
    GoogleSignin: (email, callback) =>
      actions.GoogleSignin(dispatch, email, callback),
    GoogleRegister: (email, name, callback) =>
      actions.GoogleRegister(dispatch, email, name, callback),

    getFacebookUser: (user, callback) =>
      actions.getFacebookUser(dispatch, user, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
