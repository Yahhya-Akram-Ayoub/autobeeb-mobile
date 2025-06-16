import React, {useState, useEffect} from 'react';
import {Text, View, FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import {Languages} from '../common';
import {NewHeader} from '../containers';
import {BannerListingsComponent} from '../components';
import AddButton from '../components/AddAdvButton';
import {useNavigation} from '@react-navigation/native';

const RecentlyViewedScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const recentOpenListings = useSelector(
    state => state.recentListings.recentSeenListings,
  );

  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    if (recentOpenListings?.length) {
      loadMoreItems();
    }
  }, [recentOpenListings]);

  const loadMoreItems = () => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const nextItems = recentOpenListings.slice(start, end);
    setVisibleItems(prev => [...prev, ...nextItems]);
    setPage(prev => prev + 1);
  };

  const renderItem = ({item}) => (
    <BannerListingsComponent
      key={item.ID}
      user={user}
      item={item}
      navigation={navigation}
      AppCountryCode={ViewingCountry?.cca2}
    />
  );

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <NewHeader back navigation={navigation} />
      <AddButton navigation={navigation} />

      <FlatList
        data={visibleItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.ID?.toString() || index.toString()}
        contentContainerStyle={{
          alignItems: 'center',
          paddingVertical: 10,
        }}
        ListEmptyComponent={() => (
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
        )}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default RecentlyViewedScreen;
