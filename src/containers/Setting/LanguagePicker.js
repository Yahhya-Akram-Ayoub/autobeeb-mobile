import React, {Component} from 'react';
import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  ScrollView,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import RNRestart from 'react-native-restart';
import Icon from 'react-native-vector-icons/Ionicons';
import {Icons, Color, Languages} from '../../common';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LanguagePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: Languages.getLanguage(),
      isLoading: false,
      rtl: I18nManager.isRTL,
    };
  }
  renderName(lang) {
    switch (lang) {
      case 'ar':
        return 'العربية';
      case 'en':
        return 'English';

      case 'de':
        return 'Deutsche';
      case 'es':
        return 'Español';
      case 'tr':
        return 'Türkçe';
      case 'fr':
        return 'français';
      case 'pl':
        return 'Polskie';
      case 'zh':
        return '中文';

      default:
        return lang;
    }
  }
  render() {
    const onPress = () => {
      Alert.alert(Languages.ConfirmLanguage, Languages.SwitchLanguageConfirm, [
        {text: Languages.CancelLanguage, onPress: () => undefined},
        {
          text: Languages.okLanguage,
          onPress: async () => {
            const newlang = this.state.selectedOption;

            I18nManager.forceRTL(newlang === 'ar');
            //this.stopAndToast(newlang);
            AsyncStorage.setItem('language', newlang, () => {
              RNRestart.Restart();
            });
          },
        },
      ]);
      return true;
    };
    const renderOption = ({item, index}) => {
      // if (option !== "en")
      let selected = item == Languages.getLanguage();
      return (
        <TouchableOpacity
          disabled={this.state.selectedOption === item}
          onPress={data => {
            Alert.alert('', Languages.SwitchLanguageConfirm, [
              {text: Languages.CancelLanguage, onPress: () => undefined},
              {
                text: Languages.okLanguage,
                onPress: async () => {
                  AsyncStorage.getItem('language', (err, result) => {
                    //this.stopAndToast(JSON.parse(result));
                    var lang = 'en';
                    if (result !== null) lang = result;
                    let newlang = item;

                    I18nManager.forceRTL(newlang == 'ar' || newlang == 'kr');
                    //this.stopAndToast(newlang);
                    AsyncStorage.setItem('language', newlang, () => {
                      RNRestart.Restart();
                    });
                  });
                },
              },
            ]);
            return true;
          }}
          key={index}
          style={{
            backgroundColor: '#f2f2f2',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 5,
            justifyContent: 'center',
            minWidth: 150,
            marginVertical: 5,
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 150,
              height: 30,
              backgroundColor: selected ? Color.primary : Color.Background,
              borderColor: Color.primary,
              borderWidth: 1,
              borderRadius: 3,
            }}>
            <Text
              style={
                selected
                  ? {
                      fontFamily: 'Cairo-Regular',
                      color: 'white',
                      marginLeft: 0,
                    }
                  : {
                      fontFamily: 'Cairo-Regular',
                      marginLeft: 0,
                      color: '#000',
                    }
              }>
              {this.renderName(item)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={{alignItems: 'center'}}>
        <View
          style={{
            backgroundColor: '#fff',
            width: Dimensions.get('window').width,
            //height: Dimensions.get("window").height * 0.5,
            justifyContent: 'center',
            //  padding: 15
          }}>
          <FlatList
            style={{}}
            numColumns={2}
            contentContainerStyle={{
              alignItems: 'center',
            }}
            data={Languages.getAvailableLanguages()}
            renderItem={renderOption}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  language: state.language,
});

module.exports = connect(mapStateToProps, undefined, undefined)(LanguagePicker);
