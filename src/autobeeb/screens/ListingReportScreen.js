import {ScrollView, View} from 'react-native';
import {AppHeader, ReportListingForm, useKeyboard} from '../components';
import {screenWidth} from '../constants/Layout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Languages} from '../../common';
import {useDispatch, useSelector} from 'react-redux';
import {actions} from '../../redux/HomeRedux';
import {useRoute} from '@react-navigation/native';
import {BottomNavigationBar} from '../../components';

const ListingReportScreen = () => {
  const dispatch = useDispatch();
  const isKeyboardVisible = useKeyboard();
  const route = useRoute();
  const listingId = route.params?.listingId;
  const user = useSelector(state => state.user.user);
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const insets = useSafeAreaInsets();

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

  return (
    <View
      style={{
        minWidth: screenWidth,
        flex: 1,
        paddingBottom: insets.bottom,
      }}>
      <AppHeader back={true} onCountryChange={refreshScreen} />
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
        <ReportListingForm listingId={listingId} />
      </ScrollView>
      {!isKeyboardVisible && <BottomNavigationBar />}
    </View>
  );
};

export {ListingReportScreen};
