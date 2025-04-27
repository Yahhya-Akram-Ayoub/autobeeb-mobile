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
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';

import {Color, Languages, Styles, Constants} from '../common';
import {ButtonIndex, OTPModal, LogoSpinner} from '../components';
import Toast from 'react-native-root-toast';
import KS from '../services/KSAPI';
import messaging from '@react-native-firebase/messaging';
import {toast} from '../Omni';
import IconEn from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

//GoogleSignin.configure ();

class ChangePasswordScreen extends Component {
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
      passwordHidden: true,
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
            this.props.navigation.navigate('App');
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
    this.setState({otp: ''});
    KS.ResendOTP({
      userID: this.props.user.ID,
      otpType: this.props.user?.EmailRegister ? 2 : 0,
    }).then(data => {
      //   alert(JSON.stringify(data));
      if (data.Success == 1) {
        this.setState({
          resend: false,
          resendTimer: 30,
        });
      } else {
        alert('something went wrong');
      }
      //
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
              <Text
                style={[
                  styles.fontStyle,
                  {color: '#000', textAlign: 'center', marginBottom: 15},
                ]}>
                {Languages.EnterNewPassword}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  borderRadius: 5,

                  backgroundColor: '#fff',
                  borderColor: '#eee',
                  borderWidth: 1,
                }}>
                <TextInput
                  ref="password"
                  secureTextEntry={this.state.passwordHidden}
                  style={{
                    height: 40,
                    flex: 1,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    fontFamily: 'Cairo-Regular',
                    paddingVertical: 0,
                  }}
                  placeholder={Languages.YourPassword}
                  maxLength={26}
                  onChangeText={text => {
                    this.setState({password: text});
                  }}
                  value={this.state.password}
                />

                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.setState({
                      passwordHidden: !this.state.passwordHidden,
                    });
                  }}>
                  <IconMC
                    name={this.state.passwordHidden ? 'eye' : 'eye-off'}
                    size={20}
                    color={'#000'}
                  />
                </TouchableOpacity>
              </View>
              <ButtonIndex
                text={
                  this.state.loading ? (
                    <ActivityIndicator color={'#fff'} size={25} />
                  ) : (
                    Languages.Confirm
                  )
                }
                containerStyle={[styles.loginButton]}
                onPress={() => {
                  this.setState({loading: true});
                  if (this.state.password && this.state.password.length >= 6) {
                    KS.ChangePassword({
                      password: this.state.password,
                      userid: this.props.route.params?.user?.ID,
                    })
                      .then(data => {
                        if (data && data?.Success == 1) {
                          this.props.storeUserData(data?.User);
                          this.props.navigation.navigate('HomeScreen');
                        } else {
                          this.setState({loading: false});
                        }
                      })
                      .catch(err => {
                        this.setState({loading: false});
                      });
                  } else {
                    this.setState({loading: false});
                    alert(Languages.PasswordLength6OrMore);
                  }
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

ChangePasswordScreen.propTypes = {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangePasswordScreen);
