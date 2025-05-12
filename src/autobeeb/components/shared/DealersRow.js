import React, {useEffect, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Layout from '../../constants/Layout';
import {AppIcon, Icons} from './AppIcon';
import {Color, Constants, Languages} from '../../../common';
import {DealersBanner} from '../../../components';
import KS from '../../../services/KSAPI';
import {useSelector} from 'react-redux';

const DealersRow = () => {
  const navigation = useNavigation();
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LoadData();
  }, []);

  const goToDealersScreen = () => {
    navigation.navigate('DealersScreen');
  };

  const LoadData = () => {
    KS.DealersGet({
      langid: Languages.langID,
      page: 1,
      pagesize: 10,
      isocode: ViewingCountry.cca2,
    })
      .then(data => {
        if (data && data.Success) {
          setDealers([...data.Dealers]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.rowContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPressIn={goToDealersScreen}>
          <View style={styles.titleRow}>
            <AppIcon
              type={Icons.FontAwesome}
              name="users"
              size={26}
              color={Color.secondary}
              style={styles.icon}
            />
            <Text style={styles.title}>{Languages.Dealers}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPressIn={goToDealersScreen}>
          <Text style={styles.viewAll}>{Languages.ViewAll}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        data={dealers}
        renderItem={({item}) => (
          <DealersBanner item={item} navigation={navigation} homeScreen />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    minHeight: 'auto',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    width: Layout.screenWidth,
    paddingTop: 10,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  title: {
    textAlign: 'center',
    fontSize: Constants.mediumFont,
    color: '#000',
  },
  viewAll: {
    fontFamily: Constants.fontFamily,
    color: Color.secondary,
  },
  listContent: {
  },
});

export default DealersRow;
