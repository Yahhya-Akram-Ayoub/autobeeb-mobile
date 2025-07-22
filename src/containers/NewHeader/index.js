import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  I18nManager,
  TextInput,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import {Languages, Constants, Color} from '../../common';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconFa from 'react-native-vector-icons/FontAwesome';
import CountryPicker from '../../components/CountryModal/CountryPickerModal';

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
  handleBackPress = () => {
    const {navigation} = this.props;

    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else if (this.props.isFromDrawer) {
      navigation.navigate('DrawerStack');
      return true;
    } else {
      navigation.navigate('HomeScreen');
      return true;
    }
  };
  render() {
    return (
      <View
        style={[
          styles.container,
          this.props.noElevation && {elevation: 0},
          Platform.OS === 'ios' && isIphoneX() && {justifyContent: 'center'},
        ]}>
        <View style={styles.innerContainer}>
          <View style={styles.backButton}>
            {this.props.back ? (
              <TouchableOpacity
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                onPress={() => this.handleBackPress()}>
                <Ionicons
                  name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={25}
                  color={'black'}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                onPress={() => this.props.navigation.navigate('DrawerStack')}>
                <Entypo name="menu" size={35} color={'black'} />
              </TouchableOpacity>
            )}
          </View>

          {this.props.CustomSearchComponent ? (
            <View style={styles.searchContainer}>
              <IconFa
                name="search"
                size={18}
                style={styles.searchIcon}
                color={'rgba(0,0,0,0.7)'}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={this.props.placeholder}
                maxLength={26}
                onChangeText={this.props.onChangeText}
                value={this.props.searchValue}
                onSubmitEditing={this.props.onSubmitEditing}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.touchableSearchBox}
              onPress={() => {
                if (this.props.isHomeStack) {
                  this.props.navigation.navigate('Search', {
                    query: this.props.query,
                  });
                } else {
                  this.props.navigation.navigate('HomeScreen', {
                    screen: 'Search',
                    params: {
                      query: this.props.query,
                    },
                  });
                }
              }}>
              <View style={styles.queryBox}>
                <IconFa
                  name="search"
                  size={18}
                  style={styles.searchIcon}
                  color={'rgba(0,0,0,0.7)'}
                />
                <Text style={styles.queryText}>
                  {this.props.query || Languages.SearchByMakeOrModel}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.countryButton}
            onPress={() => {
              this.countryPicker?.openModal();
            }}>
            <View style={styles.countryPickerBox}>
              {this.props.ViewingCountry && (
                <CountryPicker
                  filterPlaceholder={Languages.Search}
                  hideAlphabetFilter
                  ref={ref => (this.countryPicker = ref)}
                  filterable
                  AllCountries
                  autoFocusFilter={false}
                  styles={{
                    header: styles.countryPickerHeader,
                  }}
                  closeable
                  transparent
                  onClose={() => {
                    this.setState({countryPickerShown: false});
                  }}
                  onChange={value => {
                    this.setState(
                      {
                        cca2: value.cca2,
                        countryName: value.name,
                      },
                      () => {
                        this.props.setViewingCountry(value);
                        if (this.props.onCountryChange) {
                          this.props.onCountryChange(value);
                        }
                      },
                    );
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

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderBottomWidth: 1,
    elevation: 2,
    height: Constants.listingsHeaderHiegth,
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  innerContainer: {
    alignItems: 'center',
    width: Dimensions.get('screen').width,
    justifyContent: 'space-between',
    flex: 1,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    width: 35,
    marginStart: 6,
  },
  searchContainer: {
    borderBottomColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 40,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    color: 'gray',
    height: 40,
    fontSize: 16,
    marginTop: 10,
    width: Dimensions.get('screen').width * 0.45,
    fontFamily: 'Cairo-Regular',
  },
  touchableSearchBox: {
    borderColor: Color.secondary,
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 11,
  },
  queryBox: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'rgba(0,0,0,0.7)',
  },
  queryText: {
    color: 'gray',
    fontSize: 17,
    minWidth: Dimensions.get('screen').width * 0.45,
    textAlign: 'left',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginRight: 15,
    justifyContent: 'space-evenly',
  },
  countryPickerBox: {
    marginBottom: 3,
  },
  countryPickerHeader: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Color.secondary,
  },
});

const mapStateToProps = ({menu}) => ({
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../../redux/MenuRedux');
  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewHeader);
