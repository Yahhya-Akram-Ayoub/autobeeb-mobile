import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  I18nManager,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {Languages, Constants, Styles, Color} from '../../common';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconFa from 'react-native-vector-icons/FontAwesome';
import CountryPicker from 'react-native-country-picker-modal';

class NewHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      cca2: 'JO',
      countryName: null,
      countryPickerShown: false,
    };
  }

  render() {
    return (
      <View
        style={[
          Styles.Common.newMenu,
          {
            elevation: this.props.noElevation ? 0 : 2,
            height: Constants.listingsHeaderHiegth,
            alignItems: 'flex-end',
            backgroundColor: this.props.blue && false ? '#1C7EA5' : '#fff',
          },
          Platform.OS == 'ios' &&
            isIphoneX() && {
              justifyContent: 'center',
            },
        ]}>
        <View
          style={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            backgroundColor: this.props.blue && false ? '#1C7EA5' : '#fff',
            alignItems: 'center',
            width: Dimensions.get('screen').width,
            justifyContent: 'space-between',
            flex: 1,
            height: 60,
            paddingHorizontal: I18nManager.isRTL ? 10 : 0,
          }}>
          <View style={{}}>
            {this.props.back ? (
              <TouchableOpacity
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                style={{
                  paddingLeft: 15,
                }}
                onPress={data => {
                  this.props.navigation.goBack();
                }}>
                <Ionicons name="arrow-back" size={25} color={'black'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                style={{
                  paddingLeft: 15,
                }}
                onPress={data => {
                  this.props.navigation.navigate('DrawerStack');
                }}>
                <Entypo name="menu" size={35} color={'black'} />
              </TouchableOpacity>
            )}
          </View>

          {this.props.CustomSearchComponent ? (
            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor:
                  this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)',
                height: 40,

                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconFa
                name="search"
                size={18}
                style={{marginRight: 5}}
                color={this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)'}
              />
              <TextInput
                style={{
                  color: 'gray',
                  height: 40,
                  fontSize: 16,
                  marginTop: 10,
                  width: Dimensions.get('screen').width * 0.45,
                  textAlign: 'left',
                  fontFamily: 'Cairo-Regular',
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                placeholder={this.props.placeholder}
                maxLength={26}
                onChangeText={this.props.onChangeText}
                value={this.props.searchValue}
                onSubmitEditing={this.props.onSubmitEditing}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                {
                  borderColor: Color.secondary,
                  borderRadius: 5,
                  paddingHorizontal: 3,
                  paddingVertical: 11,
                },
              ]}
              onPress={() => {
                if (this.props.query) {
                  this.props.navigation.navigate('Search', {
                    query: this.props.query,
                  });
                } else {
                  this.props.navigation.navigate('Search');
                }
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingVertical: 3,
                  borderBottomWidth: 1,
                  borderBottomColor:
                    this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)',
                  paddingHorizontal: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconFa
                  name="search"
                  size={18}
                  style={{marginRight: 5}}
                  color={this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)'}
                />
                <Text
                  style={{
                    color: this.props.blue && false ? '#fff' : 'gray',
                    fontSize: 17,
                    minWidth: Dimensions.get('screen').width * 0.45,
                    textAlign: 'left',
                    //     fontSize: 16
                  }}>
                  {this.props.query
                    ? this.props.query
                    : Languages.SearchByMakeOrModel}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              marginRight: 15,
              justifyContent: 'space-evenly',
            }}
            onPress={() => {
              this?.refs?.countryPicker?.openModal();
            }}>
            <View
              style={{
                marginBottom: 3,
              }}>
              {this.props.ViewingCountry && (
                <CountryPicker
                  filterPlaceholder={Languages.Search}
                  hideAlphabetFilter
                  ref="countryPicker"
                  filterable
                  AllCountries
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
                  onClose={() => {
                    this.setState({countryPickerShown: false});
                  }}
                  onChange={value => {
                    if (this.props.onCountryChange) {
                      this.setState(
                        {
                          cca2: value.cca2,
                          countryName: value.name,
                        },
                        () => {
                          this.props.setViewingCountry(value);
                          this.props.onCountryChange(value);
                        }
                      );
                    } else {
                      this.setState(
                        {
                          cca2: value.cca2,
                          countryName: value.name,
                        },
                        () => {
                          this.props.setViewingCountry(value);
                        }
                      );
                    }
                  }}
                  cca2={this.props.ViewingCountry.cca2}
                  translation={Languages.translation}
                  countryCode={this.props.ViewingCountry.cca2}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({menu}) => ({
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../../redux/MenuRedux');

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),

    //  fetchListings: (parentid) => Listingredux.actions.fetchListings(dispatch, parentid, 1)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewHeader);
