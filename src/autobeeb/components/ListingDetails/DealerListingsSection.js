import {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {screenWidth} from '../../constants/Layout';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {arrayOfNull} from '../shared/StaticData';

const DealerListingsSection = ({dealerId}) => {
  const navigation = useNavigation();
  const [relatedListings, setRelatedListings] = useState([]);
  const [failOverImagetedListings, setFailOverImage] = useState(arrayOfNull(9));

  useEffect(() => {
    if (dealerId) {
      KS.UserListings({
        langid: Languages.langID,
        offerStatus: 16,
        page: 1,
        pagesize: 9,
        userid: dealerId,
      }).then(data => {
        console.log({Listings: data.Listings});
        setRelatedListings(data.Listings);
      });
    }
  }, [dealerId]);

  if (relatedListings.length === 0) return <View />;

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() =>
          navigation.push('CarDetails', {
            id: item.ID,
          })
        }
        style={styles.itemWrapper}>
        <View>
          <FastImage
            style={styles.image}
            resizeMode="contain"
            source={
              failOverImagetedListings[index]
                ? require('../../../images/Oldplaceholder.png')
                : {
                    uri: `https://autobeeb.com/${item.FullImagePath}_400x400.jpg`,
                  }
            }
            onError={() => {
              setFailOverImage(prev => {
                const updated = [...prev]; //
                updated[index] = true;
                return updated;
              });
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.blackHeader}>{Languages.DealerOffers}</Text>

      <View style={styles.listContainer}>
        <FlatList
          numColumns={3}
          data={relatedListings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    padding: 12,
    justifyContent: 'space-around',
    borderRadius: 10,
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
  listContainer: {
    paddingTop: 6,
  },
  itemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '32%',
    marginBottom: 4,
    marginHorizontal: 2,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Color.blackTextSecondary,
  },
  image: {
    aspectRatio: 1,
    width: '100%',
  },
  priceTag: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
  },
  priceText: {
    color: '#fff',
    paddingHorizontal: 5,
  },
});

export default DealerListingsSection;
