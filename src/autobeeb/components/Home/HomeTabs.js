import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Platform,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Tabs} from './StaticData.json';
import {Languages} from '../../../common';
import Layout from '../../constants/Layout';
import TabSkeleton from './TabSkeleton';
import FilterTabBox from './FilterTabBox';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
                <View
                  key={`skeleton-${itemIndex}`}
                  style={{
                    width: Layout.screenWidth * 0.33,
                    alignItems: 'center',
                  }}>
                  <TabSkeleton />
                </View>
              );
            }

            return (
              <View
                key={globalIndex}
                style={{
                  width: Layout.screenWidth * 0.33,
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => handleTabPress(item, globalIndex)}
                  style={[
                    styles.tabButton,
                    isActive && styles.activeTabButton,
                  ]}>
                  <FastImage
                    style={styles.fastImage}
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
    padding: Layout.screenWidth * 0.01,
  },
  rowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  tabButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    margin: 4,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    width: Layout.screenWidth * 0.31,
    height: Layout.screenWidth * 0.29,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  activeTabButton: {
    position: 'absolute',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    borderColor: '#ccc',
    height: 120,
    borderWidth: 0,
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
    marginBottom: 0,
  },
});
