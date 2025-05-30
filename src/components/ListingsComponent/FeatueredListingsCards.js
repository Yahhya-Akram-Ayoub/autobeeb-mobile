import {useEffect, useState, useRef} from 'react';
import {View, FlatList, StyleSheet, Animated, Dimensions} from 'react-native';
import FeatueredListingCard from '../FeatueredListingCard';
import {useNavigation} from '@react-navigation/native';
import KS from '../../services/KSAPI';

const FeatueredListingsCards = ({
  ISOCode,
  selectedCity,
  langId,
  country,
  type,
  fallbackTypes,
}) => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (fallbackTypes || `${type}` !== '32') {
      setIsLoading(true); // Show loading state
      getData();
    }
  }, []);

  const getData = async () => {
    let _listings = [];
    _listings = await getFeaturedListings(type); // Fetch listings for the current type
    if (_listings.length > 0) {
      setListings([..._listings]); // Update state with fetched listings
      return;
    }

    if (fallbackTypes) {
      for (const t of fallbackTypes) {
        _listings = await getFeaturedListings(t); // Fetch listings for the current type

        if (_listings.length > 0) {
          setListings([..._listings]); // Update state with fetched listings
          break; // Exit the loop as data is found
        }
      }
    }

    setIsLoading(false);
  };

  const getFeaturedListings = async TYPE => {
    try {
      const res = await KS.GetFeaturedListings({
        pageSize: 200,
        page: 1,
        langId,
        countryId: country.cca2,
        type: TYPE,
      });

      if (res?.Success === 1 && res.Listings.length > 0) {
        setIsLoading(false);
        return res.Listings;
      }

      return []; // Return empty array if no data
    } catch (err) {
      console.error(`Error fetching listings for type: ${type}`, err);
      return []; // Return empty array in case of error
    }
  };

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      -Dimensions.get('window').width,
      Dimensions.get('window').width,
    ],
  });

  if (
    (listings.length === 0 && !isLoading) ||
    (!fallbackTypes && `${type}` === '32')
  )
    return <View />;

  if (isLoading)
    return (
      <View style={styles.container}>
        <View style={styles.skeletonBox}>
          <Animated.View
            style={[styles.shimmer, {transform: [{translateX}]}]}
          />
        </View>
        <View style={styles.skeletonBox}>
          <Animated.View
            style={[styles.shimmer, {transform: [{translateX}]}]}
          />
        </View>
      </View>
    );

  if (listings.length == 1)
    return (
      <View style={{width: '100%'}}>
        <FeatueredListingCard
          AllCountries={ISOCode == 'ALL'}
          AppCountryCode={ISOCode}
          item={listings[0]}
          navigation={navigation}
          SelectedCities={selectedCity}
          fullScreen={listings.length == 1}
        />
      </View>
    );

  return (
    <View style={{width: '100%'}}>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={listings}
        horizontal={true}
        directionalLockEnabled={true}
        alwaysBounceVertical={false}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        renderItem={({index, item}) => {
          return (
            <FeatueredListingCard
              key={index}
              isSpecialOnly={true}
              AllCountries={ISOCode == 'ALL'}
              AppCountryCode={ISOCode}
              item={item}
              navigation={navigation}
              SelectedCities={selectedCity}
              fullScreen={listings.length == 1}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
    flexDirection: 'row',
    gap: 15,
  },
  skeletonBox: {
    height: Dimensions.get('screen').height * 0.32 - 20,
    width: Dimensions.get('window').width * 0.84,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default FeatueredListingsCards;
