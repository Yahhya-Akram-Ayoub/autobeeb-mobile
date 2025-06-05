import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import ks from '../services/KSAPI';
import {Constants, Languages} from '../common';
import {PayOnce} from '../components';
import Color from '../common/Color';
import LogoSpinner from '../components/LogoSpinner';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const PaymentDetailsAutobeeb = ({route}) => {
  const [plan, setPlan] = useState(null);
  const [loader, setLoader] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();
  const {user, userCountry} = useSelector(state => state.user);
  const User = route.params?.user;
  const Currency = global.ViewingCurrency;

  useEffect(() => {
    if (user == null) {
      navigation.navigate('LoginScreen');
      return;
    }

    ks.GetCommissionPlan({
      CountryId: userCountry?.id,
      lang: Languages.langID,
      UserId: user?.ID,
    })
      .then(res => {
        setPlan(res.Plan);
      })
      .catch(err => {
        console.log({err});
      })
      .finally(() => {
        setLoader(false);
      });
  }, [0]);

  if (loader) {
    return <LogoSpinner fullStretch={true} />;
  }

  if (!plan) {
    return (
      <View style={styles.MainScreen}>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Color.primary,
            borderRadius: 5,
            width: '80%',
            alignSelf: 'center',
            marginTop: '80%',
            height: 50,
          }}
          onPress={() => {
            navigation.navigate('HomeScreen');
          }}>
          <Text style={{color: 'white', fontSize: 20}}>
            {Languages.HomeScreen}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.MainScreen}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          navigation.goBack();
        }}>
        <Text style={styles.closeText}>{Languages.Close}</Text>
      </TouchableOpacity>

      <View style={styles.TextView}>
        <Text style={styles.Title}>{Languages.ServiceFeeTitle}</Text>
        <Text style={styles.Description}>
          {Languages.FeeSANote.split('{0}')[0]}
          <Text style={styles.PriceText}>
            {Currency.Format.replace(
              '{0}',
              Math.ceil(Currency.Ratio * plan.Price).toFixed(0),
            )}
          </Text>
          {Languages.FeeSANote.split('{0}')[1]}
        </Text>
      </View>

      <PayOnce
        OpenModal={openModal}
        User={User}
        Offer={null}
        selectedPlan={plan}
        isModal={false}
        countryId={userCountry?.id}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  MainScreen: {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    paddingHorizontal: 20,
    paddingTop: 75,
    paddingBottom: 20,
  },
  Title: {
    textAlign: 'center',
    color: Color.primary,
    fontSize: 22,
    fontFamily: Constants.fontFamilyBold,
  },
  Description: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Constants.fontFamilyBold,
  },
  PriceText: {
    fontSize: 22,
    color: Color.primary,
    fontFamily: Constants.fontFamilyBold,
  },
  TextView: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    height: '22%',
    gap: 20,
  },
  closeText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Constants.fontFamily,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.select({
      ios: 40,
      android: 25,
    }),
    left: 15,
    zIndex: 150,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#000',
    borderRadius: 20,
  },
});

export default PaymentDetailsAutobeeb;
