import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import SkeletonCard from './SkeletonCard';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import FeatueredListingsCards from './FeatueredListingsCards';
import RenderListingCard from './RenderListingCard';
import {Constants, Languages} from '../../common';
import {useEffect, useMemo, useRef, useState} from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;
const keyExtractor = (item, index) => `${index}-${item?.ID}`;
const FILTER_HEADER_HEIGHT = 113;
const FILTER_HEADER_HEIGHT_WITHOUT_TAGS = 85;

const DisplayListingsList = ({
  isLoading,
  Listings,
  cca2,
  selectedCity,
  renderType,
  LoadListingsPage,
  onScrollHandler,
  footerLoading,
}) => {
  const [listings, setListings] = useState([]);
  const isGrid = renderType === 1;
  const numColumns = isGrid ? 2 : 1;
  const recyclerRef = useRef(null);
  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
      index => {
        // You can return different view types here if needed
        return 'LIST_ITEM';
      },
      (type, dim) => {
        const totalColumns = renderType === 1 ? 2 : 1;
        dim.width = SCREEN_WIDTH / totalColumns;
        dim.height = 330; // Adjust based on your UI
      }
    );
  }, [renderType]);

  useEffect(() => {
    if (!!Listings.length)
      setListings(prev => [
        ...prev,
        ...Listings.filter(x => !prev.some(y => y.ID == x.ID)),
      ]);
  }, [Listings]);

  if (isLoading)
    return (
      <FlatList
        keyExtractor={keyExtractor}
        numColumns={2}
        data={[1, 2, 3, 4]}
        contentContainerStyle={styles.LoadingList}
        renderItem={item => <SkeletonCard />}
      />
    );

  const isDiplayFeaturedListings =
    `${cca2}`.toLowerCase() != 'all' &&
    !!listings.filter(
      x =>
        x.IsSpecial && `${x.ISOCode}`.toLowerCase() == `${cca2}`.toLowerCase()
    )?.length;
  const FeaturedListings = listings?.filter(
    x => x.IsSpecial && `${x.ISOCode}`.toLowerCase() == `${cca2}`.toLowerCase()
  );

  const dataProvider = new DataProvider(
    (r1, r2) => r1.ID !== r2.ID
  ).cloneWithRows(listings);

  const rowRenderer = (type, item, index) => {
    return (
      <RenderListingCard
        item={item}
        cca2={cca2}
        selectedCity={selectedCity}
        renderType={renderType}
      />
    );
  };

  const RenderEmptyComponent = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontFamily: 'Cairo-Bold',
          }}>
          {Languages.NoOffers}
        </Text>
      </View>
    );
  };

  const RenderListingsFooter = () => {
    return (
      <View style={{}}>
        {footerLoading && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              marginBottom: 50,
            }}>
            <ActivityIndicator size="large" color={'#F85502'} />
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {isDiplayFeaturedListings && (
        <FeatueredListingsCards
          ISOCode={cca2}
          country={this.props.ViewingCountry} // use it from useSate
          langId={Languages.langID}
          selectedCity={selectedCity}
          type={this.props.route.params?.ListingType?.ID}
        />
      )}
      <RecyclerListView
        style={styles.LoadingList}
        ref={recyclerRef}
        isHorizontal={false}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
        onEndReached={LoadListingsPage}
        onEndReachedThreshold={0.4}
        renderFooter={() => <RenderListingsFooter />}
        scrollViewProps={{
          onScroll: onScrollHandler,
          removeClippedSubviews: true,
        }}
        forceNonDeterministicRendering={true}
        canChangeSize={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  LoadingList: {
    paddingTop: Constants.listingsHeaderHiegth + FILTER_HEADER_HEIGHT + 10,
    backgroundColor: '#fff',
  },
});

export default DisplayListingsList;
