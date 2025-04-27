//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import Languages from '../common/Languages';
import Color from '../common/Color';
import KS from '../services/KSAPI';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// create a component
class MyClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailBasedCountry: false,
    };
  }
  componentDidMount() {
    //if user isnt logged in check if country is email based or phone based
    if (!this.props.userData) {
      AsyncStorage.getItem('cca2', (error, data) => {
        if (data) {
          KS.CountriesGet({langid: Languages.langID}).then(CountriesData => {
            if (CountriesData && CountriesData.Success == '1') {
              this.setState({CountriesData: CountriesData.Countries}, () => {
                let selectedCountry =
                  this.state.CountriesData &&
                  this.state.CountriesData.find(
                    x => x.ISOCode.toLowerCase() == data.toLowerCase(),
                  )
                    ? this.state.CountriesData.find(
                        x => x.ISOCode.toLowerCase() == data.toLowerCase(),
                      )
                    : null;
                this.setState({
                  emailBasedCountry: selectedCountry.EmailRegister,
                });
              });
            }
          });
        }
      });
    }
  }

  render() {
    return (
      <TouchableOpacity
        style={[
          {
            position: 'absolute',
            zIndex: 10,
            elevation: 2,
            backgroundColor: Color.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0,
            width: 95,
            height: 95,
            borderRadius: 50,
            overflow: 'hidden',
            bottom: 5,
            right: 5,
          },
        ]}
        onPress={() => {
          if (this.state.emailBasedCountry) {
            this.props.navigation.navigate('LoginScreen', {
              skippable: true,
            });
          } else {
            this.props.navigation.navigate('PostOfferScreen');
          }
        }}>
        <Text
          style={[
            {
              backgroundColor: Color.secondary,
              position: 'absolute',
              top: 12,
              fontSize: 12,
              color: '#fff',
              zIndex: 11,
              width: 100,
              textAlign: 'center',
              fontFamily: 'Cairo-Bold',
              transform: [{rotate: '-45deg'}],
            },
            I18nManager.isRTL
              ? {
                  right: -25,
                }
              : {
                  left: -25,
                },
          ]}>
          {Languages.Free}
        </Text>
        <Image
          style={{width: 37, height: 37}}
          resizeMode="contain"
          source={require('../images/postOfferIcon.png')}
        />
        <Text
          numberOfLines={1}
          style={{color: '#fff', fontSize: 14, fontFamily: 'Cairo-Bold'}}>
          {Languages.PostOfferButton}
        </Text>
      </TouchableOpacity>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app

const mapStateToProps = ({home, user, menu}) => {
  return {
    userData: user.user,
  };
};

export default connect(mapStateToProps)(MyClass);
