import React, {Component} from 'react';

import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

import {Languages, Color} from '../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modalbox';
import {OTPInput} from './index';

var delayCounter2;
class OTPModal extends Component {
  constructor(props) {
    super(props);
    this.otpRef = React.createRef();
    this.state = {
      resendResetCodeCounter: Languages.Resend,
      disabledResetCode: false,
    };
  }

  resendInitCounter = () => {
    let delay = 60000;
    let counter = 0;
    this.setState({
      disabledResetCode: true,
    });
    clearInterval(delayCounter2);

    delayCounter2 = setInterval(() => {
      this.setState(
        {
          resendResetCodeCounter:
            Languages.ResendAfter + (delay - counter * 1000) / 1000,
        },
        () => {
          if (delay - counter * 1000 <= 0) {
            counter = 0;

            clearInterval(delayCounter2);
            this.setState({
              resendResetCodeCounter: Languages.Resend,
            });
            this.setState({
              disabledResetCode: false,
            });
          }
          counter++;
        },
      );
    }, 1000);
  };

  open() {
    this.refs.OTPModal.open();
  }
  close() {
    this.refs.OTPModal.close();
  }
  convertToNumber(number) {
    if (number) {
      number = number + '';
      return number
        .replace(/٠/g, '0')
        .replace(/،/g, '.')
        .replace(/٫/g, '.')
        .replace(/,/g, '.')
        .replace(/١/g, '1')
        .replace(/٢/g, '2')
        .replace(/٣/g, '3')
        .replace(/٤/g, '4')
        .replace(/٥/g, '5')
        .replace(/٦/g, '6')
        .replace(/٧/g, '7')
        .replace(/٨/g, '8')
        .replace(/٩/g, '9');
    } else return '';
  }
  render() {
    return (
      <Modal
        ref="OTPModal"
        isOpen={this.props.isOpen ? this.props.isOpen : false}
        style={[styles.modelModal]}
        position="center"
        onOpened={() => {
          this.setState({showOTP: true});
          if (this.props.onOpened) {
            this.props.onOpened();
          }
          if (!this.props.ignoreResend) {
            this.resendInitCounter();
          }
        }}
        onClosed={() => {
          this.setState({showOTP: false});

          if (this.props.onClosed) {
            this.props.onClosed();
          }
          this.props.onChange('');

          clearInterval(delayCounter2);
        }}
        backButtonClose={true}
        entry="bottom"
        swipeToClose={false}
        backdropOpacity={0.5}>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.modelContainer}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                zIndex: 10,
                right: 10,
              }}
              onPress={() => {
                this.close();
              }}>
              <IconMC name="close" size={30} color={Color.primary} />
            </TouchableOpacity>

            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text style={styles.fontStyle}>{this.props.OTPMessage}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.fontStyle}>
                  {' ' + this.props.Username}
                </Text>
                {this.props.change && false && (
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      this.props.onChangeClick();
                    }}>
                    <Text style={[styles.fontStyle, {color: Color.primary}]}>
                      {' ' + Languages.Change}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {this.props.pendingDelete ? (
                <View style={{}}>
                  <Text style={styles.fontStyle}>{Languages.EnterItNow}</Text>

                  <Text style={{color: 'red', textAlign: 'center'}}>
                    {Languages.OrOfferDeleted}
                  </Text>
                </View>
              ) : (
                <Text style={styles.fontStyle}>{this.props.EnterMessage}</Text>
              )}
              {this.state.showOTP && (
                <Pressable
                  onPress={() => {
                    this.otpRef.current?.textInput.focus();
                  }}>
                  <OTPInput
                    ref={this.otpRef}
                    value={this.props.otp}
                    onChange={otp => {
                      this.props.onChange(this.convertToNumber(otp));
                    }}
                    containerStyle={{
                      padding: 10,
                      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                    }}
                    editable={true}
                    cellStyle={{backgroundColor: '#fff', color: '#000'}}
                    tintColor="#FB6C6A"
                    offTintColor="#fff"
                    onSubmitEditing={() => {
                      if (this.props.otp && this.props.otp.length > 4) {
                        this.props.checkOTP();
                      } else {
                        this.props.toast(Languages.EnterFullOTP);
                      }
                    }}
                    otpLength={5}
                    autoFocus={true}
                  />
                </Pressable>
              )}

              <View
                style={{
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <TouchableOpacity
                  disabled={this.state.disabledResetCode}
                  style={{
                    alignSelf: 'center',
                    backgroundColor: this.state.disabledResetCode
                      ? 'gray'
                      : Color.secondary,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    marginTop: 20,
                    borderRadius: 15,
                  }}
                  onPress={() => {
                    this.props.onChange('');
                    this.props.resendCode();
                    this.resendInitCounter();
                  }}>
                  <Text style={{color: '#fff'}}>
                    {this.state.resendResetCodeCounter}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    alignSelf: 'center',
                    backgroundColor: Color.primary,

                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    marginTop: 20,
                    borderRadius: 15,
                  }}
                  onPress={() => {
                    if (this.props.otp && this.props.otp.length > 4) {
                      this.setState({IsLoading: true});
                      this.props.checkOTP();
                      setTimeout(() => {
                        this.setState({IsLoading: false});
                      }, 2000);
                    } else {
                      this.props.toast(Languages.EnterFullOTP);
                      //   toast(Languages.EnterFullOTP);
                    }
                  }}>
                  {this.state.IsLoading ? (
                    <ActivityIndicator color={'#fff'} size={25} />
                  ) : (
                    <Text style={{fontFamily: 'Cairo-Bold', color: '#fff'}}>
                      {Languages.Verify}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  bottomBox: {
    flexDirection: 'row',
    borderRightColor: '#fff',
    borderRightWidth: 1,
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyle: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,
  },
  blackHeader: {color: '#000', fontSize: 18, marginBottom: 5},
  boxContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderTopWidth: 1,
    //   padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    flex: 1,
    marginVertical: 10,
    borderRightColor: 'gray',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHalf: {
    //  flex: 1
    width: Dimensions.get('screen').width / 2,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    color: Color.secondary,
  },
  sectionValue: {
    fontSize: 18,
    color: '#000',
  },
  featuresRow: {
    borderTopWidth: 1,
    paddingVertical: 15,
    borderTopColor: '#eee',
    flexDirection: 'row',
  },

  featuresHalf: {
    flexDirection: 'row',
    flex: 1,
  },
  featuresText: {
    fontSize: 18,
    color: '#000',
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
    width: Dimensions.get('screen').width * 0.8,
    height: Dimensions.get('screen').height * 0.5,
    marginBottom: Platform.select({ios: 100, android: 0}),
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
  },
});

export default OTPModal;
