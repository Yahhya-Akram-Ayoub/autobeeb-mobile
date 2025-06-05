import React, {useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity, View, Animated, StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';
import {useNavigation} from '@react-navigation/native';
import {Color, Languages} from '../../../common';
import {AppIcon, Icons} from '../index';
import {useSelector} from 'react-redux';
import KS from '../../../services/KSAPI';

const AddOfferBtn = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [paymentPending, setPaymentPending] = useState(false);
  const [isEmailRegistry, setIsEmailRegistry] = useState(false);

  const checkCountry = () => {
    if (!user) {
      const cca2 = ViewingCountry?.cca2;
      KS.GetCountryCore({LangId: Languages.langID, Iso: cca2}).then(
        ({country}) => {
          setIsEmailRegistry(country.emailRegister);
        },
      );
    }
  };

  useEffect(() => {
    checkCountry();

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
  }, [fadeAnim]);

  const navigateToScreen = () => {
    if (isEmailRegistry && !user) {
      navigation.navigate('LoginScreen', {skippable: true});
    } else {
      navigation.navigate('PostOfferScreen');
    }
  };

  if (paymentPending) {
    return (
      <TouchableOpacity
        style={styles.pendingContainer}
        onPress={() => {
          navigation.navigate('SubscriptionsScreen', {
            ISOCode: user?.ISOCode,
            User: user,
            Plans: [], // Placeholder for plans if needed
          });
        }}>
        <View style={styles.innerRow}>
          <Text style={styles.pendingText}>
            {Languages.AccountIsPaymentPending}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={navigateToScreen}>
      <View style={styles.innerRow}>
        <AppIcon
          type={Icons.FontAwesome}
          name="plus"
          size={25}
          color="white"
          style={{marginRight: 5}}
        />
        <Text style={styles.offerText}>{Languages.PostYourOffer}</Text>
        <Animated.Text style={[styles.freeText, {opacity: fadeAnim}]}>
          {' ' + Languages.FREE}
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddOfferBtn;

const styles = StyleSheet.create({
  container: {
    width: Layout.screenWidth * 0.96,
    marginVertical: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    elevation: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: Color.primary,
    minHeight: 60,
  },
  pendingContainer: {
    width: Layout.screenWidth * 0.96,
    marginVertical: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    elevation: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'red',
    minHeight: 60,
  },
  innerRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerText: {
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontFamily: 'Cairo-Regular',
    fontSize: 22,
  },
  freeText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Cairo-Regular',
  },
  pendingText: {
    color: '#fff',
    textAlign: 'center',
    padding: 5,
    fontFamily: 'Cairo-Regular',
    fontSize: 18,
    lineHeight: 28.5,
  },
});
