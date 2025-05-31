import {useRef, memo, useEffect} from 'react';
import {Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {screenWidth} from '../../constants/Layout';
import FastImage from 'react-native-fast-image';
import {Color, Languages} from '../../../common';
import KS from '../../../services/KSAPI';

const AddAdvButtonSquare = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);

  useEffect(() => {
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
      ]),
    );

    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, []);

  const handlePress = () => {
    if (!user) {
      checkCountry();
    } else {
      navigation.navigate('PostOfferScreen');
    }
  };

  const checkCountry = () => {
    if (!user) {
      const cca2 = ViewingCountry?.cca2;
      KS.GetCountryCore({LangId: Languages.langID, Iso: cca2}).then(
        ({country}) => {
          if (country.emailRegister) {
            navigation.navigate('LoginScreen', {skippable: true});
          } else {
            navigation.navigate('PostOfferScreen');
          }
        },
      );
    }
  };

  return (
    <TouchableOpacity style={styles.MainContainer} onPress={handlePress}>
      <FastImage
        style={styles.Image}
        resizeMode="contain"
        source={require('../../../images/postOfferIcon.png')}
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
    flexDirection: 'row',
    borderWidth: 0,
    width: screenWidth / 2.0,
    height: 40,
    borderRadius: 50,
    overflow: 'hidden',
    bottom: 5,
    right: screenWidth / 4,
    paddingEnd: 10,
    paddingStart: 10,
  },
  TextAddOffer: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
  TextFree: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
  },
  Image: {
    width: 28,
    height: 28,
    marginHorizontal: 8,
  },
});

export default memo(AddAdvButtonSquare);
