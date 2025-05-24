import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  AppHeader,
  DeaweHeader,
  GeneralOptions,
  UserOptions,
} from '../components';
import Layout from '../constants/Layout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const DrawerScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: '#fff',
        flex: 1,
        paddingBottom: insets.bottom,
      }}>
      <ScrollView>
        <DeaweHeader />
        <UserOptions />
        <GeneralOptions />
        <View style={{height: 10}} />
      </ScrollView>
    </View>
  );
};

export {DrawerScreen};
