import {useEffect, useRef, useState} from 'react';
import KS from '../../services/KSAPI';
import {Color, Constants, Languages} from '../../common';
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppIcon, Icons} from '../components';
import {screenHeight, screenWidth} from '../constants/Layout';
import {useNavigation, useRoute} from '@react-navigation/native';
import {recentFreeSeach} from '../../redux/RecentListingsRedux';
import {useDispatch, useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';

const SearchScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const recentSearched = useSelector(state =>
    state.recentListings.recentFreeSeach.map(x => x.keyword),
  );
  const recentSeenListings = useSelector(
    state => state.recentListings.recentOpenListings,
  );
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState('');
  const [Suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListingLoading, setIsListingLoading] = useState(false);
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const searchInputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Helper: convert Arabic numbers to English
  const convertToNumber = number => {
    if (!number) return '';
    let str = number + '';
    return str
      .replace(/٠/g, '0')
      .replace(/،/g, '.')
      .replace(/٫/g, '.')
      .replace(/,/g, '.')
      .replace(/١/g, '1')
      .replace(/٢/g, '2')
      .replace(/٣/g, '3')
      .replace(/٤/g, '4')
      .replace(/٥/g, '5')
      .replace(/٦/g, '6')
      .replace(/٧/g, '7')
      .replace(/٨/g, '8')
      .replace(/٩/g, '9');
  };

  const loadRecentSeenListings = () => {
    const addSeeMore = __DEV__ || recentSeenListings.length > 10;
    const Ids = recentSeenListings
      .slice(0, 9)
      .map(x => `ids=${x.id}&`)
      .join('&');

    setIsListingLoading(true);

    KS.GetListingsByIdsCore({
      p: `&${Ids}`,
      userId: user?.ID,
      currencyId: ViewingCurrency.ID,
      langId: Languages.langID,
      increaseViews: false,
    })
      .then(res => {
        const _list = res;
        if (addSeeMore) {
          setListings([..._list, {SeeMore: true}]);
        } else {
          setListings(_list);
        }
      })
      .finally(() => {
        setIsListingLoading(false);
      });
  };

  // On mount: handle route param query and truncate recentSeenListings
  useEffect(() => {
    if (route?.params?.query) {
      const initialQuery = route.params.query ?? '';
      setQuery(initialQuery);

      KS.QuickSearch({
        langid: Languages.langID,
        query: initialQuery,
      }).then(data => {
        if (data && data.Success) {
          setSuggestions(data.Suggestions);
        }
      });
    }
    loadRecentSeenListings();
    // Cleanup on unmount - clear timeout if any
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [route?.params?.query]);

  // Handle search text change with debounce
  const onChangeText = text => {
    const formattedText = convertToNumber(text);
    setIsLoading(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      KS.QuickSearch({
        langid: Languages.langID,
        query: formattedText,
      }).then(data => {
        if (data && data.Success) {
          setSuggestions(data.Suggestions);
        }
        setIsLoading(false);
      });
    }, 1000);

    setQuery(text);
  };

  // Submit search query handler
  const onSubmitEditing = () => {
    if (query) dispatch(recentFreeSeach(query));

    navigation.replace('SearchResult', {
      submitted: true,
      query,
    });
  };

  // Clear search input
  const onClear = () => {
    setQuery('');
    setSuggestions([]);
  };
  const onPressKeyword = item => {
    dispatch(recentFreeSeach(item));
    setIsLoading(true);
    setQuery(item);
    navigation.replace('SearchResult', {
      submitted: true,
      query: item,
    });
    // KS.QuickSearch({
    //   langid: Languages.langID,
    //   query: item,
    // }).then(data => {
    //   if (data && data.Success) {
    //     if (data.Suggestions && data.Suggestions.length === 0) {
    //       searchInputRef.current && searchInputRef.current.focus();
    //     }
    //     setSuggestions(data.Suggestions);
    //   }
    //   setIsLoading(false);
    // });
  };
  // Render a suggestion item
  const renderSuggestionItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => {
          dispatch(recentFreeSeach(item.Label));

          navigation.replace('SearchResult', {
            query: item.Label,
            MakeID: item.MakeID,
            ModelID: item.ModelID,
            Make: {ID: parseInt(item.MakeID), Name: item.MakeName},
            Model: {ID: parseInt(item.ModelID), Name: item.ModelName},
          });
        }}>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionText}>{item.Label}</Text>
        </View>
        <AppIcon
          type={Icons.Ionicons}
          name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
          color={'#000'}
          size={20}
        />
      </TouchableOpacity>
    );
  };

  // Render recent search item
  const renderRecentSearchItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.recentSearchItem}
        onPress={() => {
          onPressKeyword(item);
        }}>
        <Text style={styles.recentSearchText}>{item}</Text>
      </TouchableOpacity>
    );
  };
  const navigateToDetails = id => navigation.replace('CarDetails', {id});
  // Render recently seen listings item
  const renderRecentSeenItem = ({item}) => {
    if (item.SeeMore) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('RecentlyViewedScreen')}
          style={styles.listingItem}>
          <View style={styles.seeMoreContent}>
            <Text style={styles.seeMoreText}>{Languages.ShowMore}</Text>
            <AppIcon
              type={Icons.Feather}
              name={I18nManager.isRTL ? 'chevrons-left' : 'chevrons-right'}
              style={styles.seeMoreIcon}
              color={'gray'}
              size={20}
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <RecentSeenListingCard
          item={item}
          navigation={navigation}
          onPress={() => {
            navigateToDetails(item.ID);
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <AppIcon
            type={Icons.Ionicons}
            name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
            color={'#000'}
            size={30}
          />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={query}
            placeholder={Languages.SearchByMakeOrModel}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
          />
          {!!query && (
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <AppIcon
                type={Icons.Ionicons}
                name="close-circle"
                color={'#555'}
                size={27}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={'#F85502'} />
        </View>
      )}

      {Suggestions && !isLoading && Suggestions.length > 0 && !!query ? (
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps="handled"
          extraData={Suggestions}
          data={Suggestions}
          renderItem={renderSuggestionItem}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {!isLoading && recentSearched.length > 0 && (
            <View style={styles.recentSearchContainer}>
              <Text style={styles.sectionTitle}>
                {Languages.LatestSearches}
              </Text>

              <FlatList
                keyExtractor={(item, index) => index.toString()}
                horizontal
                contentContainerStyle={styles.recentSearchList}
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                data={recentSearched}
                renderItem={renderRecentSearchItem}
              />
            </View>
          )}

          {!isLoading && !isListingLoading && listings.length > 0 && (
            <View style={styles.recentSeenContainer}>
              <Text style={styles.sectionTitle}>
                {Languages.RecentlyViewed}
              </Text>

              <FlatList
                keyExtractor={(item, index) => `${item.id}-${index}`}
                horizontal
                contentContainerStyle={styles.recentSeenList}
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                data={listings}
                renderItem={renderRecentSeenItem}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const RecentSeenListingCard = ({item, onPress}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.listingItem} onPress={onPress}>
      <FastImage
        style={styles.listingImage}
        source={
          imageError || !item.thumbURL
            ? require('../../images/placeholder.png')
            : {uri: `https://autobeeb.com/${item.fullImagePath}_400x400.jpg`}
        }
        resizeMode={'contain'}
        onError={() => setImageError(true)}
      />
      <View style={styles.listingInfo}>
        <Text numberOfLines={1} style={styles.listingName}>
          {item.name}
        </Text>
      </View>

      {!!item.countryName && (
        <Text numberOfLines={1} style={styles.locationText}>
          {item.countryName} / {item.cityName}
        </Text>
      )}

      <View
        style={[
          styles.priceContainer,
          item.paymentMethod !== 2 && {justifyContent: 'center'},
        ]}>
        {!!item.formatedPrice ? (
          <Text
            numberOfLines={1}
            style={[
              styles.priceText,
              {
                textAlign: item.paymentMethod !== 2 ? 'center' : 'left',
              },
            ]}>
            {item.formatedPrice}
          </Text>
        ) : (
          <View />
        )}
        {item.paymentMethod === 2 && (
          <Text numberOfLines={1} style={styles.installmentText}>
            {Languages.Installments}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  backButton: {
    paddingVertical: 6,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 0.9,
    fontSize: 18,
    fontFamily: 'Cairo-Regular',
  },
  clearButton: {},
  clearIcon: {},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionText: {
    color: '#000',
  },
  suggestionType: {
    color: Color.primary,
  },
  emptyContainer: {
    width: screenWidth,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    maxHeight: 100,
    paddingHorizontal: 8,
  },
  recentSearchContainer: {
    marginTop: 5,
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    marginHorizontal: 7,
  },
  recentSearchList: {
    height: 60,
    alignSelf: 'flex-start',
    minWidth: '100%',
    zIndex: 20,
    gap: 6,
    marginTop: 8,
  },
  recentSearchItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    elevation: 1,
    borderRadius: 5,
    minWidth: 20,
    height: 45,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentSearchText: {
    color: '#000',
    fontFamily: Constants.fontFamilySemiBold,
  },
  recentListingsContainer: {
    marginHorizontal: 0,
    marginTop: screenHeight * 0.15,
    justifyContent: 'center',
  },
  recentListingsList: {
    paddingHorizontal: 2,
    width: screenWidth,
  },
  seeMoreButton: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginTop: 5,
    elevation: 1,
    marginHorizontal: 7,
    borderRadius: 5,
  },
  seeMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
  },
  seeMoreText: {
    color: 'gray',
  },
  seeMoreIcon: {
    marginTop: 3,
    marginLeft: 10,
  },
  listingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    width: screenWidth * 0.4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    height: screenHeight / 3.1,
  },
  listingImage: {
    width: '100%',
    height: screenWidth * 0.4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    width: screenWidth * 0.35,
    height: screenWidth * 0.4,
    alignSelf: 'center',
  },
  listingInfo: {
    paddingHorizontal: 8,
    paddingTop: 6,
    minHeight: 40,
    justifyContent: 'center',
  },
  listingName: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: '100%',
    marginTop: 6,
  },
  priceText: {
    color: Color.primary,
    fontSize: 13,
    fontFamily: 'Cairo-Bold',
  },
  brandImage: {
    width: 22,
    height: 22,
  },

  locationText: {
    fontSize: 13,
    textAlign: 'center',
  },
  installmentText: {
    color: '#2B9531',
    fontSize: 12,
    textAlign: 'center',
  },
  recentSeenContainer: {
    width: screenWidth,
    minHeight: screenHeight / 2,
  },
  recentSeenList: {
    paddingEnd: 10,
    gap: 0,
  },
});

export {SearchScreen};
