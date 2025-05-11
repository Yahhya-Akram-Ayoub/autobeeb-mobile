import {ScrollView, View} from 'react-native';
import {AddOfferBtn, AppHeader, HomeBanner, HomeTabs} from '../components';
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
      </ScrollView>
    </View>
  );
};

export {HomeScreen};
