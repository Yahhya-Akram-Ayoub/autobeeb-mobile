'use strict';

import React, {Component} from 'react';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  Linking,
  TouchableOpacity,
  Share,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import NewHeader from '../NewHeader';
import {connect} from 'react-redux';
import LanguagePicker from './LanguagePicker';
import {Color, Languages} from '../../common';
import {PickerSelectModal} from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryPicker from '../../components/CountryModal/CountryPickerModal';
import Entypo from 'react-native-vector-icons/Entypo';
import KS from '../../services/KSAPI';
import RNRestart from 'react-native-restart';
import {ScrollView} from 'react-native-gesture-handler';
import DeviceInfo from 'react-native-device-info';

class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cca2: null,
      modalVisible: false,
      currency: this.props.ViewingCountry && this.props.ViewingCountry.currency,
      loadSignout: false,
      showCountryPicker: false,
    };
  }
  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }
  componentDidMount() {
    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : '2',
    })
      .then(result => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));

          result.Currencies &&
            result.Currencies.forEach(cur => {
              if (cur.ID == this.props.ViewingCurrency?.ID) {
                this.props.setViewingCurrency(cur);
              }
            });
        }
      })
      .catch(err => {});
    KS.CurrenciesGet({
      langid: Languages.langID,
    }).then(data => {
      if (data && data.Currencies) {
        this.setState({Currencies: data.Currencies});
      }
    });
    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        console.log({data});
        this.setState({cca2: data});
      }
    });
  }
  Logout() {
    this.props.editChat({type: 'EDIT_CHAT', payload: false});
    setTimeout(() => {
      this.setPushNotification(this.props.user.ID, () => {
        AsyncStorage.setItem('user', '', () => {
          this.props.ReduxLogout();
          this.props.navigation.dispatch(this.props.navigation.replace('App'));
        });
      });
    }, 200);
  }

  setPushNotification(ID, callback) {
    const _this = this;
    KS.SetUserToken({
      userid: ID,
      token: '',
      langId: Languages.langID,
    });
    if (callback) {
      callback();
    }
  }
  selectCountry(country) {
    this.props.setViewingCountry(country);

    this.setState({cca2: country.cca2, currency: country.currency});
    AsyncStorage.multiSet(
      [
        ['cca2', country.cca2],
        ['country', JSON.stringify(country)],
        ['countryName', country.name],
      ],
      () => {
        setTimeout(() => {
          RNRestart.Restart();
        }, 500);
      },
    );
  }

  share() {
    Share.share({
      message:
        Languages.DownloadAutobeeb +
        '\n \n' +
        `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`,
    });
  }
  render() {
    return (
      <View style={{flex: 1}}>
        <NewHeader navigation={this.props.navigation} back />
        {this.state.Currencies && (
          <PickerSelectModal
            ref={'PickerSelectModal'}
            data={this.state.Currencies}
            onSelectOption={data => {
              if (data) {
                //    alert(JSON.stringify(data));

                Alert.alert(
                  Languages.ConfirmLanguage,
                  Languages.SwitchCurrencyConfirm,
                  [
                    {
                      text: Languages.CancelLanguage,
                      onPress: () => undefined,
                    },
                    {
                      text: Languages.okLanguage,
                      onPress: async () => {
                        this.props.setViewingCurrency(data);
                        setTimeout(() => {
                          RNRestart.Restart();
                        }, 2000);
                      },
                    },
                  ],
                );
              }
            }}
            ModalStyle={{
              width: Dimensions.get('screen').width * 0.7,
            }}
            SelectedOptions={[this.props.ViewingCurrency]}></PickerSelectModal>
        )}
        <ScrollView style={[{backgroundColor: '#FFF'}]}>
          <View style={styles.inputWrap}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  'mailto:info@autobeeb.com?subject=Autobeeb: Customer Service ',
                );
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.text}>{Languages.contactus}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {
            <View style={styles.inputWrap}>
              <TouchableOpacity
                //hide
                onPress={() => {
                  this.props.navigation.navigate('PrivacyPolicy');
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.text}>{Languages.TermsAndCondition}</Text>
                </View>
              </TouchableOpacity>
            </View>
          }
          {
            <View style={styles.inputWrap}>
              <TouchableOpacity
                //hide
                onPress={() => {
                  this.props.navigation.navigate('PrivacyPolicy', {
                    isPrivacy: true,
                  });
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.text}>{Languages.PrivacyPolicy}</Text>
                </View>
              </TouchableOpacity>
            </View>
          }
          {this.state.cca2 && (
            <CountryPicker
              filterPlaceholder={Languages.Search}
              hideAlphabetFilter
              filterable
              autoFocusFilter={false}
              styles={{
                header: {
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: Color.secondary,
                },
              }}
              closeable
              transparent
              onChange={value => {
                this.selectCountry(value);
                this.setState({showCountryPicker: false});
              }}
              onSelect={value => {
                this.selectCountry(value);
                this.setState({showCountryPicker: false});
              }}
              cca2={this.state.cca2}
              translation={Languages.translation}>
              <View style={styles.inputWrap}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingEnd: 15,
                  }}>
                  <Text style={styles.text}>{Languages.Country}</Text>
                  <CountryPicker
                    filterPlaceholder={Languages.Search}
                    hideAlphabetFilter
                    filterable
                    autoFocusFilter={false}
                    styles={{
                      header: {
                        paddingVertical: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: Color.secondary,
                      },
                    }}
                    closeable
                    transparent
                    onChange={value => {
                      this.selectCountry(value);
                    }}
                    onSelect={value => {
                      this.selectCountry(value);
                    }}
                    cca2={this.state.cca2}
                    translation={Languages.translation}
                  />
                </View>
              </View>
            </CountryPicker>
          )}

          <View
            style={styles.inputWrap}
            //hide
          >
            <TouchableOpacity
              onPress={() => {
                if (this.refs.PickerSelectModal) {
                  this.refs.PickerSelectModal.open();
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',

                justifyContent: 'space-between',
                //      paddingVertical: 10,
              }}>
              <Text style={[styles.text]}>{Languages.Currency}</Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',

                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}>
                {this.props.ViewingCurrency && (
                  <Text style={{}}>{this.props.ViewingCurrency.Name}</Text>
                )}
                <Entypo
                  name="triangle-down"
                  size={15}
                  color={'#000'}
                  style={{marginHorizontal: 10}}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.text}>{Languages.AvailableLanguages}</Text>

            <LanguagePicker />
          </View>
          {this.props.user && (
            <View style={styles.inputWrap}>
              {this.state.loadSignout ? (
                <ActivityIndicator size="large" color={Color.primary} />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({loadSignout: true}, () => this.Logout());
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.text}>{Languages.Logout}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
          <Text
            style={{
              margin: 10,
              marginTop: 40,
              color: '#000',
            }}>
            {Languages.Version + ' ' + DeviceInfo.getVersion()}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputWrap: {
    borderColor: Color.blackDivide,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  text: {
    fontFamily: 'Cairo-Regular',
    textAlign: 'left',
    fontSize: 17,
    padding: 5,
    paddingHorizontal: 10,
    color: Color.primary,
  },
});

const mapStateToProps = ({listings, home, user, menu}) => {
  return {
    user: user.user,
    ViewingCountry: menu.ViewingCountry,
    ViewingCurrency: menu.ViewingCurrency,
  };
};

const mapDispatchToProps = dispatch => {
  const MenuRedux = require('../../redux/MenuRedux');
  const UserRedux = require('../../redux/UserRedux');

  return {
    setViewingCountry: (country, callback) =>
      MenuRedux.actions.setViewingCountry(dispatch, country, callback),

    setViewingCurrency: (currency, callback) =>
      MenuRedux.actions.setViewingCurrency(dispatch, currency, callback),

    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),

    editChat: data => dispatch(data),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Setting);
