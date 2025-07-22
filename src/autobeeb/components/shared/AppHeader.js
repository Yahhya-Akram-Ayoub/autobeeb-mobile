import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  I18nManager,
  TextInput,
  StyleSheet,
  BackHandler,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Languages, Constants, Color} from '../../../common';
import {isIphoneX} from 'react-native-iphone-x-helper';
import CountryPicker from '../../../components/CountryModal/CountryPickerModal';
import {actions as MenuActions} from '../../../redux/MenuRedux';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Layout from '../../constants/Layout';
import {AppIcon, Icons} from '../index';

const AppHeader = ({
  back,
  isCustomSearchComponent,
  placeholder,
  onChangeText,
  searchValue,
  onSubmitEditing,
  query,
  onCountryChange,
  isFromDrawer,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const countryPickerRef = useRef(null);

  const handleCountryChange = value => {
    MenuActions.setViewingCountry(dispatch, value);
    if (onCountryChange) {
      onCountryChange(value);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else if (isFromDrawer) {
      navigation.navigate('DrawerStack');
      return true;
    } else {
      navigation.navigate('HomeScreen');
      return true;
    }
  };

  return (
    <View
      style={[
        styles.containerStyle,
        Platform.OS === 'ios' && isIphoneX() && {justifyContent: 'center'},
      ]}>
      <View style={[styles.innerContainer]}>
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (back) {
                handleBackPress();
              } else {
                // navigation.navigate('DrawerStack');
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'DrawerStack',
                        state: {routes: [{name: 'Drawer'}]},
                      },
                    ],
                  }),
                );
              }
            }}>
            {back ? (
              <AppIcon
                type={Icons.Ionicons}
                name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                size={25}
                color="black"
              />
            ) : (
              <AppIcon
                type={Icons.Entypo}
                name="menu"
                size={35}
                color="black"
              />
            )}
          </TouchableOpacity>
        </View>

        {isCustomSearchComponent ? (
          <View style={[styles.searchContainer]}>
            <AppIcon
              type={Icons.FontAwesome}
              name="search"
              size={18}
              style={styles.searchIcon}
              color={'rgba(0,0,0,0.7)'}
            />
            <TextInput
              style={[styles.searchInput]}
              placeholder={placeholder}
              maxLength={26}
              onChangeText={onChangeText}
              value={searchValue}
              onSubmitEditing={onSubmitEditing}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.touchableSearchBox}
            onPress={() => {
              navigation.navigate('HomeScreen', {
                screen: 'Search',
                params: query ? {query} : undefined,
              });
              navigation.navigate('Search');
            }}>
            <View style={[styles.queryBox]}>
              <AppIcon
                type={Icons.FontAwesome}
                name="search"
                size={18}
                style={styles.searchIcon}
                color={'rgba(0,0,0,0.7)'}
              />
              <Text style={styles.queryText}>
                {query || Languages.SearchByMakeOrModel}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.countryButton}
          onPress={() => countryPickerRef.current?.openModal()}>
          <View style={styles.countryPickerBox}>
            {ViewingCountry && (
              <CountryPicker
                filterPlaceholder={Languages.Search}
                hideAlphabetFilter
                ref={countryPickerRef}
                filterable
                AllCountries
                autoFocusFilter={false}
                styles={{
                  header: styles.countryPickerHeader,
                }}
                closeable
                transparent
                onChange={handleCountryChange}
                cca2={ViewingCountry.cca2}
                translation={Languages.translation}
                countryCode={ViewingCountry.cca2}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  containerStyle: {
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
    width: Layout.screenWidth,
    justifyContent: 'space-between',
    flex: 1,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 35,
    marginStart: 6,
    hitSlop: {top: 10, right: 10, bottom: 10, left: 10},
    flexDirection: 'row',
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
    width: Layout.screenWidth * 0.45,
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
    minWidth: Layout.screenWidth * 0.45,
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
