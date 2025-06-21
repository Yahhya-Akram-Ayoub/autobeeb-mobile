import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  LayoutAnimation,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Tabs} from './StaticData.json';
import {Color, Languages} from '../../../common';
import Layout from '../../constants/Layout';
import TabSkeleton from './TabSkeleton';
import FilterTabBox from './FilterTabBox';

const HomeTabs = () => {
  const {homePageData, isFetching} = useSelector(state => state.home);
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);
  const navigation = useNavigation();
  const MainTypes = homePageData?.MainTypes ?? [];
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const handleTabPress = (item, index) => {
    if (item.IsLink) {
      navigation.navigate('ListingsScreen', {
        cca2: ViewingCountry?.cca2 || 'us',
        ListingType: MainTypes.find(x => x.ID === item.ID),
        SellType: {...item.SellType, Name: Languages[item.SellType.Name]},
        selectedFuelType: {
          ...item.selectedFuelType,
          Name: Languages[item.selectedFuelType?.Name],
        },
        SectionID: item.SectionID,
        selectedSection: {
          ...item.selectedSection,
          Name: Languages[item.selectedSection?.Name],
        },
      });
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const row = Math.floor(index / 3);
      if (activeRowIndex === row && activeItemIndex === index) {
        setActiveRowIndex(null);
        setActiveItemIndex(null);
      } else {
        setActiveRowIndex(row);
        setActiveItemIndex(index);
      }
    }
  };

  const renderRow = (rowItems, rowIndex) => {
    return (
      <View key={rowIndex}>
        <View style={styles.rowContainer}>
          {rowItems.map((item, itemIndex) => {
            const globalIndex = rowIndex * 3 + itemIndex;
            const isActive = activeItemIndex === globalIndex;

            if (isFetching && item === 1) {
              return (
                <View key={`skeleton-${itemIndex}`} style={styles.homeBox}>
                  <TabSkeleton />
                </View>
              );
            }

            return (
              <View
                key={globalIndex}
                style={[styles.homeBox, styles.shadowWrapper]}>
                <TouchableOpacity
                  onPress={() => handleTabPress(item, globalIndex)}
                  style={[
                    styles.tabButton,
                    isActive && styles.activeTabButton,
                  ]}>
                  <FastImage
                    style={[
                      styles.fastImage,
                      itemIndex === 2 &&
                        rowIndex === 1 &&
                        styles.marginSpareParts,
                    ]}
                    resizeMode={FastImage.resizeMode.contain}
                    source={{
                      uri: item.Image
                        ? item.Image
                        : `https://autobeeb.com/${item.FullImagePath}_115x115.png`,
                    }}
                  />
                  <Text
                    style={[styles.tabText, isActive && styles.activeTabText]}
                    numberOfLines={1}>
                    {item.NameKey ? Languages[item.NameKey] : item.Name}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        {activeRowIndex === rowIndex && (
          <View style={styles.expandedBoxWrapper}>
            <FilterTabBox Tab={fullData[activeItemIndex]} />
          </View>
        )}
      </View>
    );
  };

  const fullData = isFetching ? new Array(9).fill(1) : [...MainTypes, ...Tabs];
  const rows = [];
  for (let i = 0; i < fullData.length; i += 3) {
    rows.push(fullData.slice(i, i + 3));
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(_, index) => `row-${index}`}
      renderItem={({item, index}) => renderRow(item, index)}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
      extraData={[activeRowIndex, activeItemIndex]}
    />
  );
};

export default HomeTabs;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Layout.screenWidth * 0.01,
    backgroundColor: '#f0f0f0',
  },
  homeBox: {
    width: Layout.screenWidth * 0.33,
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  tabButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 4,
    width: Layout.screenWidth * 0.31,
    height: Layout.screenWidth * 0.32,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.15,
    // shadowRadius: 12,
    // elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,

    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    overflow: 'hidden',
  },
  activeTabButton: {
    backgroundColor: '#f0f0f0',
    transform: [{scale: 0.98}],
    borderColor: Color.primary,
    borderWidth: 1,
    borderRadius: 12,
  },
  activeTabText: {
    // color: 'white',
  },
  marginSpareParts: {
    marginTop: 3,
    marginBottom: -3,
  },
  fastImage: {
    width: 90,
    height: 60,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  expandedBoxWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  shadowWrapper: {},
});
