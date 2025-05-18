import {memo, useEffect, useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import Layout from '../../constants/Layout';
import {Constants, Languages} from '../../../common';
import KS from '../../../services/KSAPI';
import {
  AllCategories,
  AllMakes,
  arrayOfNull,
  MoreData,
} from '../shared/StaticData';
import {
  FuelTypesList,
  PaymentList,
  RenderCategoryItem,
  RenderMakeItem,
  RenderSectionItem,
  RenderSellTypes,
} from './TabsComponents';
import {useNavigation} from '@react-navigation/native';

const _defaultArray = arrayOfNull(6);

const FilterTabBox = memo(({Tab}) => {
  const isMake = Tab.ID !== 16;
  const isForRent = Tab.ID !== 32;
  const isCategory = Tab.ID !== 1;
  const isSection = Tab.ID === 32;
  const isFuel = Tab.ID === 1;
  const isPaymentMethod = Tab.ID !== 32 && Tab.ID !== 16;
  const [makes, setMakes] = useState(_defaultArray);
  const [categories, setCategories] = useState(_defaultArray);
  const [sections, setSections] = useState(_defaultArray);
  const navigation = useNavigation();

  useEffect(() => {
    ResetStates();
    isMake && LoadMakes();
    isSection && LoadSections();
    isCategory && LoadCategory();
  }, [Tab.ID]);

  const ResetStates = () => {
    setMakes(isMake ? _defaultArray : []);
    setSections(isSection ? _defaultArray : []);
    setCategories(isCategory ? _defaultArray : []);
  };

  const LoadMakes = () => {
    const _listingType = Tab.ID === 4 ? 8192 : Tab.ID === 32 ? 1 : Tab.ID; // in case "معدات ثقيلة" get makes for section "معدات بناء" | in case "Spare parts" get makes for types "Cars"
    KS.GetMakesCore({
      LangId: Languages.langID,
      ListingType: _listingType,
      Page: 1,
      PageSize: 8,
    }).then(res => {
      res.makes.unshift(AllMakes);
      res.makes.push(MoreData);
      setMakes(res.makes);
    });
  };

  const LoadSections = () => {
    KS.GetSectionsCore({LangId: Languages.langID, ParentId: Tab.ID}).then(
      res => {
        setSections(res.sections.filter(x => x.id !== 4096 && x.id !== 2048)); // Exclude accessories and boards sections
      },
    );
  };

  const LoadCategory = () => {
    const _listingType = Tab.ID === 4 ? 8192 : Tab.ID === 32 ? 64 : Tab.ID;
    console.log({_listingType});
    KS.GetCategoriesCore({
      LangId: Languages.langID,
      ListingType: _listingType,
    }).then(res => {
      console.log({res, categories});
      if (Tab.ID === 16) res.categories.unshift(AllCategories);
      setCategories(res.categories);
    });
  };

  const MakeNavigation = make => {
    if (make.more) {
      navigation.navigate('MakesScreen', {
        ListingType: Tab,
        SellType: Constants.sellTypes[0],
      });
    } else {
      navigation.navigate('ListingsScreen', {
        ListingType: Tab,
        SellType: Constants.sellTypes[0],
        selectedMake: NormlizeObj(make),
      });
    }
  };

  const FuelNavigation = (type, value) => {
    navigation.navigate('ListingsScreen', {
      ListingType: Tab,
      SellType: Constants.sellTypes[0],
      selectedFuelType: type === 'fuel' ? value : null,
      selectedStatus:
        type === 'condition' ? Constants.FilterOfferCondition[value] : null,
      selectedPaymentMethod:
        type === 'payment' ? Constants.paymentMethods[value] : null,
    });
  };

  const SectionNavigation = section => {
    navigation.navigate('ListingsScreen', {
      ListingType: Tab,
      SellType: Constants.sellTypes[0],
      selectedMake: AllMakes,
      SectionID: section.id,
      selectedSection: NormlizeObj(section),
    });
  };

  const CategoryNavigation = (category, section) => {
    navigation.navigate('ListingsScreen', {
      ListingType: Tab,
      SellType: Constants.sellTypes[0],
      selectedMake: AllMakes,
      selectedCategory: NormlizeObj(category),
      SectionID: section?.id,
      selectedSection: NormlizeObj(section),
    });
  };
  const NormlizeObj = obj => {
    if (!obj) return null;
    return {...obj, ID: obj.id, Name: obj.name};
  };
  const CategoriesList = useMemo(
    () => (
      <FlatList
        data={categories}
        keyExtractor={(_, index) => `cat-${index}`}
        renderItem={({item}) => (
          <RenderCategoryItem
            item={item}
            onPress={() => {
              CategoryNavigation(item);
            }}
          />
        )}
        contentContainerStyle={styles.FilterFuelTypes}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
        extraData={[categories]}
      />
    ),
    [categories],
  );

  const SectionsList = useMemo(
    () => (
      <FlatList
        data={sections}
        keyExtractor={(_, index) => `sec-${index}`}
        renderItem={({item}) => (
          <RenderSectionItem
            item={item}
            onPress={() => {
              SectionNavigation(item);
            }}
          />
        )}
        contentContainerStyle={styles.SectionsList}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
        extraData={[sections]}
      />
    ),
    [sections],
  );

  const MakeListsList = useMemo(
    () => (
      <FlatList
        data={makes}
        keyExtractor={(_, index) => `mak-${index}`}
        renderItem={({item}) => (
          <RenderMakeItem
            item={item}
            onPress={() => {
              MakeNavigation(item);
            }}
          />
        )}
        contentContainerStyle={styles.Makes}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
        extraData={[makes]}
      />
    ),
    [makes],
  );

  return (
    <View style={styles.expandedBox}>
      <RenderSellTypes Tab={Tab} isForRent={isForRent} />
      <View style={styles.ContainerActive}>
        {isSection && SectionsList}
        {isMake && MakeListsList}
        {isCategory && CategoriesList}
        {isFuel && (
          <FuelTypesList
            onPress={fuel => {
              FuelNavigation('fuel', fuel);
            }}
          />
        )}
        {isPaymentMethod && (
          <PaymentList
            onPress={(type, value) => {
              FuelNavigation(type, value);
            }}
          />
        )}
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
  FilterFuelTypes: {
    gap: 10,
  },
  SectionsList: {
    justifyContent: 'space-between',
    gap: 10,
  },
});
