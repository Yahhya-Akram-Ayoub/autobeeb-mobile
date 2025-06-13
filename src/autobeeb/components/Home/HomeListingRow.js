import {useNavigation} from '@react-navigation/native';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {screenWidth} from '../../constants/Layout';
import {Color, Constants, Languages} from '../../../common';
import {useEffect, useState} from 'react';
import KS from '../../../services/KSAPI';
import {useSelector} from 'react-redux';

const HomeListingRow = () => {
  const [lastListings, setLastListings] = useState([]);
  const navigation = useNavigation();
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const moveToDeatails = item =>
    navigation.replace('CarDetails', {id: item.id});

  useEffect(() => {
    KS.FreeSearchCore({
      pPageSize: 9,
      pPageNum: 1,
      pLangID: Languages.langID,
      // pCountryID :
    }).then(res => {
      setLastListings(res.listings);
    });
  }, []);

  const renderRecentSeenItem = ({item}) => {
      const {imageBasePath, thumbURL} = item;

    return (
      <TouchableOpacity
        style={styles.listingItem}
        onPress={() => {
          moveToDeatails(item);
        }}>
        <FastImage
          style={styles.listingImage}
          source={
            thumbURL
              ? {
                  uri: `https://autobeeb.com/${imageBasePath}${thumbURL}_400x400.jpg`,
                }
              : require('../../../images/placeholder.png')
          }
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.cardContainer}>
        <Text style={styles.blackHeader}>{Languages.LatestNews}</Text>
        <FlatList
          keyExtractor={(item, index) =>
            item.ID?.toString() || index.toString()
          }
          contentContainerStyle={styles.recentSeenList}
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          data={lastListings}
          renderItem={renderRecentSeenItem}
        />
      </View>
      <View style={styles.cardContainer}>
        <Text style={styles.blackHeader}>{Languages.LatestNews}</Text>
        <FlatList
          keyExtractor={(item, index) =>
            item.ID?.toString() || index.toString()
          }
          contentContainerStyle={styles.recentSeenList}
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          data={lastListings}
          renderItem={renderRecentSeenItem}
        />
      </View>
      <View style={styles.cardContainer}>
        <Text style={styles.blackHeader}>{Languages.LatestNews}</Text>
        <FlatList
          keyExtractor={(item, index) =>
            item.ID?.toString() || index.toString()
          }
          contentContainerStyle={styles.recentSeenList}
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          data={lastListings}
          renderItem={renderRecentSeenItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listingItem: {
    width: (screenWidth - 30) / 3 - 8,
    height: (screenWidth - 30) / 3 - 8,
    borderWidth: 1,
    marginBottom: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  listingImage: {
    width: (screenWidth - 30) / 3 - 8,
    height: (screenWidth - 30) / 3 - 8,
  },
  recentSeenList: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: screenWidth - 30,
    paddingHorizontal: 4,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: Color.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 8,
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    width: screenWidth - 14,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'space-around',
  },
  blackHeader: {
    paddingHorizontal: 10,
    width: '100%',
    paddingTop: 4,
    paddingBottom: 3,
    color: '#000',
    fontSize: 18,
    marginBottom: 5,
    fontFamily: Constants.fontFamilyBold,
  },
});

export default HomeListingRow;
