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
  ActivityIndicator,
  I18nManager,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {connect} from 'react-redux';
import {CommonActions} from '@react-navigation/native';
import {Color, Languages, Styles, Constants} from '../common';
import {ButtonIndex, OTPModal} from '../components';
import Toast from 'react-native-root-toast';
import KS from '../services/KSAPI';
import messaging from '@react-native-firebase/messaging';
import PhoneInput from 'react-native-phone-input';
import DeviceInfo from 'react-native-device-info';
import {toast} from '../Omni';
import IconEn from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

class RegisterScreen extends Component {
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
      ButtonDisabled: false,
      cca2: '',
    };

    this.checkConnection = this.checkConnection.bind(this);

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

  checkOTP() {
    const _this = this;
    const otp = this.state.otp;
    KS.UserVerifyOTP({
      otpcode: otp,
      userid: this.props.user.ID,
      username: this.props.route.params?.AuthData?.Username,
    }).then(data => {
      if (data.OTPVerified == true || data.EmailConfirmed == true) {
        if (data.User) {
          _this.props.storeUserData(data.User, () => {
            //   _this.props.navigation.pop(2);
            //  this.props.navigation.navigate("HomeScreen");
            // this.refs.OTPModal?.close();
            this.props.navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'DrawerStack'}], // Replace 'DrawerStack' with the name of your desired screen
              }),
            );
          });
        }
        //
      } else {
        toast(Languages.WrongOTP);
        //   alert(Languages.WrongOTP);
        setTimeout(() => {
          this.setState({otp: ''});
        }, 1800);
      }
    });
  }

  resendCode() {
    var _userName = `${this.state.username}`;
    var EmailRegister = _userName.includes('@');

    console.log({
      userID: this.state.UserID,
      otpType: EmailRegister ? 2 : 1,
      username: this.state.username,
    });

    KS.ResendOTP({
      userID: this.state.UserID,
      otpType: EmailRegister ? 2 : 1,
      username: this.state.username,
    }).then(data => {
      console.log({data});
      if (data.Success === 1) {
        toast(Languages.WeSendUOTP);
        this.setState({openVerifyModal: true});
      } else toast(Languages.SomethingWentWrong);
    });
  }

  render() {
    let AuthData = this.props.route.params?.AuthData ?? {};
    return (
      <View style={styles.containerTopLevel}>
        <OTPModal
          isOpen={this.state.openVerifyModal}
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterToVerifyAccount}
          Username={AuthData.Username}
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
          onClosed={() => {
            this.props.navigation.navigate('HomeScreen');
          }}
          resendCode={() => {
            this.resendCode();
          }}
        />

        <KeyboardAvoidingView
          behavior={'padding'}
          style={styles.containerTopLevel}>
          <ScrollView
            //  scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            style={{width: '100%', flex: 1}}
            bounces={false}
            keyboardShouldPersistTaps={'handled'}
            >
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: 10,
                zIndex: 10,
                top: Platform.select({ios: 40, andorid: 10}),
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
                {!!this.props.route.params?.email == false && (
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor:
                        !!this.props.route.params?.isValid && AuthData.IsNewUser
                          ? 'green'
                          : '#eee',
                      backgroundColor:
                        !!this.props.route.params?.isValid && AuthData.IsNewUser
                          ? 'rgba(0,255,0,0.2)'
                          : '#fff',

                      paddingHorizontal: 5,
                      borderRadius: 5,
                      paddingVertical: 15,
                    }}
                    onPress={() => {
                      this.props.navigation.goBack();
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        textAlign: 'left',
                        color: '#383737',
                      }}>
                      {`\u200E${this.state.username}`}
                    </Text>
                  </TouchableOpacity>
                )}
                {!!this.props.route.params?.email && (
                  <View style={{}}>
                    <Text style={styles.title}>{Languages.Email}</Text>

                    <TouchableOpacity
                      style={{}}
                      onPress={() => {
                        this.props.navigation.goBack();
                      }}>
                      <TextInput
                        editable={false}
                        style={{
                          height: 40,
                          paddingVertical: 0,
                          borderRadius: 5,
                          fontFamily: 'Cairo-Regular',
                          backgroundColor: !!this.props.route.params?.isValid
                            ? 'rgba(0,255,0,0.2)'
                            : '#fff',
                          borderColor: !!this.props.route.params?.isValid
                            ? 'green'
                            : '#eee',
                          borderWidth: 1,
                          color: '#383737',
                        }}
                        placeholderTextColor={'#38373770'}
                        placeholder={Languages.EnterYourEmail}
                        onChangeText={text => {
                          this.setState({email: text.trim()});
                        }}
                        value={AuthData.Username}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {AuthData.IsNewUser && (
                  <View style={{}}>
                    <Text style={styles.title}>{Languages.Name}</Text>

                    <View
                      style={{
                        borderWidth: 1,
                        borderColor:
                          this.state.name && this.state.name?.length >= 3
                            ? 'green'
                            : '#eee',
                        paddingHorizontal: 5,
                        backgroundColor:
                          this.state.name && this.state.name?.length >= 3
                            ? 'rgba(0,255,0,0.2)'
                            : '#fff',

                        borderRadius: 5,

                        //   paddingVertical: 10
                      }}>
                      <TextInput
                        placeholder={Languages.EnterYourName}
                        value={this.state.name}
                        style={{
                          paddingVertical: 10,
                          fontFamily: 'Cairo-Regular',
                          minHeight: 40,
                          borderRadius: 5,
                          textAlign: I18nManager.isRTL ? 'right' : 'left',
                          color: '#383737',
                        }}
                        placeholderTextColor={'#38373770'}
                        maxLength={26}
                        onChangeText={name => {
                          this.setState({name});
                        }}
                      />
                    </View>
                  </View>
                )}

                <Text style={styles.title}>{Languages.Password}</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor:
                      this.state.password &&
                      this.state.password.length >= 6 &&
                      AuthData.IsNewUser
                        ? 'green'
                        : '#eee',
                    paddingHorizontal: 5,
                    backgroundColor:
                      this.state.password &&
                      this.state.password.length >= 6 &&
                      AuthData.IsNewUser
                        ? 'rgba(0,255,0,0.2)'
                        : '#fff',

                    borderRadius: 5,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                    }}>
                    <TextInput
                      placeholder={Languages.EnterYourPassword}
                      secureTextEntry={this.state.passwordHidden}
                      style={{
                        minHeight: 40,
                        flex: 1,
                        paddingVertical: 5,
                        borderRadius: 5,
                        textAlign: I18nManager.isRTL ? 'right' : 'left',
                        fontFamily: 'Cairo-Regular',
                        color: '#383737',
                      }}
                      placeholderTextColor={'#38373770'}
                      value={this.state.password}
                      onChangeText={password => {
                        this.setState({password});
                      }}
                    />

                    <TouchableOpacity
                      style={{
                        height: 35,
                        paddingHorizontal: 5,
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        this.setState({
                          passwordHidden: !this.state.passwordHidden,
                        });
                      }}>
                      <IconMC
                        name={this.state.passwordHidden ? 'eye' : 'eye-off'}
                        //  style={{ marginRight: 10 }}
                        size={20}
                        color={'#000'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {(AuthData.OTPConfirmed || AuthData.EmailConfirmed) && (
                  <TouchableOpacity
                    style={{marginTop: 5}}
                    onPress={() => {
                      this.props.navigation.navigate('ForgotPassword', {
                        isEmailBasedCountry:
                          this.props.route.params?.isEmailBasedCountry ?? 0,
                      });
                    }}>
                    <Text style={{color: Color.primary, textAlign: 'left'}}>
                      {Languages.ForgotPassword}
                    </Text>
                  </TouchableOpacity>
                )}

                {this.state.isLoading ? (
                  <ActivityIndicator
                    color={Color.primary}
                    size="large"
                    style={{marginTop: 20, marginBottom: 5}}
                  />
                ) : (
                  <ButtonIndex
                    text={
                      AuthData.IsNewUser ? Languages.SignUp : Languages.Login
                    }
                    disabled={this.state.isLoading}
                    containerStyle={[
                      styles.loginButton,

                      AuthData.IsNewUser &&
                        this.state.name &&
                        this.state.name?.length >= 3 &&
                        this.state.password &&
                        this.state.password?.length >= 6 && {
                          backgroundColor: 'green',
                        },
                      {
                        backgroundColor: this.state.isLoading
                          ? 'gray'
                          : Color.primary,
                      },
                    ]}
                    onPress={() => {
                      if (!this.state.password) return;

                      if (AuthData?.IsNewUser && this.state.name?.length < 3) {
                        toast(Languages.nameTooShort);
                      } else if (
                        AuthData.IsNewUser &&
                        this.state.password.length < 6
                      ) {
                        toast(Languages.passwordTooShort);
                      } else {
                        this.setState({ButtonDisabled: true});

                        let deviceID = DeviceInfo.getUniqueId();

                        this.setState({isLoading: true});

                        KS.LoginUser({
                          username: this.state.username,
                          langid: Languages.langID,
                          deviceID: deviceID,
                          name: this.state.name,
                          password: this.state.password,
                          isocode: this.props.route.params?.isoCode ?? '',
                          otpconfirmed: AuthData.OTPConfirmed,
                        }).then(data => {
                          console.log({data});

                          if (data && data.Success == 1) {
                            if (data.LoginSuccess) {
                              if (data.User && data.User.IsActive == false) {
                                toast(Languages.AccountBlocked);
                                this.setState({
                                  isLoading: false,
                                  ButtonDisabled: false,
                                  UserID: data?.UserID,
                                });
                              } else {
                                this.props.storeUserData(data.User, _data => {
                                  if (
                                    !AuthData.OTPConfirmed &&
                                    !AuthData.EmailConfirmed
                                  ) {
                                    this.setState({openVerifyModal: true});
                                  } else if (
                                    AuthData.OTPConfirmed ||
                                    AuthData.EmailConfirmed
                                  ) {
                                    this.props.navigation.replace('App', {
                                      screen: 'HomeScreen',
                                    });
                                    this.setState({ButtonDisabled: false});
                                  }
                                  this.setState({
                                    isLoading: false,
                                    ButtonDisabled: false,
                                    UserID: data?.UserID,
                                  });
                                });
                              }
                            } else {
                              toast(Languages.IncorrectUsernameOrPassword);
                              this.setState({
                                isLoading: false,
                                ButtonDisabled: false,
                                UserID: data?.UserID,
                              });
                            }
                          } else {
                            this.setState({
                              isLoading: false,
                              ButtonDisabled: false,
                              UserID: data?.UserID,
                            });
                            alert('something went wrong');
                          }
                        });
                      }
                    }}
                    textStyle={{
                      fontFamily: Constants.fontFamily,
                    }}
                  />
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.replace('PrivacyPolicy');
                }}>
                <Text
                  style={{
                    fontFamily: 'Cairo-Regular',
                    textAlign: 'center',
                    fontSize: 17,
                    paddingHorizontal: 30,
                    color: '#383737',
                  }}>
                  {Languages.ByContinuing}
                  <Text style={{color: Color.primary}}>
                    {' ' + Languages.Terms + ' '}
                  </Text>
                  {Languages.AndPrivacy}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    textAlign: 'left',
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

RegisterScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = ({netInfo, user}) => ({netInfo, user: user.user});

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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScreen);
