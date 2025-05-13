import {ScrollView, Text, View} from 'react-native';
import {AppHeader, GeneralOptions} from '../components';
import Layout from '../constants/Layout';

const DrawerScreen = () => {
  return (
    <View
      style={{
        minWidth: Layout.screenWidth,
        minHeight: Layout.screenHeight,
      }}>
      <AppHeader />
      <ScrollView>
        <GeneralOptions />
        <View style={{height: 190}} />
      </ScrollView>
    </View>
  );
};

export {DrawerScreen};
