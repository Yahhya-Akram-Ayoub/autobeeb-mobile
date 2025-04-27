import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import ks from '../services/KSAPI';
import {Languages} from '../common';
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
  const _user = useSelector(state => state.user.user);
  const userCountry = route.params?.userCountry;
  const User = route.params?.user;
  const Currency = global.ViewingCurrency;

  useEffect(() => {
    if (_user == null) {
      navigation.navigate('LoginScreen');
      return;
    }

    ks.GetCommissionPlan({
      CountryId: userCountry?.ID,
      lang: Languages.langID,
      UserId: _user?.ID,
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
    <View style={styles.MainScreen}>
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
        countryId={userCountry?.ID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  MainScreen: {
    backgroundColor: '#ffffff',
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  Title: {
    textAlign: 'center',
    fontWeight: 700,
    color: Color.primary,
    fontSize: 24,
  },
  Description: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 20,
  },
  PriceText: {
    fontSize: 22,
    fontWeight: 700,
    color: Color.primary,
  },
  TextView: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    height: '22%',
    gap: 20,
  },
});

export default PaymentDetailsAutobeeb;
