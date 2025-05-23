import {View} from 'react-native';
import {ListingBanner} from '../components';
import {useRoute} from '@react-navigation/native';
import {useState} from 'react';

const ListingDetailsScreen = () => {
  const route = useRoute();
  const {id, image} = route.params;
  const [listing, setListing] = useState();
  
  return (
    <View>
      <ListingBanner />
    </View>
  );
};

export {ListingDetailsScreen};
