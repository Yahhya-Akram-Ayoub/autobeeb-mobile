import {RefreshControl, ScrollView, View} from 'react-native';
import {
  AddOfferBtn,
  AppHeader,
  BlogsRow,
  DealersRow,
  HomeBanner,
  HomeTabs,
} from '../components';
import Layout from '../constants/Layout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {actions} from '../../redux/HomeRedux';
import {Languages} from '../../common';
import {useDispatch, useSelector} from 'react-redux';
import {useState} from 'react';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const [refreshing, setRefreshing] = useState(false);

  const refreshScreen = () => {
    setRefreshing(true);
    actions.HomeScreenGet(
      dispatch,
      Languages.langID,
      ViewingCountry?.cca2,
      5,
      ViewingCurrency.ID,
      data => {
        setRefreshing(false);
      },
      user?.ID,
    );
  };

  return (
    <View
      style={{
        minWidth: Layout.screenWidth,
        flex: 1,
        paddingBottom: insets.bottom,
      }}>
      <AppHeader onCountryChange={refreshScreen} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
        }>
        <HomeBanner />
        <HomeTabs />
        <AddOfferBtn />
        <BlogsRow />
        <DealersRow />
        <View style={{height: 10}} />
      </ScrollView>
    </View>
  );
};

export {HomeScreen};
