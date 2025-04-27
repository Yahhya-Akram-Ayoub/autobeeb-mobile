import {useNavigation} from '@react-navigation/native';
import {BannerListingsComponent} from '..';
import FeatueredListingCard from '../FeatueredListingCard';
import MainListingsComponent from '../MainListingsComponent';
import {Dimensions, StyleSheet} from 'react-native';
import AutobeebBanner from './AutobeebBanner';
import React from 'react';

const RenderListingCard = ({item, selectedCity, cca2, renderType}) => {
  const navigation = useNavigation();
  return (
    <MainListingsComponent
      item={item}
      AllCountries={`${cca2}`.toLocaleLowerCase() == 'all'}
      AppCountryCode={cca2}
      navigation={navigation}
      imageStyle={styles.MainListingsComponentImage}
      itemStyle={styles.MainListingsComponentItem}
      SelectedCities={selectedCity}
    />
  );
  if ((item.skipForAutoBeebBanner || item.skip) && renderType != 1) {
    return <View></View>;
  }

  if (item.AutoBeebBanner) {
    return <AutobeebBanner item={item} />;
  } else if (item.IsSpecial) {
    return (
      <FeatueredListingCard
        AllCountries={`${cca2}`.toLocaleLowerCase() == 'all'}
        AppCountryCode={cca2}
        item={item}
        navigation={navigation}
        SelectedCities={selectedCity}
      />
    );
  } else if (renderType == 1) {
    return (
      <MainListingsComponent
        item={item}
        AllCountries={`${cca2}`.toLocaleLowerCase() == 'all'}
        AppCountryCode={cca2}
        navigation={navigation}
        imageStyle={styles.MainListingsComponentImage}
        itemStyle={styles.MainListingsComponentItem}
        SelectedCities={selectedCity}
      />
    );
  } else if (renderType == 2) {
    return (
      <BannerListingsComponent
        AllCountries={`${cca2}`.toLocaleLowerCase() == 'all'}
        AppCountryCode={cca2}
        item={item}
        navigation={navigation}
        SelectedCities={selectedCity}
      />
    );
  }
};

const styles = StyleSheet.create({
  MainListingsComponentItem: {
    borderRadius: 5,
    borderWidth: 0,
    overflow: 'hidden',
    marginHorizontal: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    justifyContent: 'space-between',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    marginBottom: 4,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width * 0.485,
  },
  MainListingsComponentImage: {
    width: Dimensions.get('window').width * 0.485,
    height: Dimensions.get('window').height * 0.2,
  },
});

export default React.memo(RenderListingCard);
