import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  AppHeader,
  DeaweHeader,
  GeneralOptions,
  UserOptions,
} from '../components';
import Layout from '../constants/Layout';

const DrawerScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <DeaweHeader />
        <UserOptions />
        <GeneralOptions />
        <View style={{height: 190}} />
      </ScrollView>
    </View>
  );
};

export {DrawerScreen};

const styles = StyleSheet.create({
  container: {
    minWidth: Layout.screenWidth,
    minHeight: Layout.screenHeight,
    backgroundColor: '#fff',
  },
});
