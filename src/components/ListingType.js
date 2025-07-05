import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {Languages} from '../common';

const screenWidth = Dimensions.get('screen').width;

const renderTintColor = index => {
  switch (index) {
    case 0:
      return '#C20037';
    case 1:
      return '#018404';
    case 2:
      return '#FFBF00';
    case 3:
      return '#9D4E01';
    case 4:
      return '#795091';
    case 5:
      return '#636363';
    default:
      return '#fff00';
  }
};

const ListingType = ({types = [], onClick}) => {
  const renderItem = ({item, index}) => (
    <TouchableOpacity
      key={index}
      onPress={() => onClick(item)}
      style={styles.itemContainer}>
      <Image
        style={styles.image}
        resizeMode="cover"
        source={item.Image ? typeImages[item.Image] : typeImages[item.ID]}
      />
      <Text style={styles.itemText}>
        {item.NameKey ? Languages[item.NameKey] : item.Name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={types}
      numColumns={2}
      contentContainerStyle={styles.container}
      renderItem={renderItem}
    />
  );
};

const typeImages = {
  1: require('../images/types/1.png'),
  2: require('../images/types/2.png'),
  4: require('../images/types/4.png'),
  8: require('../images/types/8.png'),
  16: require('../images/types/16.png'),
  32: require('../images/types/32.png'),
  ElectricCars: require('../images/types/ElectricCars.png'),
  Accessories: require('../images/types/Accessories.png'),
  NumberPlates: require('../images/types/NumberPlates.png'),
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    width: screenWidth * 0.45,
    height: screenWidth * 0.45,
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth * 0.45 - 40,
    height: screenWidth * 0.45 - 55,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
});

export default ListingType;
