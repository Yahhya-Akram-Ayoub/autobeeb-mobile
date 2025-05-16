import {memo, useMemo} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import Layout from '../../constants/Layout';
import {Color, Constants, Languages} from '../../../common';
import FastImage from 'react-native-fast-image';

const FilterTabBox = memo(({Tab}) => {
  const isMake = Tab.ID !== 32 && Tab.ID !== 16;
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

  const renderFuelItem = ({item, index}) => (
    <Pressable style={[styles.FuelBtn, !index && styles.ActiveOption]}>
      <Text style={[styles.TextBtn, !index && styles.ActiveOptionText]}>
        {item.Name}
      </Text>
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

  return (
    <View style={styles.expandedBox}>
      <View style={styles.SellTypes}>
        <Pressable style={styles.SellBtn}>
          <Text style={styles.TextSellBtn}>{Languages.ForSale}</Text>
        </Pressable>
        {isForRent && (
          <Pressable style={styles.SellBtn}>
            <Text style={styles.TextSellBtn}>{Languages.ForRent}</Text>
          </Pressable>
        )}
        <Pressable style={styles.SellBtn}>
          <Text style={styles.TextSellBtn}>{Languages.Wanted}</Text>
        </Pressable>
      </View>

      {isMake && (
        <View style={styles.Makes}>
          {Makes.map(m => (
            <View key={m.ID?.toString()} style={styles.Make}>
              {m.FullImagePath ? (
                <FastImage
                  style={styles.MakeImage}
                  resizeMode="contain"
                  source={{
                    uri: `https://autobeeb.com/${m.FullImagePath}_300x150.png`,
                  }}
                />
              ) : (
                <Text style={styles.MakeText}>{m.Name}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {isSection && CategoriesList}
      {isCategory && CategoriesList}

      {isFuel && (
        <FlatList
          data={Constants.FilterFuelTypes}
          keyExtractor={(_, index) => `fuel-${index}`}
          renderItem={renderFuelItem}
          contentContainerStyle={styles.FilterFuelTypes}
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          horizontal
        />
      )}

      {isPaymentMethod && (
        <View style={styles.OptionsTypes}>
          {[0, 1].map(i => (
            <Pressable
              key={`payment-${i}`}
              style={[styles.OptionBtn, i === 0 && styles.ActiveOption]}>
              <Text
                style={[
                  styles.TextOptionBtn,
                  i === 0 && styles.ActiveOptionText,
                ]}>
                {Constants.paymentMethods[i].Name}
              </Text>
            </Pressable>
          ))}
          {[1, 2].map(i => (
            <Pressable
              key={`condition-${i}`}
              style={[styles.OptionBtn, i === 1 && styles.ActiveOption]}>
              <Text
                style={[
                  styles.TextOptionBtn,
                  i === 1 && styles.ActiveOptionText,
                ]}>
                {Constants.FilterOfferCondition[i].Name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
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
  SellTypes: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 5,
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
  Makes: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  Make: {
    borderWidth: 1,
    borderColor: '#69696950',
    backgroundColor: '#0000cc00',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 55,
    maxHeight: 55,
    width: 55,
    height: 55,
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
    backgroundColor: Color.secondary,
  },
  ActiveOptionText: {
    color: '#fff',
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
