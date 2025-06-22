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
        style={[styles.image, {tintColor: renderTintColor(index)}]}
        resizeMode="contain"
        source={{
          uri: item.Image
            ? item.Image
            : 'https://autobeeb.com/' + item.FullImagePath + '_115x115.png',
        }}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    width: screenWidth * 0.45,
    marginHorizontal: 5,
    marginVertical: 5,
    height: screenWidth * 0.45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 90,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
});

export default ListingType;
