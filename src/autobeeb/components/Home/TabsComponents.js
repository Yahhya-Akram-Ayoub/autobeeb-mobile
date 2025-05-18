import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Constants, Languages} from '../../../common';
import {useNavigation} from '@react-navigation/native';
import {memo} from 'react';
import FastImage from 'react-native-fast-image';

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
          onPressIn={() => {
            navigateBasedOnType(Constants.sellTypes[1], Tab);
          }}
          style={[styles.SellBtn]}>
          <Text style={[styles.TextSellBtn]}>{Languages.ForRent}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPressIn={() => {
          navigateBasedOnType(Constants.sellTypes[2], Tab);
        }}
        style={[styles.SellBtn]}>
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
export const FuelTypesList = memo(({onPress}) => (
  <FlatList
    data={Constants.FilterFuelTypes.filter(x => x.ID !== -1 && x.ID !== 16)}
    keyExtractor={(_, index) => `fuel-${index}`}
    renderItem={({item, index}) => (
      <RenderFuelItem
        item={item}
        onPress={() => {
          onPress(item);
        }}
      />
    )}
    contentContainerStyle={styles.FilterFuelTypes}
    scrollEnabled
    showsHorizontalScrollIndicator={false}
    horizontal
  />
));
export const PaymentList = memo(({onPress}) => (
  <View style={styles.OptionsTypes}>
    {[0, 1].map(i => (
      <Pressable
        onPress={() => {
          onPress('payment', i);
        }}
        key={`payment-${i}`}
        style={[styles.OptionBtn]}>
        <Text style={[styles.TextOptionBtn]}>
          {Constants.paymentMethods[i].Name}
        </Text>
      </Pressable>
    ))}
    {[1, 2].map(i => (
      <Pressable
        onPress={() => {
          onPress('condition', i);
        }}
        key={`condition-${i}`}
        style={[styles.OptionBtn]}>
        <Text style={[styles.TextOptionBtn]}>
          {Constants.FilterOfferCondition[i].Name}
        </Text>
      </Pressable>
    ))}
  </View>
));
export const RenderCategoryItem = ({item, onPress}) => {
  if (!item) {
    return renderCategorySkeleton();
  }

  return (
    <Pressable style={styles.Category} onPressIn={onPress}>
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
    <Pressable style={styles.Make} onPressIn={onPress}>
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
        <Text style={styles.MakeText}>{item.name}</Text>
      )}
    </Pressable>
  );
};
export const RenderSectionItem = ({item, onPress}) => {
  if (!item) {
    return renderSectionSkeleton();
  }

  return (
    <Pressable onPressIn={onPress} style={styles.Section}>
      {item.fullImagePath && (
        <FastImage
          style={styles.SectionImage}
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${item.fullImagePath}_300x150.png`,
          }}
        />
      )}
    </Pressable>
  );
};
const RenderFuelItem = ({item, onPress}) => {
  return (
    <Pressable style={[styles.FuelBtn]} onPressIn={onPress}>
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
  Makes: {},
  Make: {
    borderWidth: 1,
    borderColor: '#69696950',
    backgroundColor: '#0000cc00',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 55,
    maxHeight: 55,
    width: 65,
    height: 65,
  },
  Category: {
    borderWidth: 1,
    borderColor: '#69696950',
    backgroundColor: '#0000cc00',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 3,
    width: 65,
    height: 65,
  },
  MakeText: {
    fontFamily: Constants.fontFamily,
    color: '#000000ff',
    fontWeight: 700,
    fontSize: 12,
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
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
  },
  SectionSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 100,
    width: 65,
    height: 65,
  },
  FuelBtn: {
    borderWidth: 1,
    borderColor: '#69696950',
    borderRadius: 10,
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
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 3,
    flex: 1,
    height: 30,
  },
  TextOptionBtn: {
    color: '#000',
    fontFamily: Constants.fontFamilyBold,
    fontSize: 12,
    textAlign: 'center',
  },
});
