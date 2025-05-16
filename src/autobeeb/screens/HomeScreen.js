import {ScrollView, View} from 'react-native';
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

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        minWidth: Layout.screenWidth,
        flex: 1,
        paddingBottom: insets.bottom + 10,
      }}>
      <AppHeader />
      <ScrollView>
        <HomeBanner />
        <HomeTabs />
        <AddOfferBtn />
        <BlogsRow />
        <DealersRow />
      </ScrollView>
    </View>
  );
};

export {HomeScreen};
