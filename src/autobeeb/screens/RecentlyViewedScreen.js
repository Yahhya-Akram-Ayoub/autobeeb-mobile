import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {BannerListingsComponent} from '../../components';
import {NewHeader} from '../../containers';
import AddAdvButton from '../../components/AddAdvButton';
import {Constants, Languages} from '../../common';
import KS from '../../services/KSAPI';
import {screenWidth} from '../constants/Layout';
import FastImage from 'react-native-fast-image';
import {AddAdvButtonSquare, AppHeader} from '../components';
import {actions} from '../../redux/HomeRedux';

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
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadListings = async pageNumber => {
    const start = (pageNumber - 1) * ITEMS_PER_PAGE;
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
        langId: 1,
        increaseViews: false,
      });

      setListings(prev => [...prev, ...res]);
      setPage(pageNumber + 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setListings([]);
    setPage(1);
    loadListings(1);
  }, [recentIds]);

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
  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CarDetails', {id: item.ID})}
      style={styles.cardContainer}>
      <FastImage
        source={
          item.thumbURL
            ? {uri: `https://autobeeb.com/${item.fullImagePath}_750x420.jpg`}
            : require('../../images/placeholder.png')
        }
        style={styles.cardImage}
        resizeMode="cover"
      />

      <View style={styles.cardContent}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {item.typeID === 32 ? item.title : item.name}
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

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <AppHeader onCountryChange={refreshScreen} />
      <Text style={styles.sectionTitle}>{Languages.RecentlyViewed}</Text>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{
          alignItems: 'center',
          paddingVertical: 10,
          paddingBottom: 40,
        }}
        onScroll={handleScroll}
        onEndReached={() => loadListings(page)}
        onEndReachedThreshold={0.6}
        ListFooterComponent={() =>
          isLoading ? (
            <ActivityIndicator
              size="small"
              color="#999"
              style={{marginVertical: 20}}
            />
          ) : null
        }
        ListEmptyComponent={() =>
          !isLoading && (
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
});

export {RecentlyViewedScreen};
