import {memo, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Layout from '../../constants/Layout';
import {Color, Constants, Languages} from '../../../common';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

const RenderSellTypes = ({Tab, isForRent}) => {
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

const FilterTabBox = memo(({Tab}) => {
  const isMake = Tab.ID !== 16;
  const isForRent = Tab.ID !== 32;
  const isCategory = Tab.ID !== 1;
  const isSection = Tab.ID === 32;
  const isFuel = Tab.ID === 1;
  const isPaymentMethod = Tab.ID !== 32 && Tab.ID !== 16;

  const renderCategoryItem = ({item}) => (
    <View style={styles.Category}>
      {item.FullImagePath && (
        <FastImage
          style={styles.CategoryImage}
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${item.FullImagePath}_300x150.png`,
          }}
        />
      )}
      <Text numberOfLines={1} style={styles.MakeText}>
        {item.Name}
      </Text>
    </View>
  );

  const renderMakeItem = ({item}) => (
    <View style={styles.Make}>
      {item.FullImagePath ? (
        <FastImage
          style={styles.MakeImage}
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${item.FullImagePath}_300x150.png`,
          }}
        />
      ) : (
        <Text style={styles.MakeText}>{item.Name}</Text>
      )}
    </View>
  );

  const renderSectionItem = ({item}) => (
    <View style={styles.Section}>
      {item.FullImagePath && (
        <FastImage
          style={styles.SectionImage}
          resizeMode="contain"
          source={{
            uri: `https://autobeeb.com/${item.FullImagePath}_300x150.png`,
          }}
        />
      )}
    </View>
  );

  const renderFuelItem = ({item, index}) => (
    <Pressable style={[styles.FuelBtn]}>
      <Text style={[styles.TextBtn]}>{item.Name}</Text>
    </Pressable>
  );

  const CategoriesList = useMemo(
    () => (
      <FlatList
        data={Categories}
        keyExtractor={(_, index) => `cat-${index}`}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.FilterFuelTypes}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    ),
    [Categories],
  );

  const SectionsList = useMemo(
    () => (
      <FlatList
        data={Sections}
        keyExtractor={(_, index) => `cat-${index}`}
        renderItem={renderSectionItem}
        contentContainerStyle={styles.SectionsList}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    ),
    [Sections],
  );

  const MakeListsList = useMemo(
    () => (
      <FlatList
        data={Makes}
        keyExtractor={(_, index) => `cat-${index}`}
        renderItem={renderMakeItem}
        contentContainerStyle={styles.Makes}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    ),
    [Makes],
  );

  const FuelTypesList = useMemo(
    () => (
      <FlatList
        data={Constants.FilterFuelTypes.filter(x => x.ID !== -1 && x.ID !== 16)}
        keyExtractor={(_, index) => `fuel-${index}`}
        renderItem={renderFuelItem}
        contentContainerStyle={styles.FilterFuelTypes}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    ),
    [],
  );

  const PaymentList = useMemo(
    () => (
      <View style={styles.OptionsTypes}>
        {[0, 1].map(i => (
          <Pressable key={`payment-${i}`} style={[styles.OptionBtn]}>
            <Text style={[styles.TextOptionBtn]}>
              {Constants.paymentMethods[i].Name}
            </Text>
          </Pressable>
        ))}
        {[1, 2].map(i => (
          <Pressable key={`condition-${i}`} style={[styles.OptionBtn]}>
            <Text style={[styles.TextOptionBtn]}>
              {Constants.FilterOfferCondition[i].Name}
            </Text>
          </Pressable>
        ))}
      </View>
    ),
    [],
  );

  return (
    <View style={styles.expandedBox}>
      <RenderSellTypes Tab={Tab} isForRent={isForRent} />
      <View style={styles.ContainerActive}>
        {isSection && SectionsList}
        {isMake && MakeListsList}
        {isCategory && CategoriesList}
        {isFuel && FuelTypesList}
        {isPaymentMethod && PaymentList}
      </View>
    </View>
  );
});

export default FilterTabBox;

