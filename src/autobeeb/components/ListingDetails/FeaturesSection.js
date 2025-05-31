import {View, Text, FlatList, StyleSheet} from 'react-native';
import {Color, Constants, Languages} from '../../../common';
import {useEffect, useState} from 'react';
import KS from '../../../services/KSAPI';
import FastImage from 'react-native-fast-image';
import {screenWidth} from '../../constants/Layout';

const FeaturesSection = ({listingId}) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (listingId) {
      setLoading(true);
      KS.GetFeaturesCore({LangId: Languages.langID, ItemId: listingId})
        .then(res => {
          setFeatures(
            res.features?.filter(x => x.type === 1 || x.type === 2) ?? [],
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [listingId]);

  if (loading) return <></>;
  if (features.length === 0) return <></>;

  return (
    <View style={[styles.cardContainer]}>
      <Text style={[styles.blackHeader]}>{Languages.Features}</Text>

      <FlatList
        keyExtractor={(item, index) => `feature1-${index}`}
        contentContainerStyle={styles.boxContainer}
        numColumns={2}
        data={features.filter(x => x.type === 1)}
        renderItem={renderFeatureItemType1}
        scrollEnabled={false}
      />

      <FlatList
        keyExtractor={(item, index) => `feature2-${index}`}
        contentContainerStyle={[styles.boxContainer, styles.noTopBorder]}
        data={features.filter(x => x.type === 2)}
        renderItem={renderFeatureItemType2}
        scrollEnabled={false}
      />
    </View>
  );
};

const renderFeatureItemType1 = ({item, index}) => {
  return (
    <View
      key={`${index}`}
      style={[
        styles.featuresHalf,
        Math.ceil((index + 1) / 2) % 2 === 0 && styles.altRow,
      ]}>
      <FastImage
        style={styles.icon}
        resizeMode="contain"
        tintColor="#bbb"
        source={{uri: `https://autobeeb.com/${item.fullImagePath}.png`}}
      />
      <Text numberOfLines={1} style={styles.featuresText}>
        {item.name}
      </Text>
    </View>
  );
};

const renderFeatureItemType2 = ({item, index}) => (
  <View style={[styles.featuresHalf, index % 2 === 0 && styles.altRow]}>
    <View style={styles.row}>
      <Text numberOfLines={1} style={styles.featuresText}>
        {item.name}
      </Text>
      <Text numberOfLines={1} style={[styles.featuresText, styles.optionName]}>
        {item.optionName}
      </Text>
    </View>
  </View>
);

export default FeaturesSection;

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
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
  },
  blackHeader: {
    paddingHorizontal: 10,
    width: '100%',
    paddingTop: 4,
    paddingBottom: 3,
    color: '#000',
    fontSize: 18,
    marginBottom: 7,
    fontFamily: Constants.fontFamilyBold,
  },
  boxContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  noTopBorder: {
    borderTopWidth: 0,
  },
  featuresHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    flex: 1,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  featuresText: {
    fontSize: 14,
    color: '#61667B',
    fontFamily: Constants.fontFamilyBold,
  },
  optionName: {
    marginLeft: 5,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  altRow: {
    backgroundColor: '#FBFBFB',
  },
});
