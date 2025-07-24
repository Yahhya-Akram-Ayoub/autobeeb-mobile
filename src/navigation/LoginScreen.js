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
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  I18nManager,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Color, Languages, Styles, Constants} from '../common';
import {toast} from '../Omni';
import {ButtonIndex, LogoSpinner} from '../components';
import KS from '../services/KSAPI';
import messaging from '@react-native-firebase/messaging';
import PhoneInput from 'react-native-phone-input';
import DeviceInfo from 'react-native-device-info';
import IconEn from 'react-native-vector-icons/MaterialCommunityIcons';
import CountryPicker from '../components/CountryModal/CountryPickerModal';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';

GoogleSignin.configure({
  iosClientId:
    '409836146565-eam3sed7de7uiqn3lprnb4bfov685502.apps.googleusercontent.com',
  webClientId:
    //  '409836146565-fdcfrv5dfv460thftop83ae2o9i01vgg.apps.googleusercontent.com',
    '409836146565-6vk84khr54jnui21u6pbo6v1umk6mg6t.apps.googleusercontent.com',
});
// GoogleSignin.configure();

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paddingBottom: 0,
      user: null,
      username: '',
      password: '',
      isLoading: false,
      logInFB: false,
      userInfo: null,
      loading: false,
      modalVisible: false,
      cca2: null,
      hidePhone: this.props.route.params?.skippable ?? false,
      openEmailModal: false,
    };

    this.scrollviewRef = React.createRef();
  }

  // resetData = {
  //   index: 0,
  //   key: null,
  //   actions: this.props.navigation.navigate('App'),
  // };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  componentDidMount() {
    this.setState({isLoading: true}, () => {
      AsyncStorage.getItem('cca2', (error, data) => {
        if (data) {
          this.setState({cca2: data});
          KS.CountriesGet({langid: Languages.langID}).then(CountriesData => {
            if (CountriesData && CountriesData.Success == '1') {
              let country = CountriesData.Countries.find(
                cntry => cntry.ISOCode == data,
              );
              if (country && country.EmailRegister) {
                // khattab
                this.setState({
                  emailShown: true,
                  hidePhone: true,
                });
              }
              this.setState({isLoading: false});
            }
          });
        } else {
          this.setState({isLoading: false});
        }
      });
    });
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

  socialMediaImage(url, userID, emailVerified = true) {
    KS.SocialMediaImage({
      image: url,
      userID: userID,
      langID: Languages.langID,
    }).then(imgResponse => {
      if (imgResponse.Success == 1) {
        this._DoLogin(imgResponse.User, emailVerified);
      } else {
        alert('Social Media Image Error: ' + imgResponse.Message);
      }
    });
  }

  _DoLogin(user, emailVerified = true) {
    this.props.storeUserData(user, data => {
      if (!emailVerified) {
        this.props.navigation.replace('EditProfile', {VerifyEmail: true});
      } else {
        //  this.props.navigation.navigate("HomeScreen");
        this.props.navigation.navigate('App');
      }
    });
  }

  DofacebookLogin(email, name, id, image, emailVerified = true) {
    if (!this.validateEmail(email.toString())) {
      //here we are trusting fb to be validating ther mails so we WILL NOT reach this code without the UserEmailModal being opend
      //IDK what will happen if fb returned an unvalid email :)
      Alert.alert('', Languages.InvalidEmail);
      this.setState({EmailSignUpDisabled: false});
      return;
    }
    KS.FacebookLogin({
      email: email,
      name: name,
      facebookid: id,
      emailVerified: emailVerified,
    }).then(response => {
      if (response.Success == 1) {
        if (response.Status == 1) {
          if (image && image != '' && typeof image != 'undefined') {
            this.socialMediaImage(image, response.User.ID, emailVerified);
          } else {
            this._DoLogin(response.User, emailVerified);
          }
        } else {
          Alert.alert('', Languages.EmailAlreadyTaken);
          this.setState({EmailSignUpDisabled: false});

          //      $(facebookEmail).notify('Email already in use', 'error');
        }
      } else {
        this.setState({EmailSignUpDisabled: false});

        alert('Error Facebook Signup: ' + response.Message);
      }
    });
  }
  async onAppleButtonPress() {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    this.setState({loading: true});
    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      {
        KS.AppleLogin({
          appleid: appleAuthRequestResponse.user,
          email: appleAuthRequestResponse.email
            ? appleAuthRequestResponse.email
            : null,
          name:
            appleAuthRequestResponse.fullName.givenName +
            ' ' +
            appleAuthRequestResponse.fullName.familyName,
          langID: '1',
        }).then(LoginData => {
          this.setState({loading: false});
          if (LoginData && LoginData.Success) {
            if (LoginData.Status == 1) {
              this.props.storeUserData(
                LoginData.Dealer && LoginData.Dealer.User
                  ? LoginData.Dealer.User
                  : LoginData.User,
                data => {
                  this.props.navigation.navigate('App');
                },
              );
            } else {
              alert(Languages.error);
            }
          }
        });
      }
    }
  }
  validateEmail(email) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  _signIn = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error) {
      console.log({error});
      this.setState({loading: false});
    }
  };

  initUser(token) {
    return fetch(
      'https://graph.facebook.com/v5.0/me?fields=email,name,friends,picture&access_token=' +
        token,
    )
      .then(response => response.json())
      .then(json => {
        return json;
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

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShow?.remove();
      this.keyboardWillHide?.remove();
    } else {
      this.keyboardDidShow?.remove();
      this.keyboardDidHide?.remove();
    }
  }

  _keyboardDidShow() {
    this.setState({
      paddingBottom: Platform.select({ios: 250, android: 100}),
    });
    setTimeout(() => {
      this.scrollviewRef.current?.scrollToEnd();
    }, 200);
  }

  _keyboardDidHide() {
    this.setState({paddingBottom: 0});
  }

  render() {
    const {username, password, isLoading} = this.state;
    const _this = this;
    const skippable = this.props.route.params?.skippable ?? false;
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1}}>
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <View style={{flex: 1}}>
        <Modal
          visible={this.state.openEmailModal}
          style={[styles.modelModal]}
          position="center"
          entry="bottom"
          swipeToClose={false}
          coverScreen={Platform.select({ios: false, android: true})}
          backdropOpacity={0.5}>
          <KeyboardAvoidingView behavior="padding">
            <View style={styles.modelContainer}>
              <View style={{flex: 1, justifyContent: 'center'}}>
                <View style={{marginBottom: 20}}>
                  <Text
                    style={{
                      color: '#383737',
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    {Languages.WeCouldntGetEmail}
                  </Text>

                  <Text
                    style={{
                      fontSize: 15,
                      color: '#383737',
                      textAlign: 'center',
                    }}>
                    {Languages.EnterEmailToAccess}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: this.validateEmail(this.state.fbEmail)
                      ? 'green'
                      : Color.primary,
                    borderRadius: 10,
                    marginTop: 20,
                  }}>
                  <TextInput
                    style={{
                      height: 40,
                      paddingVertical: 0,
                      fontFamily: 'Cairo-Regular',
                      paddingHorizontal: 10,
                      textAlign: I18nManager.isRTL ? 'right' : 'left',
                      color: '#383737',
                    }}
                    placeholderTextColor={'#38373770'}
                    placeholder={Languages.EnterYourEmail}
                    value={this.state.fbEmail}
                    onChangeText={fbEmail => {
                      this.setState({fbEmail});
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({openEmailModal: true});
                    }}
                    style={{
                      backgroundColor: 'red',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      marginTop: 20,
                      borderRadius: 15,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Cairo-Bold',
                        color: '#fff',
                        textAlign: 'center',
                      }}>
                      {Languages.Close}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={
                      this.state.EmailSignUpDisabled || !this.state.fbEmail
                    }
                    style={{
                      alignSelf: 'center',
                      backgroundColor:
                        this.state.EmailSignUpDisabled || !this.state.fbEmail
                          ? 'gray'
                          : this.validateEmail(this.state.fbEmail)
                          ? 'green'
                          : Color.primary,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      marginTop: 20,
                      borderRadius: 15,
                    }}
                    onPress={() => {
                      this.setState({EmailSignUpDisabled: true}, () => {
                        this.DofacebookLogin(
                          this.state.fbEmail,
                          this.state.responseFacebook.name,
                          this.state.responseFacebook.id,
                          this.state.responseFacebook.picture.data
                            ? this.state.responseFacebook.picture.data.url
                            : null,
                          false,
                        );
                      });
                    }}>
                    <Text style={{fontFamily: 'Cairo-Bold', color: '#fff'}}>
                      {Languages.SignUp}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <ScrollView
          ref={this.scrollviewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flex: 1,
            paddingBottom: this.state.paddingBottom,
          }}
          style={[styles.containerTopLevel]}>
          {this.state.loading && (
            <View
              onLayout={() => {
                setTimeout(() => {
                  if (this.state.loading) {
                    this.setState({loading: false});
                  }
                }, 20000);
              }}
              style={{
                flex: 1,
                elevation: 1,
                zIndex: 100,
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                width: Dimensions.get('screen').width,
                height: Dimensions.get('screen').height,
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {!skippable && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: 10,
                zIndex: 10,
                top: Platform.select({ios: 40, android: 10}),
              }}
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <IconEn name="close" size={30} color={Color.primary} />
            </TouchableOpacity>
          )}

          {skippable && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 45,
                zIndex: Platform.select({ios: 100, android: -1}),
                top: Platform.select({ios: 40, android: 20}),
              }}
              onPress={() => {
                this.props.navigation.replace('PostOfferScreen');
              }}>
              <Text
                style={{
                  color: Color.primary,
                  fontSize: 25,
                  fontFamily: 'Cairo-Bold',
                }}>
                {Languages.Skip}
              </Text>
            </TouchableOpacity>
          )}

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
              <View style={styles.loginForm}>
                {
                  <TouchableOpacity
                    style={[
                      styles.socialButton,
                      {
                        backgroundColor: 'white',
                        elevation: 1,
                        borderColor: 1,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: {
                          width: 1,
                          height: 2,
                        },
                        overflow: 'visible',
                        marginTop: 10,
                      },
                    ]}
                    onPress={() => {
                      this.setState({loading: true});
                      this._signIn()
                        .then(data => {
                          console.log(
                            '999999999999999999999999999999999999999999',
                          );
                          KS.EmailLogin({
                            email: data.user.email,
                            langid: Languages.langID,
                          })
                            .then(LoginData => {
                              console.log({LoginData});

                              if (LoginData && LoginData.Success) {
                                console.log(
                                  '8888888888888888888888888888888888888888888',
                                );
                                if (LoginData.Status == 1) {
                                  console.log({
                                    Dealer: LoginData.Dealer,
                                    dealer: LoginData.Dealer.User,
                                    user: LoginData.User,
                                  });
                                  this.props.storeUserData(
                                    LoginData.Dealer && LoginData.Dealer.User
                                      ? LoginData.Dealer.User
                                      : LoginData.User,
                                    data => {
                                      this.props.navigation.replace('App', {
                                        screen: 'HomeScreen',
                                      });
                                    },
                                  );
                                } else {
                                  KS.EmailRegister({
                                    email: data.user.email,
                                    phone: data.user.phone || '',
                                    name: data.user.name,
                                    langid: Languages.langID,
                                  })
                                    .then(RegisterData => {
                                      console.log({RegisterData});
                                      if (
                                        RegisterData &&
                                        RegisterData.Success
                                      ) {
                                        if (RegisterData.Status == 1) {
                                          if (data.user.photo) {
                                            this.socialMediaImage(
                                              data.user.photo,
                                              RegisterData.User.ID,
                                            );
                                          }
                                          this.props.storeUserData(
                                            RegisterData.User,
                                            data => {
                                              this.props.navigation.dispatch(
                                                this.props.navigation.navigate(
                                                  'App',
                                                ),
                                              );
                                            },
                                          );
                                        }
                                      }
                                    })
                                    .catch(err => {
                                      console.log({login_err: err});
                                    });
                                }
                              }
                            })
                            .catch(errr => {
                              this.setState({loading: false});
                              console.log({errr});
                            });
                        })
                        .catch(errr => {
                          this.setState({loading: false});
                          console.log({errr});
                        });
                    }}
                    // disabled={this.state.isSigninInProgress}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          flex: 2,
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                        }}>
                        <Image
                          style={{width: 25, height: 25, marginRight: 15}}
                          resizeMode="contain"
                          source={require('../images/google.png')}
                        />
                      </View>

                      <Text
                        style={{
                          color: '#555',
                          flex: 4,
                          textAlign: 'left',
                        }}>
                        {Languages.SignUpWithGoogle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                }
                {Platform.OS === 'ios' && (
                  <View
                    style={{
                      width: '100%',
                      paddingHorizontal: 5,
                      height: 45,
                      marginTop: 10,
                    }}>
                    <AppleButton
                      buttonStyle={AppleButton.Style.BLACK}
                      buttonType={AppleButton.Type.SIGN_IN}
                      style={{
                        width: '100%', // You must specify a width
                        height: 45, // You must specify a height
                      }}
                      onPress={() => this.onAppleButtonPress()}
                    />
                  </View>
                )}
              </View>

              <View style={styles.separatorWrap}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>{Languages.Or}</Text>
                <View style={styles.separator} />
              </View>

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
                      {' ' + Languages.Phone}
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
                  disabled={this.state.hidePhone}
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
                    {' ' + Languages.Email}
                  </Text>
                </TouchableOpacity>
              </View>
              {this.state.emailShown && (
                <TextInput
                  style={{
                    height: 40,
                    fontFamily: 'Cairo-Regular',
                    borderRadius: 5,
                    paddingVertical: 0,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    backgroundColor: this.validateEmail(this.state.email)
                      ? 'rgba(0,255,0,0.2)'
                      : '#fff',
                    borderColor: this.validateEmail(this.state.email)
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
                  value={this.state.email}
                />
              )}
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
                    paddingVertical: 7,
                    alignItems: 'center',
                  }}>
                  {this.state.cca2 && (
                    <PhoneInput
                      ref={ref => {
                        this.phone = ref;
                      }}
                      offset={10}
                      autoFocus
                      allowZeroAfterCountryCode={false}
                      initialCountry={
                        this.state.cca2 ? this.state.cca2.toLowerCase() : '+'
                      }
                      onPressFlag={() => {}}
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
                          if (username.length == 0) {
                            this.setState({initialCountry: '+'});
                          }
                          this.setState({username});
                        }
                      }}
                      textStyle={{height: 40, color: '#000'}}
                      style={{
                        paddingVertical: 0,
                        gap: 5,
                        flexDirection: I18nManager.isRTL
                          ? 'row-reverse'
                          : 'row',
                        color: '#000',
                      }}
                      textProps={{
                        placeholder: Languages.EnterMobileOrEmail,
                        maxLength: 16,
                      }}
                      flagStyle={{
                        resizeMode: 'contain',
                        borderRadius: 15,
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                      }}
                    />
                  )}
                </View>
              )}
              <ButtonIndex
                text={Languages.Continue}
                containerStyle={[
                  styles.loginButton,
                  this.phone &&
                    !this.state.emailShown &&
                    this.phone.isValidNumber() && {
                      backgroundColor: 'green',
                    },
                  this.state.email &&
                    this.state.emailShown &&
                    this.validateEmail(this.state.email) && {
                      backgroundColor: 'green',
                    },
                  this.state.ButtonDisabled && {backgroundColor: 'gray'},
                ]}
                disabled={this.state.ButtonDisabled}
                onPress={async () => {
                  this.setState({ButtonDisabled: true});
                  let deviceID = DeviceInfo.getUniqueId();
                  if (this.state.emailShown) {
                    if (this.validateEmail(this.state.email)) {
                      KS.AuthStart({
                        username: this.state.email,
                        langid: Languages.langID,
                        deviceID: deviceID,
                      }).then(data => {
                        this.setState({ButtonDisabled: false});

                        if (data && data.Success == 1) {
                          this.props.navigation.navigate('RegisterScreen', {
                            AuthData: data,
                            email: true,
                            //     isoCode: this.phone.getISOCode(),
                            isValid: this.validateEmail(this.state.email),
                            isEmailBasedCountry: this.state.hidePhone,
                          });
                        } else {
                          alert('something went wrong');
                        }
                      });
                    } else {
                      this.setState({ButtonDisabled: false});

                      toast(Languages.InvalidEmail);
                    }
                  } else {
                    if (this.phone.isValidNumber()) {
                      KS.AuthStart({
                        username: this.state.username,
                        langid: Languages.langID,
                        deviceID: deviceID,
                      }).then(data => {
                        this.setState({ButtonDisabled: false});

                        if (data && data.Success == 1) {
                          this.props.navigation.navigate('RegisterScreen', {
                            AuthData: data,
                            email: false,
                            isoCode: this.phone.getISOCode(),
                            isValid: this.phone.isValidNumber(),
                            isEmailBasedCountry: this.state.hidePhone,
                          });
                        } else {
                          alert('something went wrong');
                        }
                      });
                    } else {
                      this.setState({ButtonDisabled: false});

                      toast(Languages.EnterValidNumber);
                    }
                  }
                }}
                textStyle={{
                  fontFamily: Constants.fontFamily,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('PrivacyPolicy');
                //     this.setModalVisible(true);
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
  container: {
    marginTop: 30,

    // flex: 1,
    //  backgroundColor: Color.background,
  },
  logoWrap: {
    //  ...Styles.Common.ColumnCenter,
    //   flexGrow: 1
    alignSelf: 'center',
  },
  logo: {
    width: Styles.width * 0.8,
    height: (Styles.width * 0.6) / 2,
  },
  subContain: {
    paddingHorizontal: Styles.width * 0.1,
    //    marginTop: 5,
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
    marginHorizontal: 3,
    // height: 25,
    fontFamily: Constants.fontFamily,

    elevation: 2,
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
    borderRadius: 5,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'gray',
    elevation: 3,
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
  fontStyle: {
    fontSize: 18,
    color: '#383737',
  },
  socialButton: {
    width: '97%',
    height: 45,
    alignSelf: 'center',
    borderRadius: 5,
    overflow: 'hidden',
  },
  modelModal: {
    // backgroundColor: "red",
    zIndex: 5000,
    flex: 1,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    // alignItems: "center",
    justifyContent: 'center',
    borderRadius: 10,
  },
  modelContainer: {
    borderRadius: 10,
    alignSelf: 'center',
    //  marginBottom: 20,
    width: Dimensions.get('screen').width * 0.8,
    height: Dimensions.get('screen').height * 0.4,
    marginBottom: Platform.select({ios: 100, android: 0}),
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
  },
});

const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: 'transparent',
  placeholderTextColor: Color.blackTextSecondary,
  fontFamily: Constants.fontFamily,
};

LoginScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = ({netInfo, user}) => ({netInfo, user});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/UserRedux');
  return {
    login: user => actions.login(dispatch, user),
    storeUserData: (user, callback) =>
      actions.storeUserData(dispatch, user, callback),

    logout: () => dispatch(actions.logout(dispatch)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
