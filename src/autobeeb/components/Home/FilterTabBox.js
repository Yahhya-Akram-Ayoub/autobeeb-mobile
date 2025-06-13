import {memo, useEffect, useState} from 'react';
import {Alert, Platform, StyleSheet, UIManager, View} from 'react-native';
import Layout from '../../constants/Layout';
import {Constants, Languages} from '../../../common';
import KS from '../../../services/KSAPI';
import {
  AllCategories,
  AllMakes,
  arrayOfNull,
  deepClone,
  MoreData,
} from '../shared/StaticData';
import {
  CategoriesList,
  FuelTypesList,
  MakesList,
  PaymentList,
  RenderSellTypes,
  SectionsList,
} from './TabsComponents';
import {useNavigation} from '@react-navigation/native';

const _defaultArray = arrayOfNull(6);

const FilterTabBox = memo(({Tab}) => {
  const isMake = Tab.ID !== 16 && Tab.ID !== 4;
  const isForRent = Tab.ID !== 32;
  const isCategory = Tab.ID !== 1;
  const isSection = Tab.ID === 32 || Tab.ID === 4;
  const isFuel = Tab.ID === 1;
  const isPaymentMethod = Tab.ID !== 32;
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
    setMakes(deepClone(_defaultArray));
    setSections(deepClone(_defaultArray));
    setCategories(deepClone(_defaultArray));
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
    const _listingType = Tab.ID === 32 ? 64 : Tab.ID;
    KS.GetCategoriesCore({
      LangId: Languages.langID,
      ListingType: _listingType === 4 ? 0 : _listingType,
      ParentListingType: _listingType === 4 ? _listingType : 0,
    }).then(res => {
      if (Tab.ID === 16) res.categories.unshift(AllCategories);
      setCategories(deepClone(res.categories));
    });
  };

  const MakeNavigation = (make, section) => {
    if (make.more) {
      navigation.navigate('MakesScreen', {
        ListingType: Tab,
        SellType: Constants.sellTypes[0],
        navigationOption: {
          SectionID: section?.id,
          selectedSection: NormlizeObj(section),
          ListingType: Tab,
          SellType: Constants.sellTypes[0],
        },
      });
    } else {
      navigation.navigate('ListingsScreen', {
        ListingType: Tab,
        SellType: Constants.sellTypes[0],
        selectedMake: NormlizeObj(make),
        SectionID: section?.id,
        selectedSection: NormlizeObj(section),
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

  return (
    <View style={styles.expandedBox}>
      <RenderSellTypes Tab={Tab} isForRent={isForRent} />
      <View style={styles.ContainerActive}>
        {isSection && Tab.ID !== 4 && (
          <SectionsList sections={sections} onPress={SectionNavigation} />
        )}

        {isMake && (
          <MakesList
            makes={makes}
            onPress={make => {
              if (isSection) {
                MakeNavigation(make, sections[0]);
              } else {
                MakeNavigation(make);
              }
            }}
          />
        )}

        {isCategory && (
          <CategoriesList
            categories={categories}
            onPress={category => {
              if (isSection) {
                CategoryNavigation(category, {
                  id: category.typeId,
                  name: category.typeName,
                });
              } else {
                CategoryNavigation(category);
              }
            }}
          />
        )}

        {isFuel && (
          <FuelTypesList
            onPress={fuel => {
              FuelNavigation('fuel', fuel);
            }}
          />
        )}

        <View
          style={[
            !isPaymentMethod && {
              maxHeight: 0,
              opacity: 0,
              margin: 0,
              position: 'absolute',
              zIndex: -100,
            },
          ]}>
          <PaymentList
            onPress={(type, val) => {
              FuelNavigation(type, val);
            }}
          />
        </View>
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
    flex: 3,
  },
  ContainerActive: {
    gap: 10,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 3,
  },
});
