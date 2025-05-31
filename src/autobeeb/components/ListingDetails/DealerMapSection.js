import {useRef} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import getDirections from 'react-native-google-maps-directions';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';

const DealerMapSection = ({latLng}) => {
  const mapRef = useRef(null);

  if (!latLng) return null;

  const handleGetDirections = destination => {
    const data = {
      destination: destination,
      params: [
        {
          key: 'travelmode',
          value: 'driving', // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate', // this instantly initializes navigation using the given travel mode
        },
      ],
    };

    getDirections(data);
  };

  const [lat, lng] = latLng.split(',').map(Number);
  if (isNaN(lat) || isNaN(lng)) return null;

  const coordinate = {latitude: lat, longitude: lng};
  const region = {
    ...coordinate,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.blackHeader}>{Languages.Address}</Text>
      <MapView
        ref={mapRef}
        liteMode
        region={region}
        onPress={() => handleGetDirections(coordinate)}
        style={styles.map}>
        <Marker
          coordinate={coordinate}
          onPress={() => handleGetDirections(coordinate)}
        />
      </MapView>
    </View>
  );
};

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
    marginBottom: 5,
    fontFamily: Constants.fontFamilyBold,
  },
  map: {
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 10,
  },
});

export default DealerMapSection;
