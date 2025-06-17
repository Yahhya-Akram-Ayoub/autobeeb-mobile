/**
 * Created by Kensoftware on 23/02/2017.
 */

import React, {Component} from 'react';
import {
  Image,
  StyleSheet,
  Platform,
  View,
  Dimensions,
  Linking,
} from 'react-native';
import {connect} from 'react-redux';
import {
  Styles,
  Languages,
  Constants,
  ExtractScreenObjFromUrl,
} from '../../common';
import {Timer} from '../../Omni';
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';
import BootSplash from 'react-native-bootsplash';
import KS from '../../services/KSAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const minDisplayTime = 100;

class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      finishedLoadingHomescreen: false,
    };

    this.prepareData = this.prepareData.bind(this);
  }

  componentDidMount() {
    AsyncStorage.getItem('@chatIconDot').then(res => {
      if (res && res === 'true') {
        this.props.editChat({type: 'EDIT_CHAT', payload: true});
      } else if (res && res === 'false') {
        this.props.editChat({type: 'EDIT_CHAT', payload: false});
      } else {
        this.props.editChat({type: 'EDIT_CHAT', payload: false});
      }
    });

    setTimeout(() => {
      if (this.props.ViewingCurrency) {
        global.ViewingCurrency = this.props.ViewingCurrency;
      }
    }, 500);
    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        KS.CurrencyGetByISOCode({
          langid: Languages.langID,
          isoCode: data,
        }).then(curr => {
          global.ViewingCurrency = curr.currency;
          this.props.setViewingCurrency(curr.currency);
          AsyncStorage.getItem('user', (error, result) => {
            const user = JSON.parse(result);
            this.props.HomeScreenGet(
              user?.ID,
              Languages.langID,
              data,
              5,
              curr.currency?.ID,
              () => {
                this.setState({finishedLoadingHomescreen: true});
                Timer.setTimeout(this.prepareData, minDisplayTime);
              },
            );
          });
        });
      } else {
        this.setState({finishedLoadingHomescreen: true});

        Timer.setTimeout(this.prepareData, minDisplayTime);
      }
    });

    setTimeout(() => {
      if (!this.state.finishedLoadingHomescreen) {
        this.prepareData(); //incase something wrong happened with asyncstorage
      }
    }, 15000);

    if (Platform.OS == 'android') {
      BootSplash.hide({fade: true});
    }
  }

  render() {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}>
        <LottieView
          source={require('./AutobeebFast.json')}
          autoPlay
          style={{width: '80%', height: '80%'}}
        />
      </View>
    );
  }

  /**
   * All necessary task like: pre-load data from server, checking local resource, configure settings,...
   * Should be done in this function and redirect to other screen when complete.
   */
  prepareData = async () => {
    //noinspection Eslint
    const {user, netInfo, navigation} = this.props;
    const SkipLanguage = await AsyncStorage.getItem('SkipLanguage');
    const country = await AsyncStorage.getItem('country');
    this.props.setViewingCountry(JSON.parse(country));
    if (JSON.parse(SkipLanguage) === true) {
      AsyncStorage.getItem('user', (error, result2) => {
        const user = JSON.parse(result2);
        const {login} = this.props;
        if (result2 !== null) {
          login(user);
          this.props.navigation.replace('App');
        } else {
          AsyncStorage.getItem('introScene', (err, result) => {
            if (result == '1') {
              this.props.navigation.replace('App');
            } else {
              this.props.navigation.replace('App');
            }
          });
        }
      });
    } else {
      navigation.navigate('LanguageSelector');
    }
  };
}

SplashScreen.navigationOptions = {
  header: null,
};

SplashScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  netInfo: PropTypes.object,
};

const mapStateToProps = ({netInfo, user, menu}) => ({
  netInfo,
  user,
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
});

import {actions as useractions} from '../../redux/UserRedux';
import {actions as MenuActions} from '../../redux/MenuRedux';
import {actions as HomeRedux} from '../../redux/HomeRedux';

const mapDispatchToProps = dispatch => {
  return {
    login: user => useractions.login(dispatch, user),
    setViewingCountry: (country, callback) =>
      MenuActions.setViewingCountry(dispatch, country, callback),
    setViewingCurrency: (currency, callback) =>
      MenuActions.setViewingCurrency(dispatch, currency, callback),
    HomeScreenGet: (userId, langId, isoCode, listingsCount, cur, callback) =>
      HomeRedux.HomeScreenGet(
        dispatch,
        langId,
        isoCode,
        listingsCount,
        cur,
        callback,
        userId,
      ),
    editChat: data => dispatch(data),
    setAllowFeature: flag => dispatch(MenuActions.setAllowFeature(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);
