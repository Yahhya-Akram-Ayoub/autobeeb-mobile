import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  I18nManager,
} from 'react-native';
import {Color, Images, Styles, Constants, Languages, Icons} from '../common';
import {toast} from '../Omni';
import PhoneInput from 'react-native-phone-input';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ListingPhone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cca2: null,
      countryPickerShown: false,
    };

    this.phoneRef = React.createRef();
  }

  componentDidMount() {
    this.props.FindStep();
    // console.log(this.props.user);
    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        console.log(data, ' //// /// //');
        this.setState({cca2: data});
      }
    });

    setTimeout(() => {
      this.setState({done: true}); // this is only to reinitalize the state so the phone input stays green even after leaving the page
      this.phoneRef?.focus();
    }, 500);
  }

  onPressFlag() {
    this?.countryPicker?.openModal();
  }

  selectCountry(country) {
    this.phoneRef.selectCountry(country.cca2.toLowerCase());
    this.setState({cca2: country.cca2});
  }

  render() {
    return (
      <ScrollView
        style={{flex: 1, backgroundColor: 'white'}}
        contentContainerStyle={{justifyContent: 'center', flexGrow: 1}}
        keyboardShouldPersistTaps={Platform.select({
          ios: 'handled',
          android: 'always',
        })}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.select({ios: 200, android: 100})}
          behavior={Platform.select({android: 'padding', ios: 'padding'})}>
          <View style={{}}>
            {false && (
              <Text style={{textAlign: 'center', paddingBottom: 15}}>
                {Languages.EnterValidNumber}
              </Text>
            )}
            {this.state.cca2 && (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 5,
                  borderColor: this.phoneRef.isValidNumber() ? 'green' : '#eee',
                  backgroundColor: this.phoneRef.isValidNumber()
                    ? 'rgba(0,255,0,0.2)'
                    : '#fff',
                  paddingHorizontal: 5,
                  marginHorizontal: 20,
                }}>
                <PhoneInput
                  ref={this.phoneRef}
                  initialCountry={this.state.cca2.toLowerCase()}
                  onPressFlag={data => {
                    if (
                      this.props.user &&
                      this.props.user.EmailRegister &&
                      this.props.user?.Phone?.length > 0
                    ) {
                    } else {
                      this.onPressFlag();
                    }
                  }}
                  allowZeroAfterCountryCode={false}
                  textProps={{maxLength: 16}}
                  textStyle={{height: 40, color: '#000'}}
                  style={{
                    height: 40,
                    alignItems: 'center',
                    gap: 5,
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                  }}
                  hitSlop={{top: 40, left: 40, bottom: 40, right: 40}}
                  flagStyle={{
                    resizeMode: 'contain',
                    borderRadius: 25,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                  }}
                  disabled={
                    this.props.user &&
                    this.props.user.EmailRegister &&
                    this.props.user?.Phone?.length > 0
                  }
                  value={this.props.phone}
                  onChangePhoneNumber={phone => {
                    if (
                      this.props.user &&
                      this.props.user.OTPConfirmed &&
                      this.phoneRef.getISOCode() !=
                        this.props.user.ISOCode.toLowerCase()
                    ) {
                      this.phoneRef.selectCountry(
                        this.props.user.ISOCode.toLowerCase(),
                      );
                    } else if (
                      //          !this.props.user &&
                      this.phoneRef.getISOCode() !=
                      this.state.cca2.toLowerCase()
                    ) {
                      this.phoneRef.selectCountry(
                        this.state.cca2.toLowerCase(),
                      );
                      Keyboard.dismiss();
                      setTimeout(() => {
                        this.phoneRef.focus();
                      }, 200);
                    } else {
                      this.props.onChangePhoneNumber(phone);
                    }
                  }}
                />
              </View>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: this.phoneRef.isValidNumber()
                  ? 'green'
                  : Color.secondary,
                alignSelf: 'center',
                width: Dimensions.get('screen').width * 0.4,
                paddingVertical: 10,
                borderRadius: 25,
                elevation: 2,
                marginTop: 20,
              }}
              onPress={() => {
                if (this.props.CountriesData) {
                  let selectedCountry =
                    this.props.CountriesData &&
                    this.props.CountriesData.find(
                      x =>
                        x.ISOCode.toLowerCase() == this.phoneRef.getISOCode(),
                    )
                      ? this.props.CountriesData.find(
                          x =>
                            x.ISOCode.toLowerCase() ==
                            this.phoneRef.getISOCode(),
                        )
                      : null;

                  if (selectedCountry.EmailRegister) {
                    if (this.phoneRef.isValidNumber()) {
                      if (this.props.isEditing) {
                        this.props.onEditingDone(
                          this.phoneRef.getValue(),
                          this.phoneRef.getISOCode(),
                          true,
                        );
                      } else {
                        this.props.onDone(
                          this.phoneRef.getValue(),
                          this.phoneRef.getISOCode(),
                        );
                      }
                    } else {
                      toast(Languages.InvalidNumber);
                    }
                  } else {
                    if (this.phoneRef.getValue().length > 9) {
                      if (this.props.isEditing) {
                        this.props.onEditingDone(
                          this.phoneRef.getValue(),
                          this.phoneRef.getISOCode(),
                          false,
                        );
                      } else {
                        this.props.onDone(
                          this.phoneRef.getValue(),
                          this.phoneRef.getISOCode(),
                        );
                      }
                    } else {
                      toast(Languages.InvalidNumber);
                    }
                  }
                }
              }}>
              <Text style={{color: '#fff', textAlign: 'center'}}>
                {Languages.Next}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

export default ListingPhone;
