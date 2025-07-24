import {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  BackHandler,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Constants, Languages} from '../../common';
import KS from '../../services/KSAPI';
import {screenWidth} from '../constants/Layout';
import FastImage from 'react-native-fast-image';
import {AddAdvButtonSquare, AppHeader} from '../components';
import {actions} from '../../redux/HomeRedux';
import {SkeletonLoader} from '../components/shared/Skeleton';
import {useRoute} from '@react-navigation/native';

let pageNumber = 1;
const RecentlyViewedScreen = ({navigation}) => {
  const contactBoxTranslate = useRef(new Animated.Value(100)).current;
  const lastScrollY = useRef(0);
  const currentDirection = useRef(null);
  const user = useSelector(state => state.user.user);
  const recentIds = useSelector(
    state => state.recentListings.recentOpenListings,
  );
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const dispatch = useDispatch();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadListings = async () => {
    const start = (pageNumber - 1) * ITEMS_PER_PAGE;
    pageNumber++;
    const end = start + ITEMS_PER_PAGE;

    const idsToFetch = recentIds.slice(start, end);
    if (idsToFetch.length === 0) return;

    const idQuery = idsToFetch.map(x => `ids=${x.id}`).join('&');

    setIsLoading(true);
    try {
      const res = await KS.GetListingsByIdsCore({
        p: `&${idQuery}`,
        userId: user?.ID,
        currencyId: ViewingCurrency?.ID,
        langId: Languages.langID,
        increaseViews: false,
        Status: 16,
      });

      const idOrder = idsToFetch.map(x => x.id);
      const sortedRes = idOrder
        .map(id => res.find(item => item.id === id))
        .filter(Boolean);

      setListings(prev => [...prev, ...sortedRes]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    pageNumber = 1;
    setListings([]);
    loadListings();
  }, [recentIds]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  const handleScroll = event => {
    const currentY = event?.nativeEvent?.contentOffset?.y;
    const direction =
      currentY !== 0 && currentY > lastScrollY.current ? 'down' : 'up';

    if (currentY < 100) {
      lastScrollY.current = currentY;
      return;
    }

    if (direction !== currentDirection.current) {
      currentDirection.current = direction;

      Animated.parallel([
        Animated.timing(contactBoxTranslate, {
          toValue: direction === 'down' ? 0 : 100,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }

    lastScrollY.current = currentY;
  };
  const refreshScreen = () => {
    actions.HomeScreenGet(
      dispatch,
      Languages.langID,
      ViewingCountry?.cca2,
      5,
      ViewingCurrency.ID,
      data => {},
      user?.ID,
    );
  };
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else {
      navigation.navigate('HomeScreen');
      return true;
    }
  };
  const renderSkeletons = () =>
    Array.from({length: 2}).map((_, i) => (
      <SkeletonLoader
        key={`skeleton-${i}`}
        containerStyle={styles.skeletonBox}
        borderRadius={3}
        shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
        animationDuration={1200}
      />
    ));
  const navigateToDetails = id => navigation.navigate('CarDetails', {id});

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <AppHeader
        back={true}
        onCountryChange={refreshScreen}
      />
      <FlatList
        data={listings}
        renderItem={({item}) => (
          <RenderListingItem
            item={item}
            onPress={() => {
              navigateToDetails(item.id);
            }}
          />
        )}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>{Languages.RecentlyViewed}</Text>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        onEndReached={loadListings}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={() =>
          isLoading ? (
            <View
              style={{
                width: screenWidth,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {renderSkeletons()}
            </View>
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily: 'Cairo-Bold',
                  fontSize: 21,
                  textAlign: 'center',
                  color: 'black',
                }}>
                {Languages.NoOffers}
              </Text>
            </View>
          )
        }
      />

      <Animated.View
        style={[
          styles.addOfferSqueerBtn,
          {
            transform: [{translateY: contactBoxTranslate}],
          },
        ]}>
        <AddAdvButtonSquare />
      </Animated.View>
    </View>
  );
};

const RenderListingItem = ({item, onPress}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <FastImage
        source={
          imageError || !item.thumbURL
            ? require('../../images/placeholder.png')
            : {uri: `https://autobeeb.com/${item.fullImagePath}_750x420.jpg`}
        }
        style={styles.cardImage}
        resizeMode={imageError || !item.thumbURL ? 'contain' : 'cover'}
        onError={() => setImageError(true)}
      />

      <View style={styles.cardContent}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {item.name}
        </Text>

        {!!item.countryName && (
          <Text numberOfLines={1} style={styles.cardLocation}>
            {item.countryName} / {item.cityName}
          </Text>
        )}

        <View style={styles.cardPriceRow}>
          {!!item.formatedPrice && (
            <Text style={styles.cardPrice}>{item.formatedPrice}</Text>
          )}
          {item.paymentMethod === 2 && (
            <Text style={styles.cardInstallment}>{Languages.Installments}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    marginBottom: 14,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: screenWidth - 24, // full width with padding
  },
  skeletonBox: {
    backgroundColor: '#eee',
    width: screenWidth - 24,
    height: screenWidth * 0.5 + 80,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: screenWidth * 0.5,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#333',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 15,
    color: '#F85502',
    fontFamily: 'Cairo-Bold',
  },
  cardInstallment: {
    fontSize: 13,
    color: '#2B9531',
    fontFamily: 'Cairo-Regular',
  },
  sectionTitle: {
    fontFamily: Constants.fontFamilyBold,
    marginHorizontal: 7,
    textAlign: 'center',
    color: '#000',
    fontSize: 18,
    paddingVertical: 6,
  },
  list: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 40,
    width: screenWidth,
  },
});

export {RecentlyViewedScreen};
