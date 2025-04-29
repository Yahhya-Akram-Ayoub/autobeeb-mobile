import React, {useEffect, useRef, useState} from 'react';

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
  ActivityIndicator,
} from 'react-native';
import {Languages, Color} from '../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modalbox';
import {OTPInput} from './index';

var delayCounter2;

const OTPModal = ({
  isOpen,
  ignoreResend,
  onClosed,
  onOpened,
  onChange,
  resendCode,
  otp,
  toast,
  checkOTP,
  OTPMessage,
  Username,
  pendingDelete,
  EnterMessage,
}) => {
  const otpRef = useRef();
  const [resendResetCodeCounter, setResendResetCodeCounter] = useState(
    Languages.Resend,
  );
  const [disabledResetCode, setDisabledResetCode] = useState(false);
  const [openOTPModal, setOpenOTPModal] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOpenOTPModal(isOpen);
  }, [isOpen]);

  const resendInitCounter = () => {
    let delay = 60000;
    let counter = 0;
    setDisabledResetCode(true);
    clearInterval(delayCounter2);

    delayCounter2 = setInterval(() => {
      const _resendResetCodeCounter =
        Languages.ResendAfter + (delay - counter * 1000) / 1000;
      setResendResetCodeCounter(_resendResetCodeCounter);
      if (delay - counter * 1000 <= 0) {
        counter = 0;
        clearInterval(delayCounter2);
        setResendResetCodeCounter(Languages.Resend);
        setDisabledResetCode(false);
      }
      counter++;
    }, 1000);
  };

  const open = () => {
    setOpenOTPModal(true);
  };
  const close = () => {
    setOpenOTPModal(false);
  };

  const convertToNumber = number => {
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
  };

  return (
    <Modal
      isOpen={openOTPModal}
      style={[styles.modelModal]}
      position="center"
      onOpened={() => {
        setShowOTP(true);

        if (onOpened) {
          onOpened();
        }

        if (!ignoreResend) {
          resendInitCounter();
        }
      }}
      onClosed={() => {
        setShowOTP(false);
        onChange('');
        clearInterval(delayCounter2);

        if (onClosed) {
          onClosed();
        }
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
              close();
            }}>
            <IconMC name="close" size={30} color={Color.primary} />
          </TouchableOpacity>

          <View style={{flex: 1, justifyContent: 'center'}}>
            <Text style={styles.fontStyle}>{OTPMessage}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={styles.fontStyle}>{' ' + Username}</Text>
            </View>
            {pendingDelete ? (
              <View style={{}}>
                <Text style={styles.fontStyle}>{Languages.EnterItNow}</Text>
                <Text style={{color: 'red', textAlign: 'center'}}>
                  {Languages.OrOfferDeleted}
                </Text>
              </View>
            ) : (
              <Text style={styles.fontStyle}>{EnterMessage}</Text>
            )}
            {showOTP && (
              <Pressable
                onPress={() => {
                  otpRef.current?.textInput.focus();
                }}>
                <OTPInput
                  ref={otpRef}
                  value={otp}
                  onChange={_otp => {
                    onChange(convertToNumber(_otp));
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
                    if (otp && otp.length > 4) {
                      checkOTP();
                    } else {
                      toast(Languages.EnterFullOTP);
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
                disabled={disabledResetCode}
                style={{
                  alignSelf: 'center',
                  backgroundColor: disabledResetCode ? 'gray' : Color.secondary,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 20,
                  borderRadius: 15,
                }}
                onPress={() => {
                  onChange('');
                  resendCode();
                  resendInitCounter();
                }}>
                <Text style={{color: '#fff'}}>{resendResetCodeCounter}</Text>
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
                  if (otp && otp.length > 4) {
                    setIsLoading(true);
                    checkOTP();
                    setTimeout(() => {
                      setIsLoading(false);
                    }, 2000);
                  } else {
                    toast(Languages.EnterFullOTP);
                  }
                }}>
                {isLoading ? (
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
};

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
