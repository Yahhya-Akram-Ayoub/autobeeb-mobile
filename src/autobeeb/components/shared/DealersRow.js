import React, {useEffect, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Layout from '../../constants/Layout';
import {AppIcon, Icons} from './AppIcon';
import {Color, Constants, Languages} from '../../../common';
import KS from '../../../services/KSAPI';
import {useSelector} from 'react-redux';
import BlogsRowSkeleton from './BlogsRowSkeleton';
import DealersBanner from './DealersBanner';

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

  if (loading) return <BlogsRowSkeleton />;
  if (!loading && (!dealers || !dealers?.length)) return <></>;

  return (
    <View style={styles.rowContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goToDealersScreen}>
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

        <TouchableOpacity onPress={goToDealersScreen}>
          <Text style={styles.viewAll}>{Languages.ShowMore}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        data={dealers}
        renderItem={({item}) => <DealersBanner item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: Constants.fontFamilyBold,
    color: '#000',
  },
  viewAll: {
    fontSize: 12,
    fontFamily: Constants.fontFamilyBold,
    color: Color.secondary,
  },
  listContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
});

export default DealersRow;
