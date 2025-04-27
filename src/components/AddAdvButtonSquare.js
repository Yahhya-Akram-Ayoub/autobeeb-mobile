//import liraries
import React, {useRef, useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  I18nManager,
} from 'react-native';
import Languages from '../common/Languages';
import Color from '../common/Color';
import KS from '../services/KSAPI';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');
// create a component
const AddAdvButtonSquare = ({_user}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const [emailBasedCountry, setEmailBasedCountry] = useState(null);

  useEffect(() => {
    if (!_user) {
      AsyncStorage.getItem('cca2', (error, data) => {
        if (data) {
          KS.CountriesGet({langid: Languages.langID}).then(CountriesData => {
            if (CountriesData && CountriesData.Success == '1') {
              const CountriesData = CountriesData.Countries;

              let selectedCountry = !!CountriesData?.some(
                x => x.ISOCode.toLowerCase() == data.toLowerCase()
              )
                ? CountriesData.find(
                    x => x.ISOCode.toLowerCase() == data.toLowerCase()
                  )
                : null;
              setEmailBasedCountry(selectedCountry.EmailRegister);
            }
          });
        }
      });
    }

    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, []);

  const navigateToScreen = useCallback(() => {
    if (emailBasedCountry) {
      navigation.navigate('LoginScreen', {
        skippable: true,
      });
    } else {
      navigation.navigate('PostOfferScreen');
    }
  }, [emailBasedCountry, _user]);

  return (
    <TouchableOpacity style={styles.MainContainer} onPress={navigateToScreen}>
      <Image
        style={styles.Image}
        resizeMode="contain"
        source={require('../images/postOfferIcon.png')}
      />
      <Text numberOfLines={1} style={styles.TextAddOffer}>
        {Languages.PostOfferButton}
      </Text>
      <Animated.Text style={[styles.TextFree, {opacity: fadeAnim}]}>
        {' ' + Languages.Free}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  MainContainer: {
    position: 'absolute',
    zIndex: 10,
    elevation: 2,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    borderWidth: 0,
    width: width / 2.0,
    height: 40,
    borderRadius: 50,
    overflow: 'hidden',
    bottom: 5,
    right: width / 4,
    paddingEnd: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  TextFree: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
  },
  TextAddOffer: {color: '#fff', fontSize: 14, fontFamily: 'Cairo-Bold'},
  Image: {width: 28, height: 28, marginEnd: 10},
});

const MemoizedAddAdvButtonSquare = React.memo(AddAdvButtonSquare);
const AddAdvButtonSquareWrapper = () => {
  const _user = useSelector(state => state.user.user);
  return <MemoizedAddAdvButtonSquare _user={_user} />;
};
export default AddAdvButtonSquareWrapper;
