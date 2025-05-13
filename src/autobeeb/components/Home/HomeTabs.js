import React from 'react';
import {useSelector} from 'react-redux';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Layout from '../../constants/Layout';
import {useNavigation} from '@react-navigation/native';
import {Tabs} from './StaticData.json';
import {Languages} from '../../../common';
import TabSkeleton from './TabSkeleton';

const HomeTabs = () => {
  const {homePageData, isFetching} = useSelector(state => state.home);
  const MainTypes = homePageData?.MainTypes ?? [];
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const navigation = useNavigation();

  // Function to determine border styles based on index
  const borderRadiusStyle = index => {
    switch (index) {
      case 0:
        return styles.borderTopLeft;
      case 2:
        return styles.borderTopRight;
      case 6:
        return styles.borderBottomLeft;
      case 8:
        return styles.borderBottomRight;
      default:
        return {};
    }
  };

  const handleTabPress = item => {
    navigation.navigate('SellTypeScreen', {
      ListingType: item,
      category: item,
      cca2: ViewingCountry?.cca2 || 'us',
    });
  };

  return (
    <FlatList
      keyExtractor={(item, index) =>
        `${item.ID?.toString()}-${index.toString()}`
      }
      data={isFetching ? new Array(9).fill(1) : [...MainTypes, ...Tabs]}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({item, index}) => {
        if (isFetching) return <TabSkeleton />;

        return (
          <TouchableOpacity
            onPress={() => handleTabPress(item)}
            style={[styles.tabButton, borderRadiusStyle(index)]}>
            <FastImage
              style={[
                styles.fastImage,
                index === 0 && {position: 'relative', top: 8},
                index === 5 && styles.smallImage,
              ]}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: item.Image
                  ? item.Image
                  : `https://autobeeb.com/${item.FullImagePath}_115x115.png`,
              }}
            />
            <Text style={styles.tabText}>
              {item.NameKey ? Languages[item.NameKey] : item.Name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default HomeTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: Layout.screenWidth * 0.01,
    justifyContent: 'center',
    width: Layout.screenWidth,
  },
  tabButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    margin: 2,
    borderColor: '#ccc',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: Layout.screenWidth * 0.31,
    height: Layout.screenWidth * 0.29,
  },
  fastImage: {
    width: 90,
    flex: 3,
  },
  tabText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
  smallImage: {
    width: 60,
    height: 60,
  },
  borderTopLeft: {
    borderTopLeftRadius: 10,
  },
  borderTopRight: {
    borderTopRightRadius: 10,
  },
  borderBottomLeft: {
    borderBottomLeftRadius: 10,
  },
  borderBottomRight: {
    borderBottomRightRadius: 10,
  },
});
