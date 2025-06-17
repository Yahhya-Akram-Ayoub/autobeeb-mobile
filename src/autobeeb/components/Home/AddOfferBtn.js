import React, {useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity, View, Animated, StyleSheet} from 'react-native';
import Layout, {screenWidth} from '../../constants/Layout';
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
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.pendingContainer}
          onPress={() => {
            navigation.navigate('SubscriptionsScreen', {
              ISOCode: user?.ISOCode,
              User: user,
              Plans: [],
            });
          }}>
          <View style={styles.innerRow}>
            <Text style={styles.pendingText}>
              {Languages.AccountIsPaymentPending}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={navigateToScreen}>
        <View style={styles.innerRow}>
          <AppIcon
            type={Icons.FontAwesome}
            name="plus"
            size={20}
            color="white"
            style={{marginRight: 8}}
          />
          <Text style={styles.offerText}>{Languages.PostYourOffer}</Text>
          <Animated.Text style={[styles.freeText, {opacity: fadeAnim}]}>
            {' '}
            {' ' + Languages.FREE}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AddOfferBtn;

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: Color.secondary,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    width: screenWidth - 14,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Color.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingContainer: {
    backgroundColor: 'red',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
  },
  freeText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
  },
  pendingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
});
