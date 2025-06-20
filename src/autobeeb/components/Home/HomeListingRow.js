import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';
import {SkeletonLoader} from '../shared/Skeleton';
import {getCache, setCache} from '..';

const ITEM_SIZE = (screenWidth - 40) / 3;
const CACHE_KEY = 'home_listing_cache';

const HomeListingRow = () => {
  const user = useSelector(state => state.user.user);
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecentlyLoading, setIsRecentlyLoading] = useState(true);
  const recentIds = useSelector(
    state => state.recentListings.recentOpenListings,
  );
  const recentSearched = useSelector(state =>
    state.recentListings.recentFreeSeach.filter(
      x => x.langId === Languages.langID,
    ),
  );
  const recentFilterSeach = useSelector(
    state => state.recentListings.recentFilterSeach,
  );
  const [sections, setSections] = useState({
    new: [],
    recent: [],
    search: [],
    suggested: [],
    featured: [],
  });

  const navigation = useNavigation();

  const moveToDetails = item =>
    navigation.replace('CarDetails', {id: item.id, screen: 'HomeScreen'});

  useEffect(() => {
    loadListings();
    try {
      loadData();
    } catch (err) {
      Alert.alert(JSON.stringify(err));
      setIsLoading(false);
    }
  }, [ViewingCountry?.cca2]);

  const loadData = async () => {
    let _searchTerm = recentSearched?.[0];
    let _recentFilterSeach =
      recentFilterSeach?.langId === Languages.langID ? recentFilterSeach : null;

    // Cache area
    const cacheKey = `$${Languages.langID}_${ViewingCountry?.cca2}_${
      _searchTerm?.keyword
    }_${JSON.stringify(_recentFilterSeach?.filter ?? {})}`;

    const cachedData = await getCache(CACHE_KEY, cacheKey);

    if (cachedData) {
      setSections({
        new: cachedData.recentlyListings,
        search: [
          ...(cachedData.searchListings ?? []),
          ...(cachedData.searchParts ?? []),
        ],
        suggested: cachedData.intrestedListings,
        featured: cachedData.featureListings,
        recent: sections.recent, // Keep recent from separate API
      });
      setIsLoading(false);
      return;
    }
    // End cache area

    if (_searchTerm?.date < _recentFilterSeach?.date) _searchTerm = null;
    let {country} = await KS.GetCountryCore({
      LangId: Languages.langID,
      Iso: ViewingCountry?.cca2,
    });

    KS.HomeListingCore({
      GetRecently: true,
      GetFeatures: true,
      GetIntrested: !!_recentFilterSeach?.filter,
      GetFilter: !_searchTerm?.keyword && !!_recentFilterSeach?.filter,
      GetSearch: !!_searchTerm?.keyword,
      SearchQuery: _searchTerm?.keyword,
      LangId: Languages.langID,
      CountryId: country?.id,
      ...(_recentFilterSeach?.filter ?? {}),
    })
      .then(res => {
        setSections(prev => {
          return {
            ...prev,
            new: res.recentlyListings,
            search: [
              ...(res?.searchListings ?? []),
              ...(res?.searchParts ?? []),
            ],
            suggested: res.intrestedListings,
            featured: res.featureListings,
          };
        });

        setCache(CACHE_KEY, cacheKey, res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadListings = async () => {
    const idsToFetch = recentIds?.slice(0, 3);
    if (!idsToFetch || idsToFetch.length === 0) {
      setIsRecentlyLoading(false);
      return;
    }

    const idQuery = idsToFetch.map(x => `ids=${x.id}`).join('&');
    setIsRecentlyLoading(true);

    try {
      const res = await KS.GetListingsByIdsCore({
        p: `&${idQuery}`,
        userId: user?.ID,
        currencyId: ViewingCurrency?.ID,
        langId: 1,
        increaseViews: false,
      });
      setSections(prev => {
        return {...prev, recent: res || []};
      });
    } finally {
      setIsRecentlyLoading(false);
    }
  };

  const renderSkeleton = count =>
    Array.from({length: count}).map((_, i) => (
      <SkeletonLoader
        key={`skeleton-${i}`}
        containerStyle={styles.skeletonBox}
        borderRadius={3}
        shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
        animationDuration={1200}
      />
    ));

  const renderSection = (
    titleKey,
    data,
    maxItems = 3,
    navigateTo = () => {},
  ) => {
    if (
      (isLoading && titleKey !== 'RecentlyViewed') ||
      (isRecentlyLoading && titleKey === 'RecentlyViewed')
    ) {
      return (
        <View style={styles.cardContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.blackHeader}>{Languages[titleKey]}</Text>
            <TouchableOpacity disabled={true}>
              <Text style={styles.showMore}>{Languages.ShowMore}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>{renderSkeleton(maxItems)}</View>
        </View>
      );
    }

    if (!data || !data.length) return null;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.blackHeader}>{Languages[titleKey]}</Text>
          <TouchableOpacity onPress={navigateTo}>
            <Text style={styles.showMore}>{Languages.ShowMore}</Text>
          </TouchableOpacity>
        </View>
        <View style={data.length < 3 ? styles.grid2 : styles.grid}>
          {data.slice(0, maxItems).map(item => (
            <ListingCard
              key={item.id.toString()}
              item={item}
              onPress={moveToDetails}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView>
      {renderSection('newly_added_ads', sections.new, 9, () => {
        navigation.replace('SearchResult', {
          submitted: true,
          query: '',
        });
      })}

      {renderSection('RecentlyViewed', sections.recent, 3, () => {
        navigation.navigate('RecentlyViewedScreen');
      })}

      {renderSection('last_search', sections.search, 3, () => {
        if (
          recentSearched?.[0] &&
          recentFilterSeach &&
          recentSearched?.[0].date < recentFilterSeach.date
        ) {
          navigation.navigate(
            'ListingsScreen',
            recentFilterSeach.selectedEntities,
          );
        } else if (recentSearched?.[0]) {
          navigation.replace('SearchResult', {
            submitted: true,
            query: recentSearched?.[0]?.keyword ?? '',
          });
        } else if (recentFilterSeach?.filter) {
          navigation.navigate(
            'ListingsScreen',
            recentFilterSeach.selectedEntities,
          );
        }
      })}

      {renderSection('suggested_ads', sections.suggested, 3, () => {
        navigation.navigate('ListingsScreen', {
          ListingType: recentFilterSeach?.selectedEntities?.ListingType,
          SellType: recentFilterSeach?.selectedEntities?.SellType,
          selectedSection: recentFilterSeach?.selectedEntities?.selectedSection,
          selectedFuelType:
            recentFilterSeach?.selectedEntities?.selectedFuelType,
          selectedCategory:
            recentFilterSeach?.selectedEntities?.selectedCategory,
        });
      })}

      {renderSection('featured_ads', sections.featured, 3, () => {
        navigation.replace('SearchResult', {
          submitted: true,
          query: '',
        });
      })}
    </ScrollView>
  );
};
const ListingCard = ({item, onPress}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <FastImage
        source={
          imageError || !item.thumbURL
            ? require('../../../images/placeholder.png')
            : {
                uri: `https://autobeeb.com/${item.fullImagePath}_400x400.jpg`,
              }
        }
        style={[styles.image]}
        resizeMode={imageError || !item.thumbURL ? 'contain' : 'cover'}
        onError={() => setImageError(true)}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: Color.secondary,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    width: screenWidth - 14,
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blackHeader: {
    fontSize: 16,
    fontFamily: Constants.fontFamilyBold,
    color: '#000',
  },
  showMore: {
    fontSize: 12,
    fontFamily: Constants.fontFamilyBold,
    color: Color.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 6,
  },
  card: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeletonBox: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});

export default HomeListingRow;
