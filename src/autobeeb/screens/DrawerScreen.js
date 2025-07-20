import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  AppHeader,
  DeaweHeader,
  GeneralOptions,
  UserOptions,
} from '../components';
import Layout from '../constants/Layout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {Languages} from '../../common';
import {actions} from '../../redux/HomeRedux';
import KS from '../../services/KSAPI';

const DrawerScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const [data, setData] = useState(null);
  const refreshScreen = () => {
    actions.HomeScreenGet(
      dispatch,
      Languages.langID,
      ViewingCountry?.cca2,
      5,
      ViewingCurrency.ID,
      data => {},
      user?.ID,
    );
  };

  useEffect(() => {
    // YAHHYA : Need APIs Enhancments
    KS.UserGet({
      userID: user.ID,
      langid: Languages.langID,
    }).then(res => {
      setData(res);
    });
  }, []);

  return (
    <View
      style={{
        backgroundColor: '#fff',
        flex: 1,
        paddingBottom: insets.bottom,
      }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader back={true} onCountryChange={refreshScreen} />
        <DeaweHeader data={data} />
        <UserOptions data={data} />
        <GeneralOptions />
        <View style={{height: 10}} />
      </ScrollView>
    </View>
  );
};

export {DrawerScreen};