const styles = StyleSheet.create({
  expandedBox: {
    width: Layout.screenWidth * 0.97,
    backgroundColor: '#fff',
    borderWidth: 0,
    borderTopWidth: 0,
    borderColor: '#ccc',
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },
  ContainerActive: {
    gap: 10,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 3,
  },
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
    width: 60,
    height: 55,
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
  SectionsList: {
    justifyContent: 'space-between',
    width: '100%',
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

const Makes = [
  {
    Name: 'الكل',
    Id: 0,
  },
  {
    Name: 'Toyota',
    Id: 1643,
    FullImagePath: 'content/newListingMakes/1643/1643',
  },
  {
    Name: 'Hyundai',
    Id: 1619,
    FullImagePath: 'content/newListingMakes/1619/1619',
  },
  {
    Name: 'KIA',
    Id: 837,
    FullImagePath: 'content/newListingMakes/837/837',
  },
  {
    Name: 'Mercedes Benz',
    Id: 1609,
    FullImagePath: 'content/newListingMakes/1609/1609',
  },
  {
    Name: 'BMW',
    Id: 427,
    FullImagePath: 'content/newListingMakes/427/427',
  },
  {
    Name: 'Ford',
    Id: 1620,
    FullImagePath: 'content/newListingMakes/1620/1620',
  },
  {
    Name: 'المزيد',
    Id: 837,
  },
];

const Categories = [
  {
    Name: 'الكل',
    ID: 0,
  },
  {
    ID: 65536,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/265536/65536',
    Name: 'راس تريلا',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 5,
  },
  {
    ID: 512,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/2512/512',
    Name: 'شاسيه',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 10,
  },
  {
    ID: 16,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/216/16',
    Name: 'صندوق',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 15,
  },
  {
    ID: 524288,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/2524288/524288',
    Name: 'قلاب',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 20,
  },
  {
    ID: 131072,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/2131072/131072',
    Name: 'صهريج - تنك',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 21,
  },
  {
    ID: 1048576,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/21048576/1048576',
    Name: 'ونش',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 25,
  },
  {
    ID: 16384,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/216384/16384',
    Name: 'براد ',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 30,
  },
  {
    ID: 4096,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/24096/4096',
    Name: 'سطحة',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 35,
  },
  {
    ID: 32768,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/232768/32768',
    Name: 'سطحة مع جوانب',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 36,
  },
  {
    ID: 1024,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/21024/1024',
    Name: 'خلاطة خرسانة',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 40,
  },
  {
    ID: 8192,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/28192/8192',
    Name: 'مضخة خرسانة',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 45,
  },
  {
    ID: 262144,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/2262144/262144',
    Name: 'ناقلة اخشاب',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 50,
  },
  {
    ID: 2048,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/22048/2048',
    Name: 'رافعة الهوك',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 53,
  },
  {
    ID: 64,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/264/64',
    Name: 'ناقلة ماشية',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 55,
  },
  {
    ID: 8,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/28/8',
    Name: 'ناقلة سيارات',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 60,
  },
  {
    ID: 2097456,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/22097456/2097456',
    Name: 'ستارة',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 65,
  },
  {
    ID: 2097152,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/22097152/2097152',
    Name: 'ضاغطة نفايات',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 70,
  },
  {
    ID: 32,
    TypeID: 2,
    Logo: false,
    SaleCount: 0,
    ParentID: null,
    ChildrenCount: 0,
    FullImagePath: 'content/newlistingcategories/232/32',
    Name: 'كرفان',
    ExtraInfo: null,
    TypeName: 'شاحنات',
    ParentName: null,
    WantedCount: 0,
    RentCount: 0,
    RelatedEntity: null,
    Rank: 999999,
  },
];

const Sections = [
  {
    ID: 64,
    Icon: true,
    FullImagePath: 'content/newlistingtype/64/64',
    LangID: 2,
    Rank: 70,
    ParentID: 32,
    Name: 'قطع غيار سيارات',
    Description: null,
    ExtraInfo: null,
    SaleCount: 0,
    RentCount: 0,
    WantedCount: 0,
    RelatedEntity: 1,
  },
  {
    ID: 128,
    Icon: true,
    FullImagePath: 'content/newlistingtype/128/128',
    LangID: 2,
    Rank: 80,
    ParentID: 32,
    Name: 'قطع غيار شاحنات',
    Description: null,
    ExtraInfo: null,
    SaleCount: 0,
    RentCount: 0,
    WantedCount: 0,
    RelatedEntity: 2,
  },
  {
    ID: 256,
    Icon: true,
    FullImagePath: 'content/newlistingtype/256/256',
    LangID: 2,
    Rank: 90,
    ParentID: 32,
    Name: 'قطع غيار مقطورات',
    Description: null,
    ExtraInfo: null,
    SaleCount: 0,
    RentCount: 0,
    WantedCount: 0,
    RelatedEntity: 16,
  },
  {
    ID: 512,
    Icon: true,
    FullImagePath: 'content/newlistingtype/512/512',
    LangID: 2,
    Rank: 100,
    ParentID: 32,
    Name: 'قطع غيار باصات وفانات',
    Description: null,
    ExtraInfo: null,
    SaleCount: 0,
    RentCount: 0,
    WantedCount: 0,
    RelatedEntity: 8,
  },
  {
    ID: 1024,
    Icon: true,
    FullImagePath: 'content/newlistingtype/1024/1024',
    LangID: 2,
    Rank: 110,
    ParentID: 32,
    Name: 'قطع غيار معدات ثقيلة',
    Description: null,
    ExtraInfo: null,
    SaleCount: 0,
    RentCount: 0,
    WantedCount: 0,
    RelatedEntity: 57344,
  },
];
