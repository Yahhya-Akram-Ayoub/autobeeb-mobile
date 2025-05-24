import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Color, Constants, Languages} from '../../../common';
import {useNavigation} from '@react-navigation/native';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {deepClone} from '../shared/StaticData';

export const RenderSellTypes = ({Tab, isForRent}) => {
  const navigation = useNavigation();

  const navigateBasedOnType = (SellType, ListingType) => {
    const isDirectToListings =
      ![1, 7].includes(SellType.ID) &&
      !(ListingType.ID === 32 && SellType.ID === 4);

    if (isDirectToListings) {
      navigation.navigate('ListingsScreen', {ListingType, SellType});
      return;
    }

    switch (ListingType.ID) {
      case 32:
      case 4:
        navigation.navigate('SectionsScreen', {ListingType, SellType});
        break;
      case 16:
        navigation.navigate('CategoriesScreen', {ListingType, SellType});
        break;
      default:
        navigation.navigate('MakesScreen', {ListingType, SellType});
    }
  };

  return (
    <View style={styles.SellTypes}>
      <View style={[styles.SellBtn, styles.ActiveOption]}>
        <Text style={[styles.TextSellBtn, styles.ActiveOptionText]}>
          {Languages.ForSale}
        </Text>
      </View>
      {isForRent && (
        <TouchableOpacity
          onPress={() => {
            navigateBasedOnType(Constants.sellTypes[1], Tab);
          }}
          style={[
            styles.SellBtn,
            {
              borderColor: '#F68D0071',
            },
          ]}>
          <Text style={[styles.TextSellBtn]}>{Languages.ForRent}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => {
          navigateBasedOnType(Constants.sellTypes[2], Tab);
        }}
        style={[
          styles.SellBtn,
          {
            borderColor: '#D3101871',
          },
        ]}>
        <Text style={[styles.TextSellBtn]}>{Languages.Wanted}</Text>
      </TouchableOpacity>
    </View>
  );
};
export const renderCategorySkeleton = () => (
  <View style={styles.Category}>
    <View style={styles.CategorySkeleton} />
  </View>
);
export const renderSectionSkeleton = () => (
  <View style={styles.Section}>
    <View style={styles.SectionSkeleton} />
  </View>
);
export const renderMakeSkeleton = () => (
  <View style={styles.Make}>
    <View style={styles.MakeSkeleton} />
  </View>
);
export const FuelTypesList = memo(({onPress}) => {
  const data = useMemo(
    () => Constants.FilterFuelTypes.filter(x => x.ID !== -1 && x.ID !== 16),
    [],
  );

  const renderItem = useCallback(
    ({item}) => (
      <RenderFuelItem
        item={item}
        onPress={() => {
          onPress(item);
        }}
      />
    ),
    [onPress],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(_, index) => `fuel-${index}`}
      renderItem={renderItem}
      contentContainerStyle={styles.FilterFuelTypes}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      horizontal
      initialNumToRender={5}
      removeClippedSubviews={true}
    />
  );
});
export const PaymentList = memo(({onPress}) => {
  return (
    <View style={styles.OptionsTypes}>
      <Pressable
        onPress={() => {
          onPress('condition', 1);
        }}
        style={[styles.OptionBtn]}>
        <Text style={[styles.TextOptionBtn]}>{Languages.New}</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          onPress('condition', 2);
        }}
        style={[styles.OptionBtn]}>
        <Text style={[styles.TextOptionBtn]}>{Languages.Used}</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          onPress('payment', 1);
        }}
        style={[styles.OptionBtn, {borderColor: '#006400'}]}>
        <Text style={[styles.TextOptionBtn]}>{Languages.Installments}</Text>
      </Pressable>
    </View>
  );
});
export const RenderCategoryItem = ({item, onPress}) => {
  if (!item) {
    return renderCategorySkeleton();
  }

  return (
    <Pressable style={styles.Category} onPress={onPress}>
      {item.fullImagePath && (
        <FastImage
          style={styles.CategoryImage}
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${item.fullImagePath}_300x150.png`,
          }}
        />
      )}
      <Text numberOfLines={1} style={styles.MakeText}>
        {item.name}
      </Text>
    </Pressable>
  );
};
export const RenderMakeItem = ({item, onPress}) => {
  if (!item) {
    return renderMakeSkeleton();
  }

  return (
    <Pressable style={styles.Make} onPress={onPress}>
      {item.fullImagePath ? (
        <FastImage
          style={styles.MakeImage}
          resizeMode={FastImage.resizeMode.contain}
          source={
            item.Image
              ? item.Image
              : {
                  uri: `https://autobeeb.com/${item.fullImagePath}_300x150.png`,
                  cache: 'immutable',
                }
          }
        />
      ) : (
        <Text numberOfLines={1} style={styles.MakeText}>
          {item.name}
        </Text>
      )}
    </Pressable>
  );
};
export const RenderSectionItem = ({item, onPress}) => {
  if (!item) {
    return renderSectionSkeleton();
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.Section, item.id === 64 && {borderColor: Color.primary}]}>
      {item.fullImagePath && (
        <FastImage
          style={styles.SectionImage}
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${item.fullImagePath}_300x150.png`,
          }}
        />
      )}
      {Languages.langID === 2 && (
        <Text numberOfLines={1} style={styles.MakeText}>
          {`${item.name}`.replace('قطع غيار', '')}
        </Text>
      )}
    </Pressable>
  );
};
export const CategoriesList = memo(({categories, onPress}) => {
  const listRef = useRef(null);

  useEffect(() => {
    return () =>
      setTimeout(() => {
        listRef?.current?.scrollToOffset({offset: -2000, animated: false});
      }, 100);
  }, [categories]);

  return (
    <FlatList
      ref={listRef}
      data={categories}
      keyExtractor={(_, index) => `cat-${index}`}
      renderItem={({item}) => (
        <RenderCategoryItem item={item} onPress={() => onPress?.(item)} />
      )}
      contentContainerStyle={styles.FilterFuelTypes}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
});
export const SectionsList = memo(({sections, onPress}) => {
  const listRef = useRef(null);

  useEffect(() => {
    return () =>
      setTimeout(() => {
        listRef?.current?.scrollToOffset({offset: -1000, animated: false});
      }, 50);
  }, [sections]);

  return (
    <FlatList
      ref={listRef}
      data={sections}
      keyExtractor={(_, index) => `sec-${index}`}
      renderItem={({item}) => (
        <RenderSectionItem item={item} onPress={() => onPress?.(item)} />
      )}
      contentContainerStyle={styles.SectionsList}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
});
export const MakesList = memo(({makes, onPress}) => {
  const listRef = useRef(null);

  useEffect(() => {
    return () =>
      setTimeout(() => {
        listRef?.current?.scrollToOffset({offset: -1000, animated: false});
      }, 50);
  }, [makes]);

  return (
    <FlatList
      ref={listRef}
      data={makes}
      keyExtractor={(_, index) => `mak-${index}`}
      renderItem={({item}) => (
        <RenderMakeItem item={item} onPress={() => onPress?.(item)} />
      )}
      contentContainerStyle={styles.Makes}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
});

const RenderFuelItem = ({item, onPress}) => {
  return (
    <Pressable style={[styles.FuelBtn]} onPress={onPress}>
      <Text style={[styles.TextBtn]}>{item.Name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  SellTypes: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 8,
  },
  SellBtn: {
    borderWidth: 1,
    borderColor: '#11100121',
    borderRadius: 3,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    flex: 1,
  },
  TextSellBtn: {
    color: '#000',
    fontFamily: Constants.fontFamilyBold,
    fontSize: 12,
  },
  Makes: {gap: 8},
  Make: {
    borderWidth: 1,
    borderColor: '#69696950',
    backgroundColor: '#0000cc00',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: 65,
  },
  Category: {
    borderWidth: 1,
    borderColor: '#69696950',
    backgroundColor: '#0000cc00',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    height: 35,
  },
  MakeText: {
    fontFamily: Constants.fontFamilyBold,
    fontSize: 12,
    color: '#000000',
  },
  MakeImage: {
    width: 60,
    height: 60,
  },
  MakeSkeleton: {
    width: 55,
    height: 55,
    borderRadius: 100,
    backgroundColor: '#e0e0e0',
  },
  CategorySkeleton: {
    width: 65,
    height: 28,
    backgroundColor: '#e0e0e0',
  },
  SectionSkeleton: {
    width: 65,
    height: 28,
    backgroundColor: '#e0e0e0',
  },
  CategoryImage: {
    width: 40,
    height: 20,
  },
  SectionImage: {
    width: 60,
    height: 25,
  },
  Section: {
    borderWidth: 1,
    borderColor: '#69696950',
    backgroundColor: '#0000cc00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    height: 40,
  },
  FuelBtn: {
    borderWidth: 1,
    borderColor: '#69696950',
    borderRadius: 3,
    paddingHorizontal: 15,
    paddingVertical: 3,
    height: 30,
  },
  FilterFuelTypes: {
    gap: 10,
  },
  TextBtn: {
    color: '#000',
    fontFamily: Constants.fontFamilyBold,
    fontSize: 12,
  },
  ActiveOption: {
    borderWidth: 0,
  },
  ActiveOptionText: {
    color: '#000',
    position: 'absolute',
    backgroundColor: '#F8F8F8',
    width: '100%',
    textAlign: 'center',
    height: 60,
    paddingTop: 5,
    top: 0,
    borderTopRightRadius: 3,
    borderTopLeftRadius: 3,
  },
  OptionsTypes: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    gap: 10,
  },
  OptionBtn: {
    borderWidth: 1,
    borderColor: '#69696950',
    borderRadius: 3,
    paddingHorizontal: 15,
    paddingVertical: 3,
    width: '32%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  TextOptionBtn: {
    color: '#000',
    fontFamily: Constants.fontFamilyBold,
    fontSize: 12,
    textAlign: 'center',
  },
  ContainerActive: {
    gap: 10,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 3,
  },
  SectionsList: {
    justifyContent: 'space-between',
    gap: 10,
  },
});
