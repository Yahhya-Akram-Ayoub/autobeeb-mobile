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

const HomeScreen = () => {
  return (
    <View
      style={{
        minWidth: Layout.screenWidth,
        minHeight: Layout.screenHeight,
      }}>
      <AppHeader />
      <ScrollView>
        <HomeBanner />
        <HomeTabs />
        <AddOfferBtn />
        <BlogsRow />
        <DealersRow />
        <View style={{height: 200}} />
      </ScrollView>
    </View>
  );
};

export {HomeScreen};
