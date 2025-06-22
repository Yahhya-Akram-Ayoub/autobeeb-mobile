import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  ActivityIndicator,
  I18nManager,
  Platform,
  Animated,
  Linking,
  Pressable,
  Easing,
} from 'react-native';
import {NewHeader} from '../containers';
import {
  MainListingsComponent,
  BannerListingsComponent,
  LogoSpinner,
  FeatueredListingCard,
  TagsFilter,
  SkeletonCard,
  BottomNavigationBar,
  SkeletonTabFilter,
  AutobeebModal,
} from '../components';
import AddButton from '../components/AddAdvButton';
import AddAdvButtonSquare from '../components/AddAdvButtonSquare';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconEn from 'react-native-vector-icons/Entypo';
import {Color, ExtractScreenObjFromUrl} from '../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {isIphoneX} from 'react-native-iphone-x-helper';

import Languages from '../common/Languages';
import KS from '../services/KSAPI';
import Constants from '../common/Constants';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {
  CardsViewIcon,
  FilterIcon,
  SortIcon,
  CardViewIcon,
} from '../components/SVG';
import {
  ColorModal,
  FuelTypesModal,
  GearBoxModal,
  PartNumberModal,
  PaymentMethodModal,
  RentPeriodModal,
  StatusModal,
} from '../components/Modals';
import FeatueredListingsCards from '../components/ListingsComponent/FeatueredListingsCards';

const BOTTOM_NAVIGATION_BAR_HEIGHT = 70;
const FILTER_HEADER_HEIGHT = 120;
const FILTER_HEADER_HEIGHT_WITHOUT_TAGS = 85;
const SCREEN_WIDTH = Dimensions.get('screen').width;
const BigFont = 22;
const MediumFont = 16;
const SmallFont = 14;
const PageSize = 16;
let All = {
  ID: '',
  Image: require('../images/SellTypes/BlueAll.png'),
  All: true,
  Name: Languages.All,
};
let ViewsIds = [];
let AllMakes = {
  ID: '',
  Image: require('../images/SellTypes/BlueAll.png'),
  AllMake: true,
  All: true,
  Name: Languages.AllMakes,
};
const getMakeParentId = (typeId, sections) => {
  if (typeId === 4) {
    if (sections && sections?.length) {
      return sections[0].ID;
    }
  } else if (typeId === 32) return 1;
  return typeId;
};

class ListingsScreen extends Component {
  constructor(props) {
    super(props);

    All = {
      // to refresh languages value
      ID: '',
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      Name: Languages.All,
    };
    AllMakes = {
      ID: '',
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      AllMake: true,

      Name: Languages.All,
    };
    let AllState = {
      ID: '',
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      Name: Languages.All,
    };

    this.state = {
      PartNumber: '',
      selectedMake: [this.props.route.params?.selectedMake ?? AllMakes],
      selectedModel: [AllState],
      selectedCategory: [this.props.route.params?.selectedCategory ?? AllState],
      selectedCity: [AllState],
      selectedColor: [AllState],
      selectedFuelType: [this.props.route.params?.selectedFuelType ?? AllState],
      selectedGearBox: [AllState],
      selectedPaymentMethod: [
        this.props.route.params?.selectedPaymentMethod ?? AllState,
      ],
      selectedRentPeriod: [AllState],
      selectedSection: [this.props.route.params?.selectedSection ?? AllState],
      selectedStatus: [this.props.route.params?.selectedStatus ?? AllState],
      Makes: this.props.route.params?.Makes ?? [],
      FullMakes: this.props.route.params?.Makes ?? [],
      isLoading: true,
      page: 1,
      renderType: 1,
      AddShown: true,
      sellType: {
        ID: 1,
        Name: 'For Sale',
      },
      MakesLoading: false,
      currency: global.ViewingCurrency
        ? global.ViewingCurrency
        : this.props.ViewingCurrency || {
            ID: 2,
            Ratio: 1.0,
            Standard: true,
            Name: 'USD',
            Format: '$ {0}',
            Rank: 0,
            NumberFormat: 'N0',
            ShortName: 'USD',
            Primary: true,
          },

      footerLoading: false,
    };

    this.translateY = new Animated.Value(0);
    this.addBtnSpace = new Animated.Value(180);
    this.bottomBar = new Animated.Value(0);
    this.widthTo0 = new Animated.Value(150);
    // this.widthTo100 = new Animated.Value(0);
    // this.widthTo33 = new Animated.Value(22);
    this.filterHieght = new Animated.Value(FILTER_HEADER_HEIGHT);
    // this.widthToFull = new Animated.Value(SCREEN_WIDTH / 2);
    this.lastScrollY = 0; // Keep this as a number!
  }
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: navigation.state.params.tabBarVisible,
  });

  selectedFilters = () => {
    const getFirstOrNull = arr =>
      Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    console.log({
      ListingType: this.props.route.params?.ListingType,
      SellType: this.props.route.params?.SellType,
    });
    return {
      ListingType: this.props.route.params?.ListingType || null,
      SellType: this.props.route.params?.SellType || null,
      selectedSection: getFirstOrNull(this.state.selectedSection),
      selectedMake: getFirstOrNull(this.state.selectedMake),
      selectedModel: getFirstOrNull(this.state.selectedModel),
      selectedCategory: getFirstOrNull(this.state.selectedCategory),
      selectedCity: getFirstOrNull(this.state.selectedCity),
      selectedRentPeriod: getFirstOrNull(this.state.selectedRentPeriod),
      selectedStatus: getFirstOrNull(this.state.selectedStatus),
      selectedGearBox: getFirstOrNull(this.state.selectedGearBox),
      selectedFuelType: getFirstOrNull(this.state.selectedFuelType),
      selectedPaymentMethod: getFirstOrNull(this.state.selectedPaymentMethod),
      selectedColor: getFirstOrNull(this.state.selectedColor),
      selectedMinMileage: this.state.selectedMinMileage || '',
      selectedMaxMileage: this.state.selectedMaxMileage || '',
      selectedMinYear: this.state.selectedMinYear || '',
      selectedMaxYear: this.state.selectedMaxYear || '',
      selectedMinPrice: this.state.selectedMinPrice || '',
      selectedMaxPrice: this.state.selectedMaxPrice || '',
    };
  };

  Filters = () => {
    return [
      {
        Name: Languages.Section,
        IsDisplay:
          this.state.Sections &&
          this.state.Sections.length > 0 &&
          !this.state.selectedSection?.some(
            item => item.ID === 4096 || item.ID === 2048,
          ), // Board 4096 , Accessories 2048 => not incloud 2048 OR 4096,
        OnPress: () => {
          this.sectionModal.open();
        },
      },
      {
        Name: Languages.Make,
        IsDisplay:
          this.props.route.params?.ListingType?.ID != 16 &&
          this.state.selectedSection &&
          !(
            (this.props.route.params?.ListingType?.ID == 4 ||
              this.props.route.params?.ListingType?.ID == 32) &&
            this.state.selectedSection[0].All
          ) &&
          this.state.selectedSection[0].ID != 2048 &&
          this.state.selectedSection[0].ID != 4096 &&
          this.state.selectedSection[0].ID != 256 &&
          !this.state.MakesLoading &&
          !!this.state.FullMakes?.length,
        OnPress: () => {
          this.makeModal.open();
        },
      },
      {
        Name: Languages.Model,
        IsDisplay:
          this.props.route.params?.ListingType?.ID != 16 &&
          (this.state.sellType.ID != 1 &&
          (this.props.route.params?.ListingType?.ID == 2 ||
            this.props.route.params?.ListingType?.ID == 4 ||
            this.props.route.params?.ListingType?.ID == 8)
            ? false
            : true) &&
          this.state.selectedMake &&
          this.state.selectedMake.length == 1 &&
          !(
            this.state.selectedMake[0].AllMake || this.state.selectedMake.All
          ) &&
          (this.props.route.params?.ListingType?.ID == 32 &&
          this.state.selectedSection &&
          this.state.selectedSection[0] &&
          !this.state.selectedSection[0].All &&
          this.state.selectedSection[0].ID != 64
            ? false
            : true),
        OnPress: () => {
          this.setState({isModelLoading: true});
          const _modalParams = {
            langID: Languages.langID,
            listingType:
              this.props.route.params?.ListingType?.ID == 32 &&
              this.state.selectedSection[0] &&
              this.state.selectedSection[0].ID
                ? 1
                : this.props.route.params?.ListingType?.ID == 4
                ? this.state.selectedSection[0].ID
                : this.props.route.params?.ListingType?.ID || '',
            makeID: this.state.selectedMake && this.state.selectedMake[0].ID,
          };

          KS.ModelsGet(_modalParams).then(data => {
            data.unshift(All);
            this.setState({
              Models: data,
              FullModels: data,
              isModelLoading: false,
            });
          });
          this.modelModal.open();
        },
      },
      {
        Name: Languages.Category,
        IsDisplay:
          !(
            this.state.selectedSection[0] &&
            this.state.selectedSection[0].All &&
            this.state.Categories &&
            this.state.Categories.length <= 1
          ) && !!this.state.Categories?.length,
        OnPress: () => {
          this.categoryModal.open();
        },
      },
      {
        Name: Languages.RentPeriod,
        IsDisplay: this.state.sellType.ID == 2,
        OnPress: () => {
          this.setState({OpenRentPeriodModal: true});
        },
      },
      {
        Name: Languages.FuelType,
        IsDisplay:
          this.state.sellType.ID == 1 &&
          (this.props.route.params?.ListingType?.ID == 1 ||
            this.props.route.params?.ListingType?.ID == 8),
        OnPress: () => {
          this.setState({OpenFuelTypesModal: true});
        },
      },
      {
        Name: Languages.Year,
        IsDisplay:
          (this.props.route.params?.ListingType?.ID == 32 &&
            this.state.selectedSection &&
            !this.state.selectedSection[0].All &&
            this.state.selectedSection[0].ID != 2048 &&
            this.state.selectedSection[0].ID != 4096 &&
            this.state.selectedSection[0].ID != 256) ||
          this.props.route.params?.ListingType?.ID != 32,
        OnPress: () => {
          this.yearModal.open();
        },
      },
      {
        Name: Languages.City,
        IsDisplay: this.props.ViewingCountry.cca2 != 'ALL',
        OnPress: () => {
          this.cityModal.open();
        },
      },
      {
        Name: Languages.GearBox,
        IsDisplay:
          this.state.sellType.ID == 1 &&
          this.props.route.params?.ListingType?.ID != 16 &&
          this.props.route.params?.ListingType?.ID != 32,
        OnPress: () => {
          this.setState({OpenGearBoxModal: true});
        },
      },

      {
        Name: Languages.Status,
        IsDisplay:
          this.state.sellType.ID != 2 &&
          this.state.sellType.ID != 7 &&
          !(
            this.props.route.params?.ListingType?.ID == 32 &&
            (this.state.selectedSection[0].ID == 2048 ||
              this.state.selectedSection[0].ID == 4096)
          ) &&
          //true
          (this.props.route.params?.ListingType?.ID != 32 ||
            this.state.sellType.ID != 4),
        OnPress: () => {
          this.setState({OpenStatusModal: true});
        },
      },
      {
        Name: Languages.Color,
        IsDisplay:
          this.state.sellType.ID == 1 &&
          (this.props.route.params?.ListingType?.ID == 1 ||
            this.props.route.params?.ListingType?.ID == 8 ||
            this.props.route.params?.ListingType?.ID == 2),
        OnPress: () => {
          this.setState({OpenColorModal: true});
        },
      },
      {
        Name: Languages.PaymentMethod,
        IsDisplay:
          this.state.sellType.ID == 1 &&
          this.props.route.params?.ListingType?.ID != 32,
        OnPress: () => {
          this.setState({OpenPaymentMethodModal: true});
        },
      },

      {
        Name: Languages.Price,
        IsDisplay:
          this.state.sellType.ID != 4 &&
          this.state.sellType.ID != 7 &&
          !(
            this.props.route.params?.ListingType?.ID == 32 &&
            (this.state.selectedSection[0].ID == 2048 ||
              this.state.selectedSection[0].ID == 4096)
          ),
        OnPress: () => {
          this.PriceModal.open();
        },
      },
      {
        Name:
          this.props.route.params?.ListingType?.ID == 4
            ? Languages.Hours
            : Languages.Mileage,
        IsDisplay:
          this.state.sellType.ID == 1 &&
          this.props.route.params?.ListingType?.ID != 32 &&
          this.props.route.params?.ListingType?.ID != 16,
        OnPress: () => {
          this.MileageModal.open();
        },
      },
      {
        Name: Languages.PartNumber,
        IsDisplay:
          this.props.route.params?.ListingType?.ID >= 32 &&
          !!this.state.Sections?.length &&
          !this.state.selectedSection?.some(
            item => item.ID === 4096 || item.ID === 2048,
          ), // Board 4096 , Accessories 2048 => not incloud 2048 OR 4096
        OnPress: () => {
          this.setState({OpenPartNumberModal: true});
        },
      },
    ];
  };

  handleDeleteFilter = ({Id, Type}) => {
    if (Type == 'A') {
      this.props.navigation.replace('SellTypeScreen', {
        ListingType: this.props.route.params?.ListingType,
        cca2: this.props.ViewingCountry?.cca2 || 'us',
      });
    } else if (Type === 'S' && ['4096', '2048'].includes(`${Id}`)) {
      this.props.navigation.navigate('HomeScreen');
    } else {
      this.setState(
        prevState => {
          let newState;

          switch (Type) {
            case 'S':
              newState = {
                selectedSection: prevState.selectedSection.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedSection?.length)
                newState = {
                  selectedSection: [All],
                  selectedMake: [AllMakes],
                  selectedModel: [All],
                  selectedCategory: [All],
                };
              break;
            case 'M':
              newState = {
                selectedMake: prevState.selectedMake.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedMake?.length)
                newState = {selectedMake: [AllMakes], selectedModel: [All]};
              break;
            case 'T':
              newState = {
                selectedCategory: prevState.selectedCategory.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedCategory?.length)
                newState = {selectedCategory: [All]};
              break;
            case 'O':
              newState = {
                selectedRentPeriod: prevState.selectedRentPeriod.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedRentPeriod?.length)
                newState = {selectedRentPeriod: [All]};
              break;
            case 'V':
              newState = {
                selectedStatus: prevState.selectedStatus.filter(
                  item => item.ID !== Id,
                ),
              };

              break;
            case 'D':
              newState = {
                selectedModel: prevState.selectedModel.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedModel?.length)
                newState = {selectedModel: [All]};
              break;
            case 'C':
              newState = {
                selectedCity: prevState.selectedCity.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedCity?.length)
                newState = {selectedCity: [All]};
              break;
            case 'G':
              newState = {
                selectedGearBox: prevState.selectedGearBox.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedGearBox?.length)
                newState = {selectedGearBox: [All]};
              break;
            case 'F':
              newState = {
                selectedFuelType: prevState.selectedFuelType.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedFuelType?.length)
                newState = {selectedFuelType: [All]};
              break;
            case 'P':
              newState = {
                selectedPaymentMethod: prevState.selectedPaymentMethod.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedPaymentMethod?.length)
                newState = {selectedPaymentMethod: [All]};
              break;
            case 'R':
              newState = {
                selectedColor: prevState.selectedColor.filter(
                  item => item.ID !== Id,
                ),
              };
              if (!newState.selectedColor?.length)
                newState = {selectedColor: [All]};
              break;
            case 'I':
              newState = {selectedMaxPrice: '', selectedMinPrice: ''};
              break;
            case 'K':
              newState = {selectedMaxMileage: '', selectedMinMileage: ''};
              break;
            case 'Y':
              newState = {selectedMaxYear: '', selectedMinYear: ''};
              break;
            default:
              console.warn(`نوع غير معروف: ${Type}`);
              return prevState;
          }

          // Check if any array-based state is empty and assign ['All']
          Object.keys(newState).forEach(key => {
            if (Array.isArray(newState[key]) && newState[key].length === 0) {
              newState[key] = [All];
            }
          });

          return newState;
        },
        () => {
          this.filterResults();
        },
      );
    }
  };

  componentDidMount() {
    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : '2',
    })
      .then(result => {
        if (result && result.Success) {
          this.setState({PrimaryCurrencies: result.Currencies});
          result.Currencies &&
            result.Currencies.forEach(cur => {
              if (global?.ViewingCurrency) {
                if (cur.ID == global?.ViewingCurrency?.ID) {
                  this.setState({currency: cur});
                }
              } else {
                if (cur.ID == this.props.ViewingCurrency?.ID) {
                  global.ViewingCurrency = cur;
                  this.setState({currency: cur});
                }
              }
            });
        } else {
          //should never happen, in case something goes wrong ill have fallback currencies
          this.setState({
            PrimaryCurrencies: [
              {
                ID: 2,
                Ratio: 1.0,
                Standard: true,
                Name: 'USD',
                Format: '$ {0}',
                Rank: 0,
                NumberFormat: 'N0',
                ShortName: 'USD',
                Primary: true,
              },
              {
                ID: 29,
                Ratio: 0.92,
                Standard: false,
                Name: 'Euro',
                Format: '€ {0}',
                Rank: 0,
                NumberFormat: 'N0',
                ShortName: 'EUR',
                Primary: true,
              },
            ],
          });
        }
      })
      .catch(err => {});

    if (this.state.Makes && this.state.Makes.length == 0) {
      this.setState({isMakesLoading: true});
      KS.MakesGet({
        langID: Languages.langID,
        listingType: getMakeParentId(
          this.props.route.params?.ListingType?.ID,
          this.state.selectedSection,
        ),
      }).then(data => {
        let AllMakes = {
          //  FullImagePath: "yaz",
          ID: '',
          All: true,
          Image: require('../images/SellTypes/BlueAll.png'),
          AllMake: true,
          Name: Languages.AllMakes,
        };
        data.unshift(AllMakes);
        this.setState({
          Makes: data,
          selectedMake: [this.props.route.params?.selectedMake ?? AllMakes],
          FullMakes: data,
          isMakesLoading: false,
        });
      });
    }
    KS.ColorsGet({langid: Languages.langID}).then(Colors => {
      Colors.unshift(All);
      this.setState({Colors});
    });

    if (!!this.props.route.params?.query) {
      this.setState({query: this.props.route.params?.query});
    }

    KS.ListingTypesGet({
      langID: Languages.langID,
      parentID: this.props.route.params?.ListingType?.ID,
    }).then(data => {
      this.setState({
        Sections:
          data?.filter(x => !['4096', '2048'].includes(`${x.ID}`)) ?? [],
      });
    });

    KS.TypeCategoriesGet({
      langID: Languages.langID,
      typeID: !!this.props.route.params?.selectedSection
        ? this.props.route.params?.selectedSection?.ID == '' //if coming from spareparts and selected all which ID is empty the API doesnt work, so i need to send her 32 to return empty array
          ? 32
          : this.props.route.params?.selectedSection?.ID
        : this.props.route.params?.ListingType?.ID,
    }).then(data => {
      this.setState({
        Categories: data,
      });
    });

    let years = [];
    for (let i = 1960; i <= new Date().getFullYear(); i++) {
      years.push(i.toString());
    }
    if (new Date().getMonth() >= 8) {
      years.push((new Date().getFullYear() + 1).toString());
    }
    let reversedYears = years.reverse();
    this.setState({
      minYearsList: reversedYears,
      maxYearsList: reversedYears,
      FullminYearsList: reversedYears,
      FullmaxYearsList: reversedYears,
      minPricesList: Constants.FilterPriceSuggestions,
      maxPricesList: Constants.FilterPriceSuggestions,
      FullminPricesList: Constants.FilterPriceSuggestions,
      FullmaxPricesList: Constants.FilterPriceSuggestions,
      minMileagesList: Constants.FilterMileageSuggestions,
      maxMileagesList: Constants.FilterMileageSuggestions,
      FullminMileagesList: Constants.FilterMileageSuggestions,
      FullmaxMileagesList: Constants.FilterMileageSuggestions,
    });

    this.setState({
      sellType: this.props.route.params?.SellType || 7,
      selectedMake: [this.props.route.params?.selectedMake || {ID: ''}],
      selectedModel: [this.props.route.params?.selectedModel || All],
    });

    const _params = {
      typeID: (this.props.route.params?.ListingType || {ID: ''}).ID || '',
      langid: Languages.langID,
      PageNum: 1,
      pagesize: PageSize,
      makeID: (this.props.route.params?.selectedMake || {ID: ''}).ID || '',
      modelid: (this.props.route.params?.selectedModel || {ID: ''}).ID || '',
      sellType: (this.props.route.params?.SellType || {ID: ''}).ID || '',
      categoryid:
        this.props.route.params?.CategoryID ||
        this.props.route.params?.selectedCategory?.ID ||
        '',
      section: this.props.route.params?.SectionID || '',
      fuelType:
        (this.props.route.params?.selectedFuelType || {ID: ''}).ID || '',
      paymentMethod: this.props.route.params?.selectedPaymentMethod
        ? this.props.route.params?.selectedPaymentMethod.ID
        : null,
      isocode: this.props.ViewingCountry.cca2 || '',
      cur: this.state.currency?.ID || '',
      partNumber: this.state.PartNumber,
      condition:
        (this.state.selectedStatus &&
          this.state.selectedStatus
            .map(item => item.ID)
            .reduce((a, b) => a + b, '')) ||
        '',
    };

    this.props.recentFilterSeach(_params, this.selectedFilters());

    KS.ListingsGet(_params).then(data => {
      if (data.Success) {
        this.countListingsViews(
          data.Listings.map(x => x.ID),
          1,
          data.Pages,
        );

        this.setState({
          Listings: data.Listings,
          NoRelatedOffers: data.NoRelatedOffers,
          NumberOfIntrested: data.NumberOfIntrested,
          ISOCode: data.ISOCode,
          isLoading: false,
          maximumPages: data.Pages,
          btnloader: false,
        });
      }
    });

    KS.CitiesGet({
      langID: Languages.langID,
      isoCode: this.props.ViewingCountry.cca2 || '',
    }).then(Cities => {
      Cities.unshift(All);
      this.setState({Cities, fullCities: Cities});
      this.setState({isCitiesLoading: false});
    });

    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 2,
      selltype: (this.props.route.params?.SellType || {ID: 1}).ID,
    }).then(data => {
      if (data && data.Success == '1' && data.Banners?.length > 0) {
        this.setState(
          {
            Banners: data.Banners,
          },
          () => {
            this.state.Banners?.map(item => {
              KS.BannerViewed(item.ID);
            });
          },
        );
      }
    });

    setTimeout(() => {
      if (!!this.props.route.params?.shouldOpenFilter) {
        this.filterModal?.open();
      }
    }, 2000);
  }

  countListingsViews(Ids, Page, Pages) {
    if (Page < 2) ViewsIds = [];

    if (Pages < 2 /* equal 0 OR 1 */) {
      ViewsIds = Ids;
      !!ViewsIds.length && KS.IncreaseScViews(ViewsIds);
    } else if (Pages == 2 && Page == 2) {
      ViewsIds = ViewsIds.concat(Ids);
      !!ViewsIds.length && KS.IncreaseScViews(ViewsIds);
    } else if (Page < 3) {
      ViewsIds = ViewsIds.concat(Ids);
    } else {
      !!ViewsIds.length && KS.IncreaseScViews(ViewsIds);
      ViewsIds = Ids;
      if (Pages == Page) !!ViewsIds.length && KS.IncreaseScViews(ViewsIds);
    }
  }

  async filterResults(onEndReached = false, asc, sortBy) {
    if (this.filterController) {
      this.filterController.abort(); // cancel previous
    }
    this.filterController = new AbortController();

    if (!onEndReached) {
      this.setState({isLoading: true, page: 1, showLoadMore: false});
      this.onScrollHandler({nativeEvent: {contentOffset: {y: 0}}}); // to re open enaimated header
    } else {
      this.setState({footerLoading: true, showLoadMore: false});
    }

    let _page = onEndReached ? this.state.page : 1;
    if (!onEndReached) {
      this.filterModal.close();
    }
    const _params = {
      asc: asc ? (asc == 'false' ? false : true) : false, // if it was sent check the string for true or false because i don want it to resolve to true always
      sortBy: sortBy ? sortBy : 'date',
      typeID: this.props.route.params?.ListingType?.ID || '',
      langid: Languages.langID,
      PageNum: _page,
      pagesize: PageSize,
      makeID:
        (this.state.selectedMake &&
          this.state.selectedMake.map(item => item.ID).join(',')) ||
        '',
      modelid:
        (this.state.selectedModel &&
          this.state.selectedModel.map(item => item.ID) &&
          this.state.selectedModel.map(item => item.ID).join(',')) != 'NaN'
          ? this.state.selectedModel &&
            this.state.selectedModel.map(item => item.ID) &&
            this.state.selectedModel.map(item => item.ID).join(',')
          : '',
      cityID:
        (this.state.selectedCity &&
          this.state.selectedCity.map(item => item.ID).join(',')) ||
        '',
      color:
        (this.state.selectedColor &&
          this.state.selectedColor.map(item => item.ID).join(',')) ||
        '',
      categoryid:
        (this.state.selectedCategory &&
          this.state.selectedCategory.map(item => item.ID).join(',')) ||
        '',

      sellType: this.state.sellType.ID || '',

      fuelType:
        (this.state.selectedFuelType &&
          this.state.selectedFuelType
            .map(item => item.ID)
            .reduce((a, b) => a + b, 0)) ||
        '',

      minyear: this.state.selectedMinYear || '',
      maxYear: this.state.selectedMaxYear || '',
      minPrice: this.state.selectedMinPrice || '',
      maxPrice: this.state.selectedMaxPrice || '',
      minConsumption: this.state.selectedMinMileage || '',
      maxConsumption: this.state.selectedMaxMileage || '',
      condition:
        (this.state.selectedStatus &&
          this.state.selectedStatus
            .map(item => item.ID)
            .reduce((a, b) => a + b, 0)) ||
        '',
      gearBox:
        (this.state.selectedGearBox &&
          this.state.selectedGearBox
            .map(item => item.ID)
            .reduce((a, b) => a + b, 0)) ||
        '',
      paymentMethod:
        (this.state.selectedPaymentMethod &&
          this.state.selectedPaymentMethod
            .map(item => item.ID)
            .reduce((a, b) => a + b, 0)) ||
        '',
      rentPeriod:
        (this.state.selectedRentPeriod &&
          this.state.selectedRentPeriod
            .map(item => item.ID)
            .reduce((a, b) => a + b, 0)) ||
        '',

      section:
        (this.state.selectedSection && this.state.selectedSection[0].ID) || '',
      isocode: this.props.ViewingCountry.cca2 || '',
      cur: this.state.currency?.ID || '',
      partNumber: this.state.PartNumber,
    };

    this.props.recentFilterSeach(_params, this.selectedFilters());
    KS.ListingsGet(_params, null, this.filterController?.signal).then(data => {
      if (data.Success) {
        this.countListingsViews(
          data.Listings.map(x => x.ID),
          _page,
          data.Pages,
        );

        if (onEndReached) {
          let concattedListings = this.state.Listings;
          let tempBanners = this.state.Banners || [];

          if (this.state.Banners?.length > 0) {
            concattedListings.push({
              AutoBeebBanner: true,
              BannerDetails: tempBanners.shift(),
            });
            this.setState({Banners: tempBanners});
            concattedListings.push({skipForAutoBeebBanner: true});
          }

          concattedListings = concattedListings.concat(data.Listings);

          this.setState({
            Listings: concattedListings,
            maximumPages: data.Pages,
            NoRelatedOffers: data.NoRelatedOffers,
            NumberOfIntrested: data.NumberOfIntrested,
            isLoading: false,
            btnloader: false,
          });

          setTimeout(() => {
            this.setState({footerLoading: false});
          }, 1000);
        } else {
          this.setState({
            Listings: data.Listings,
            ISOCode: data.ISOCode,
            NoRelatedOffers: data.NoRelatedOffers,
            NumberOfIntrested: data.NumberOfIntrested,
            maximumPages: data.Pages,
            isLoading: false,
            query: undefined,
            btnloader: false,
          });
        }
      }
    });
  }

  renderCatRow({item}) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          this.props.navigation.navigate('ListingsScreen', {
            Category: this.props.route.params?.Category ?? 0,
            SubCategory: this.props.route.params?.SubCategory ?? 0,
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {item.img && (
            <FastImage
              style={{width: 30, height: 30}}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../images/bmwLogo.png')}
            />
          )}
          <Text style={{color: '#333', marginLeft: 20, fontSize: 24}}>
            {item.make}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  renderItem({item, index}) {
    if (item.skip && this.state.renderType != 1) {
      return <View></View>;
    }
    if (item.skipForAutoBeebBanner && this.state.renderType != 1) {
      return <View></View>;
    }
    if (item.Banner && this.state.renderType == 1) {
      return <View></View>;
    }

    if (item.AutoBeebBanner) {
      //  KS.BannerViewed(item.BannerDetails.ID);
      return (
        <TouchableOpacity
          disabled={!item.BannerDetails.Link}
          style={{
            width: Dimensions.get('window').width,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={async () => {
            let url = item.BannerDetails.Link;
            if (!url) return;

            KS.BannerClick({
              bannerID: item.BannerDetails.ID,
            });

            const {screen, params} = await ExtractScreenObjFromUrl(url);
            if (!!screen) {
              this.props.navigation.navigate(screen, !!params && params);
            } else {
              Linking.openURL(url);
            }
          }}>
          <Image
            resizeMode="contain"
            source={{
              uri: `https://autobeeb.com/${item.BannerDetails.FullImagePath}.png`,
            }}
            style={{
              //  marginVertical: 10,
              alignSelf: 'center',
              width: Dimensions.get('window').width * 0.8,
              height: (Dimensions.get('window').width * 0.8) / 1.8,
              marginBottom: 8,
            }}
          />
        </TouchableOpacity>
      );
    } else {
      switch (item.IsSpecial ? 4 : this.state.renderType) {
        case 1:
          return (
            <MainListingsComponent
              item={item}
              key={index}
              AllCountries={
                `${this.props.ViewingCountry.cca2}`.toLocaleLowerCase() == 'all'
              }
              AppCountryCode={this.props.ViewingCountry.cca2}
              navigation={this.props.navigation}
              imageStyle={styles.MainListingsComponentImage}
              itemStyle={styles.MainListingsComponentItem}
              SelectedCities={this.state.selectedCity}
              // isListingsScreen
            />
          );

        case 2:
          return (
            <BannerListingsComponent
              key={index}
              AllCountries={
                `${this.props.ViewingCountry.cca2}`.toLocaleLowerCase() == 'all'
              }
              AppCountryCode={this.props.ViewingCountry.cca2}
              item={item}
              navigation={this.props.navigation}
              SelectedCities={this.state.selectedCity}
              // isListingsScreen
            />
          );
        case 4:
          return (
            <FeatueredListingCard
              key={index}
              AllCountries={
                `${this.props.ViewingCountry.cca2}`.toLocaleLowerCase() == 'all'
              }
              AppCountryCode={this.props.ViewingCountry.cca2}
              item={item}
              navigation={this.props.navigation}
              SelectedCities={this.state.selectedCity}
              // isListingsScreen
            />
          );
      }
    }
  }
  renderMinYearItem({item, index}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          //    backgroundColor: "red",
          width: Dimensions.get('screen').width * 0.3,

          alignItems: 'center',
          marginBottom: 15,
          justifyContent: 'center',
        }}
        onPress={() => {
          this.setState({minYear: item});

          let maxYears = this.state.FullmaxYearsList;

          maxYears = maxYears.filter(year => parseInt(year) >= parseInt(item));
          // alert(JSON.stringify(maxYears));
          this.setState({maxYearsList: maxYears});
        }}>
        <IconMa
          name={
            this.state.minYear == item
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={this.state.minYear == item ? Color.secondary : '#000'}
          style={{marginRight: 5, position: 'absolute', left: 0}}
        />
        <Text style={{textAlign: 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
  }

  renderMinPriceItem({item, index}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          //    backgroundColor: "red",
          width: Dimensions.get('screen').width * 0.3,

          alignItems: 'center',
          marginBottom: 15,
          justifyContent: 'center',
        }}
        onPress={() => {
          this.setState({minPrice: item});
          //  alert(JSON.stringify(item))
          let maxPrices = this.state.FullmaxPricesList;

          maxPrices = maxPrices.filter(
            Price => parseInt(Price) > parseInt(item),
          );
          // alert(JSON.stringify(maxPrices));
          this.setState({maxPricesList: maxPrices});
        }}>
        <IconMa
          name={
            this.state.minPrice == item
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={this.state.minPrice == item ? Color.secondary : '#000'}
          style={{marginRight: 5, position: 'absolute', left: 0}}
        />
        <Text style={{textAlign: 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
  }

  renderMinMileageItem({item, index}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          //    backgroundColor: "red",
          width: Dimensions.get('screen').width * 0.3,

          alignItems: 'center',
          marginBottom: 15,
          justifyContent: 'center',
        }}
        onPress={() => {
          this.setState({minMileage: item});

          let maxMileages = this.state.FullmaxMileagesList;

          maxMileages = maxMileages.filter(
            Mileage => parseInt(Mileage) > parseInt(item),
          );
          // alert(JSON.stringify(maxMileages));
          this.setState({maxMileagesList: maxMileages});
        }}>
        <IconMa
          name={
            this.state.minMileage == item
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={this.state.minMileage == item ? Color.secondary : '#000'}
          style={{marginRight: 5, position: 'absolute', left: 0}}
        />
        <Text style={{textAlign: 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
  }

  renderMaxYearItem({item, index}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          //    backgroundColor: "red",
          width: Dimensions.get('screen').width * 0.3,

          alignItems: 'center',
          marginBottom: 15,
          justifyContent: 'center',
        }}
        onPress={() => {
          this.setState({maxYear: item});
          let minYears = this.state.FullminYearsList;

          minYears = minYears.filter(year => parseInt(year) <= parseInt(item));
          // alert(JSON.stringify(minYears));
          this.setState({minYearsList: minYears});
        }}>
        <IconMa
          name={
            this.state.maxYear == item
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={this.state.maxYear == item ? Color.secondary : '#000'}
          style={{marginRight: 5, position: 'absolute', left: 0}}
        />
        <Text style={{textAlign: 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
  }

  renderMaxPriceItem({item, index}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          //    backgroundColor: "red",
          width: Dimensions.get('screen').width * 0.3,

          alignItems: 'center',
          marginBottom: 15,
          justifyContent: 'center',
        }}
        onPress={() => {
          this.setState({maxPrice: item});
          let minPrices = this.state.FullminPricesList;

          minPrices = minPrices.filter(
            Price => parseInt(Price) < parseInt(item),
          );
          // alert(JSON.stringify(minPrices));
          this.setState({minPricesList: minPrices});
        }}>
        <IconMa
          name={
            this.state.maxPrice == item
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={this.state.maxPrice == item ? Color.secondary : '#000'}
          style={{marginRight: 5, position: 'absolute', left: 0}}
        />
        <Text style={{textAlign: 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
  }
  renderMaxMileageItem({item, index}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          //    backgroundColor: "red",
          width: Dimensions.get('screen').width * 0.3,

          alignItems: 'center',
          marginBottom: 15,
          justifyContent: 'center',
        }}
        onPress={() => {
          this.setState({maxMileage: item});
          let minMileages = this.state.FullminMileagesList;

          minMileages = minMileages.filter(
            Mileage => parseInt(Mileage) < parseInt(item),
          );
          // alert(JSON.stringify(minMileages));
          this.setState({minMileagesList: minMileages});
        }}>
        <IconMa
          name={
            this.state.maxMileage == item
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={this.state.maxMileage == item ? Color.secondary : '#000'}
          style={{marginRight: 5, position: 'absolute', left: 0}}
        />
        <Text style={{textAlign: 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
  }

  keyExtractor = (item, index) => `${index}-${item?.ID}`;

  renderSortBox = (text, icon, onPress) => {
    return (
      <TouchableOpacity
        style={[
          styles.sortContainerBox,
          ,
          icon == 'list' && {
            maxWidth: Dimensions.get('screen').width * 0.42,
            overflow: 'hidden',
          },
        ]}
        onPress={() => {
          onPress();
        }}>
        <IconFa name={icon} size={20} color={'#000'} style={{marginRight: 5}} />
        <Text
          style={[
            styles.sortContainerText,

            icon == 'list' && {
              maxWidth: Dimensions.get('screen').width * 0.41,
              overflow: 'hidden',
            },
          ]}
          numberOfLines={1}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  };

  renderSectionHeader = text => {
    return (
      <View style={styles.FilterSectionHeader}>
        <Text style={styles.FilterSectionHeaderText}>{text}</Text>
      </View>
    );
  };

  renderSectionValue = (text, onPress) => {
    return (
      <TouchableOpacity
        style={[styles.filterValueContainer]}
        onPress={() => {
          onPress();
        }}>
        <Text
          numberOfLines={3}
          style={{flex: 10, textAlign: 'left', color: '#383737'}}>
          {text}
        </Text>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={25}
          color={Color.secondary}
          style={{flex: 1}}
        />
      </TouchableOpacity>
    );
  };
  renderOkButton(onPress) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderTopColor: '#ccc',
          borderTopWidth: 1,

          justifyContent: 'center',
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          backgroundColor: '#fff',
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: Color.secondary,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
          }}
          onPress={() => {
            onPress();
          }}>
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              paddingVertical: 14,
              fontSize: 15,
            }}>
            {Languages.OK}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderOkCancelButton(onCancelPress, onOkPress) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          //  borderTopColor: "#ccc",
          //  borderTopWidth: 1,
          //  padding: 8,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,

          justifyContent: 'center',
          //    backgroundColor: "#ff0"
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#fff',
          }}
          onPress={() => {
            onCancelPress();
          }}>
          <Text
            style={{
              color: Color.secondary,
              textAlign: 'center',
              paddingVertical: 14,
              fontFamily: 'Cairo-Bold',
              fontSize: 15,
            }}>
            {Languages.CANCEL}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: Color.secondary,
            borderRadius: 5,
          }}
          onPress={() => {
            onOkPress();
          }}>
          <View
            style={{
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {this.state.btnloader ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  textAlign: 'center',
                }}>
                {Languages.OK}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderGearBoxSelect() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        horizontal
        data={this.filterGearBox}
        style={{
          padding: 10,

          alignSelf: 'flex-start',
        }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={[
                {
                  backgroundColor: '#ddd',
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  marginRight: 5,
                },
                this.state.selectedGearBox.filter(make => make.ID == item.ID)
                  .length > 0 && {
                  backgroundColor: Color.secondary,
                },
              ]}
              onPress={() => {
                if (item.All) {
                  this.setState({selectedGearBox: [item]});
                } else if (
                  this.state.selectedGearBox.filter(make => make.ID == item.ID)
                    .length > 0 //make is already selected
                ) {
                  let makes = this.state.selectedGearBox.filter(
                    make => make.ID != item.ID,
                  );
                  if (makes.length == 0) {
                    // if resut is zero , make all the selected
                    makes.unshift(All);
                  }
                  this.setState({
                    selectedGearBox: makes,
                  });
                } else {
                  let makes = this.state.selectedGearBox.filter(
                    make => make.ID > 0,
                  );
                  makes.push(item);
                  this.setState({
                    selectedGearBox: makes,
                  });
                }
              }}>
              <Text
                style={[
                  {color: '#000', fontSize: 16},
                  this.state.selectedGearBox.filter(make => make.ID == item.ID)
                    .length > 0 && {
                    color: 'white',
                  },
                ]}>
                {item.Name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  renderFuelTypeSelect() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        horizontal
        data={this.FilterFuelTypes}
        style={{
          padding: 10,

          //    backgroundColor: "red"
        }}
        contentContainerStyle={{
          paddingHorizontal: Languages.langID == 2 ? 20 : 0,
        }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={[
                {
                  backgroundColor: '#ddd',
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  marginRight: 5,
                },
                this.state.selectedFuelType.filter(make => make.ID == item.ID)
                  .length > 0 && {
                  backgroundColor: Color.secondary,
                },
              ]}
              onPress={() => {
                if (item.All) {
                  this.setState({selectedFuelType: [item]});
                } else if (
                  this.state.selectedFuelType.filter(make => make.ID == item.ID)
                    .length > 0 //make is already selected
                ) {
                  let makes = this.state.selectedFuelType.filter(
                    make => make.ID != item.ID,
                  );
                  if (makes.length == 0) {
                    // if resut is zero , make all the selected
                    makes.unshift(All);
                  }
                  this.setState({
                    selectedFuelType: makes,
                  });
                } else {
                  let makes = this.state.selectedFuelType.filter(
                    make => make.ID > 0,
                  );
                  makes.push(item);
                  this.setState({
                    selectedFuelType: makes,
                  });
                }
              }}>
              <Text
                style={[
                  {color: '#000', fontSize: 16},
                  this.state.selectedFuelType.filter(make => make.ID == item.ID)
                    .length > 0 && {
                    color: 'white',
                  },
                ]}>
                {item.Name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  renderRentPeriodSelect() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        horizontal
        data={this.FilterRentPeriod}
        style={{
          padding: 10,
          alignSelf: 'flex-start',
        }}
        contentContainerStyle={{
          paddingHorizontal: Languages.langID == 2 ? 20 : 0,
        }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={[
                {
                  backgroundColor: '#ddd',
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  marginRight: 5,
                },
                this.state.selectedRentPeriod.filter(make => make.ID == item.ID)
                  .length > 0 && {
                  backgroundColor: Color.secondary,
                },
              ]}
              onPress={() => {
                if (item.All) {
                  this.setState({selectedRentPeriod: [item]});
                } else if (
                  this.state.selectedRentPeriod.filter(
                    make => make.ID == item.ID,
                  ).length > 0 //make is already selected
                ) {
                  let makes = this.state.selectedRentPeriod.filter(
                    make => make.ID != item.ID,
                  );
                  if (makes.length == 0) {
                    // if resut is zero , make all the selected
                    makes.unshift(All);
                  }
                  this.setState({
                    selectedRentPeriod: makes,
                  });
                } else {
                  let makes = this.state.selectedRentPeriod.filter(
                    make => make.ID > 0,
                  );
                  makes.push(item);
                  this.setState({
                    selectedRentPeriod: makes,
                  });
                }
              }}>
              <Text
                style={[
                  {color: '#000', fontSize: 16},
                  this.state.selectedRentPeriod.filter(
                    make => make.ID == item.ID,
                  ).length > 0 && {
                    color: 'white',
                  },
                ]}>
                {item.Name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  renderSellTypesRow(SellType) {
    if (this.props.route.params?.ListingType?.ID == 32 && SellType.ID == 2) {
      // hide "rent" from spare parts
      return;
    }
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          this.setState({sellType: SellType, page: 1, isLoading: true}, () => {
            this.ResetFilters();
            this.SellTypeModal.close();

            const _params = {
              typeID: this.props.route.params?.ListingType?.ID || '',
              langid: Languages.langID,
              PageNum: 1,
              pagesize: PageSize,
              makeID:
                (this.state.selectedMake &&
                  this.state.selectedMake.map(item => item.ID).join(',')) ||
                '',
              modelid:
                (this.state.selectedModel &&
                  this.state.selectedModel.map(item => item.ID).join(',')) ||
                '',
              cityID:
                (this.state.selectedCity &&
                  this.state.selectedCity.map(item => item.ID).join(',')) ||
                '',
              color:
                (this.state.selectedColor &&
                  this.state.selectedColor.map(item => item.ID).join(',')) ||
                '',
              sellType: SellType.ID,

              categoryid:
                (this.state.selectedCategory &&
                  this.state.selectedCategory
                    .map(item => item.ID)
                    .reduce((a, b) => a + b, '')) ||
                '',

              fuelType:
                (this.state.selectedFuelType &&
                  this.state.selectedFuelType
                    .map(item => item.ID)
                    .reduce((a, b) => a + b, '')) ||
                '',

              minyear: this.state.selectedMinYear || '',
              maxYear: this.state.selectedMaxYear || '',
              minPrice: this.state.selectedMinPrice || '',
              maxPrice: this.state.selectedMaxPrice || '',
              minConsumption: this.state.selectedMinMileage || '',
              maxConsumption: this.state.selectedMaxMileage || '',
              condition:
                (this.state.selectedStatus &&
                  this.state.selectedStatus
                    .map(item => item.ID)
                    .reduce((a, b) => a + b, '')) ||
                '',
              gearBox:
                (this.state.selectedGearBox &&
                  this.state.selectedGearBox
                    .map(item => item.ID)
                    .reduce((a, b) => a + b, '')) ||
                '',
              paymentMethod:
                (this.state.selectedPaymentMethod &&
                  this.state.selectedPaymentMethod
                    .map(item => item.ID)
                    .reduce((a, b) => a + b, '')) ||
                '',
              rentPeriod:
                (this.state.selectedRentPeriod &&
                  this.state.selectedRentPeriod
                    .map(item => item.ID)
                    .reduce((a, b) => a + b, '')) ||
                '',

              section:
                (this.state.selectedSection &&
                  this.state.selectedSection[0].ID) ||
                '',
              isocode: this.props.ViewingCountry.cca2 || '',
              cur: this.state.currency?.ID || '',
              partNumber: this.state.PartNumber,
            };

            this.props.recentFilterSeach(_params, this.selectedFilters());

            KS.ListingsGet(_params).then(data => {
              if (data.Success) {
                this.countListingsViews(
                  data.Listings.map(x => x.ID),
                  1,
                  data.Pages,
                );

                this.setState({
                  Listings: data.Listings,
                  ISOCode: data.ISOCode,
                  footerLoading: false,
                  maximumPages: data.Pages,
                  NoRelatedOffers: data.NoRelatedOffers,
                  NumberOfIntrested: data.NumberOfIntrested,
                  isLoading: false,
                  btnloader: false,
                });
              }
              this.SellTypeModal.close();
            });
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 6,
            justifyContent: 'center',
          }}>
          <FastImage
            style={{
              width: SellType.ID == 7 || SellType.ID == 4 ? 40 : 40,
              height: SellType.ID == 7 || SellType.ID == 4 ? 25 : 40,
              flex: 1,
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={SellType.img}
          />
          <Text
            style={{
              color: '#000',
              marginLeft: 20,
              fontSize: 26,
              flex: 5,
              textAlign: 'left',
            }}>
            {SellType.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  renderCurrencyRow(Currency) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          global.ViewingCurrency = Currency;
          //  this.props.setViewingCurrency(Currency);
          this.setState({currency: Currency, page: 1, isLoading: true});
          //   this.ResetFilters();
          this.CurrencyModal.close();
          const _params = {
            asc: this.state.sortOption ? this.state.sortOption.asc : 'false', // if it was sent check the string for true or false because i don want it to resolve to true always
            sortBy: this.state.sortOption
              ? this.state.sortOption.sortBy
              : 'date',

            typeID: this.props.route.params?.ListingType?.ID || '',
            langid: Languages.langID,
            PageNum: 1,
            pagesize: PageSize,
            makeID:
              (this.state.selectedMake &&
                this.state.selectedMake.map(item => item.ID).join(',')) ||
              '',
            modelid:
              (this.state.selectedModel &&
                this.state.selectedModel.map(item => item.ID).join(',')) ||
              '',
            cityID:
              (this.state.selectedCity &&
                this.state.selectedCity.map(item => item.ID).join(',')) ||
              '',
            color:
              (this.state.selectedColor &&
                this.state.selectedColor.map(item => item.ID).join(',')) ||
              '',
            cur: Currency.ID,
            sellType: this.state.sellType.ID || '',

            categoryid:
              (this.state.selectedCategory &&
                this.state.selectedCategory
                  .map(item => item.ID)
                  .reduce((a, b) => a + b, '')) ||
              '',

            fuelType:
              (this.state.selectedFuelType &&
                this.state.selectedFuelType
                  .map(item => item.ID)
                  .reduce((a, b) => a + b, '')) ||
              '',

            minyear: this.state.selectedMinYear || '',
            maxYear: this.state.selectedMaxYear || '',
            minPrice: this.state.selectedMinPrice || '',
            maxPrice: this.state.selectedMaxPrice || '',
            minConsumption: this.state.selectedMinMileage || '',
            maxConsumption: this.state.selectedMaxMileage || '',
            condition:
              (this.state.selectedStatus &&
                this.state.selectedStatus
                  .map(item => item.ID)
                  .reduce((a, b) => a + b, '')) ||
              '',
            gearBox:
              (this.state.selectedGearBox &&
                this.state.selectedGearBox
                  .map(item => item.ID)
                  .reduce((a, b) => a + b, '')) ||
              '',
            paymentMethod:
              (this.state.selectedPaymentMethod &&
                this.state.selectedPaymentMethod
                  .map(item => item.ID)
                  .reduce((a, b) => a + b, '')) ||
              '',
            rentPeriod:
              (this.state.selectedRentPeriod &&
                this.state.selectedRentPeriod
                  .map(item => item.ID)
                  .reduce((a, b) => a + b, '')) ||
              '',

            section:
              (this.state.selectedSection &&
                this.state.selectedSection[0].ID) ||
              '',
            isocode: this.props.ViewingCountry.cca2 || '',
            partNumber: this.state.PartNumber,
          };

          this.props.recentFilterSeach(_params, this.selectedFilters());

          KS.ListingsGet(_params).then(data => {
            if (data.Success) {
              this.countListingsViews(
                data.Listings.map(x => x.ID),
                1,
                data.Pages,
              );

              this.setState({
                Listings: data.Listings,
                ISOCode: data.ISOCode,
                footerLoading: false,
                maximumPages: data.Pages,
                NoRelatedOffers: data.NoRelatedOffers,
                NumberOfIntrested: data.NumberOfIntrested,
                isLoading: false,
                btnloader: false,
              });
            }
            this.CurrencyModal.close();
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 6,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color:
                this.state.currency.ID == Currency.ID ? Color.primary : '#000',
              marginLeft: 20,
              fontSize: 23,
              flex: 5,
              textAlign: 'left',
            }}>
            {Currency.Name}
          </Text>
        </View>
        <IconMa
          name={
            this.state.currency.ID == Currency.ID
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={25}
          color={this.state.currency.ID == Currency.ID ? Color.primary : '#000'}
        />
      </TouchableOpacity>
    );
  }

  renderSortOptionRow(SortOption) {
    return (
      <TouchableOpacity
        key={SortOption.ID}
        activeOpacity={0.5}
        style={styles.row}
        onPress={() => {
          this.setState({sortOption: SortOption, page: 1});
          this.filterResults(false, SortOption.asc, SortOption.sortBy);
          this.SortModal.close();
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 6,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#000',
              marginLeft: 20,
              fontSize: 20,
              flex: 5,
              textAlign: 'left',
            }}>
            {SortOption.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  renderStatusSelect() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        horizontal
        data={this.FilterOfferCondition}
        style={{
          padding: 10,
          alignSelf: 'flex-start',
        }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={[
                {
                  backgroundColor: '#ddd',
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  marginRight: 5,
                },
                this.state.selectedStatus.filter(make => make.ID == item.ID)
                  .length > 0 && {
                  backgroundColor: Color.secondary,
                },
              ]}
              onPress={() => {
                if (item.All) {
                  this.setState({selectedStatus: [item]});
                } else if (
                  this.state.selectedStatus.filter(make => make.ID == item.ID)
                    .length > 0 //make is already selected
                ) {
                  let makes = this.state.selectedStatus.filter(
                    make => make.ID != item.ID,
                  );
                  if (makes.length == 0) {
                    // if resut is zero , make all the selected
                    makes.unshift(All);
                  }
                  this.setState({
                    selectedStatus: makes,
                  });
                } else {
                  let makes = this.state.selectedStatus.filter(
                    make => make.ID > 0,
                  );
                  makes.push(item);
                  this.setState({
                    selectedStatus: makes,
                  });
                }
              }}>
              <Text
                style={[
                  {color: '#000', fontSize: 16},
                  this.state.selectedStatus.filter(make => make.ID == item.ID)
                    .length > 0 && {
                    color: 'white',
                  },
                ]}>
                {item.Name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  renderColorSelect() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        horizontal
        data={this.state.Colors}
        style={{
          paddingVertical: 10,
          alignSelf: 'flex-start',
        }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              onPress={() => {
                if (item.All) {
                  this.setState({selectedColor: [item]});
                } else if (
                  this.state.selectedColor.filter(make => make.ID == item.ID)
                    .length > 0 //make is already selected
                ) {
                  let makes = this.state.selectedColor.filter(
                    make => make.ID != item.ID,
                  );
                  if (makes.length == 0) {
                    // if resut is zero , make all the selected
                    makes.unshift(All);
                  }
                  this.setState({
                    selectedColor: makes,
                  });
                } else {
                  let makes = this.state.selectedColor.filter(
                    make => make.ID > 0,
                  );
                  makes.push(item);
                  this.setState({
                    selectedColor: makes,
                  });
                }
              }}>
              <View
                style={[
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginHorizontal: 5,
                    borderRadius: 30,
                    width: 60,
                    height: 60,
                    backgroundColor: '#e6e6e6',
                  },
                  this.state.selectedColor.filter(make => make.ID == item.ID)
                    .length > 0 && {
                    borderWidth: 2,
                    borderColor: '#1C7EA5',
                  },
                ]}>
                {this.state.selectedColor.filter(make => make.ID == item.ID)
                  .length > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      zIndex: 10,
                      right: -3,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      overflow: 'hidden',
                      backgroundColor: Color.secondary,
                    }}>
                    <IconMC name={'check'} color={'white'} size={17} />
                  </View>
                )}

                {item.All ? (
                  <Text style={{}}>{Languages.All}</Text>
                ) : (
                  <View
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 17,
                      backgroundColor: item.Value,
                    }}
                  />
                )}
              </View>
              <Text style={{textAlign: 'center'}}>{item.Label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  renderPaymentMethodSelect() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        horizontal
        data={this.FilterPaymentMethods}
        style={{
          padding: 10,
          alignSelf: 'flex-start',
        }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={[
                {
                  backgroundColor: '#ddd',
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  marginRight: 5,
                },
                this.state.selectedPaymentMethod.filter(
                  make => make.ID == item.ID,
                ).length > 0 && {
                  backgroundColor: Color.secondary,
                },
              ]}
              onPress={() => {
                if (item.All) {
                  this.setState({selectedPaymentMethod: [item]});
                } else if (
                  this.state.selectedPaymentMethod.filter(
                    make => make.ID == item.ID,
                  ).length > 0 //make is already selected
                ) {
                  let makes = this.state.selectedPaymentMethod.filter(
                    make => make.ID != item.ID,
                  );
                  if (makes.length == 0) {
                    // if resut is zero , make all the selected
                    makes.unshift(All);
                  }
                  this.setState({
                    selectedPaymentMethod: makes,
                  });
                } else {
                  let makes = this.state.selectedPaymentMethod.filter(
                    make => make.ID > 0,
                  );
                  makes.push(item);
                  this.setState({
                    selectedPaymentMethod: makes,
                  });
                }
              }}>
              <Text
                style={[
                  {color: '#000', fontSize: 16},
                  this.state.selectedPaymentMethod.filter(
                    make => make.ID == item.ID,
                  ).length > 0 && {
                    color: 'white',
                  },
                ]}>
                {item.Name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  renderPriceSelect() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          justifyContent: 'space-around',
        }}>
        <TouchableOpacity
          style={styles.rangeBox}
          onPress={() => {
            this.PriceModal.open();
          }}>
          <Text style={styles.rangeBoxText}>
            {this.state.selectedMinPrice
              ? this.state.selectedMinPrice
              : Languages.From}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rangeBox}
          onPress={() => {
            this.PriceModal.open();
          }}>
          <Text style={styles.rangeBoxText}>
            {this.state.selectedMaxPrice
              ? this.state.selectedMaxPrice
              : Languages.RangeTo}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderYearSelect() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          justifyContent: 'space-around',
        }}>
        <TouchableOpacity
          style={styles.rangeBox}
          onPress={() => {
            this.yearModal.open();
          }}>
          <Text style={styles.rangeBoxText}>
            {this.state.selectedMinYear
              ? this.state.selectedMinYear
              : Languages.From}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rangeBox}
          onPress={() => {
            this.yearModal.open();
          }}>
          <Text style={styles.rangeBoxText}>
            {this.state.selectedMaxYear
              ? this.state.selectedMaxYear
              : Languages.RangeTo}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderMileageSelect() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          justifyContent: 'space-around',
        }}>
        <TouchableOpacity
          style={styles.rangeBox}
          onPress={() => {
            this.MileageModal.open();
          }}>
          <Text style={styles.rangeBoxText}>
            {this.state.selectedMinMileage
              ? this.state.selectedMinMileage
              : Languages.From}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rangeBox}
          onPress={() => {
            this.MileageModal.open();
          }}>
          <Text style={styles.rangeBoxText}>
            {this.state.selectedMaxMileage
              ? this.state.selectedMaxMileage
              : Languages.RangeTo}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  ResetFilters(callback) {
    KS.TypeCategoriesGet({
      langID: Languages.langID,
      typeID: !!this.props.route.params?.selectedSection
        ? this.props.route.params?.selectedSection?.ID == '' //if coming from spareparts and selected all which ID is empty the API doesnt work, so i need to send her 32 to return empty array
          ? 32
          : this.props.route.params?.selectedSection?.ID
        : this.props.route.params?.ListingType?.ID,
    }).then(data => {
      this.setState({
        Categories: data,
      });
    });
    this.setState(
      {
        selectedMake: [AllMakes],
        selectedMinMileage: '',
        selectedMinPrice: '',
        selectedMinYear: '',
        selectedMaxMileage: '',
        selectedMaxPrice: '',
        selectedMaxYear: '',
        selectedModel: [All],
        selectedCategory: [this.props.route.params?.selectedCategory ?? All],
        selectedCity: [All],
        selectedColor: [All],
        selectedFuelType: [this.props.route.params?.selectedFuelType ?? All],
        selectedGearBox: [All],
        selectedPaymentMethod: [
          this.props.route.params?.selectedPaymentMethod ?? All,
        ],
        selectedRentPeriod: [All],
        selectedSection: [this.props.route.params?.selectedSection ?? All],
        selectedStatus: [All],
        Makes: this.props.route.params?.Makes ?? this.state.FullMakes,
        FullMakes: this.props.route.params?.Makes ?? this.state.FullMakes,
      },
      () => {
        if (callback) {
          callback();
        }
      },
    );
  }

  renderFilterHeader() {
    return (
      <Animated.View
        style={[styles.HeaderRowContainer, {height: this.filterHieght}]}>
        {
          <View style={[styles.HeaderRow]}>
            {
              <Pressable
                style={{
                  marginHorizontal: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => {
                  this.CurrencyModal.open();
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: Color.primary,
                    fontFamily: 'Cairo-Bold',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    fontSize: 14,
                  }}>
                  {this.state.currency?.Name}
                </Text>
              </Pressable>
            }
            {
              <View style={[styles.HeaderFiltersBtns]}>
                <Pressable
                  onPress={() => {
                    this.filterModal.open();
                  }}
                  style={styles.filterIcon}>
                  <FilterIcon />
                  {/* <Animated.Text
                    style={[
                      styles.animatedText,
                      {maxWidth: this.widthTo100, maxHeight: this.widthTo100},
                    ]}>
                    {Languages.Filter}
                  </Animated.Text> */}
                </Pressable>
                <Pressable
                  onPress={() => {
                    this.SortModal.open();
                  }}
                  style={styles.filterIcon}>
                  <SortIcon />
                  {/* <Animated.Text
                    style={[
                      styles.animatedText,
                      {maxWidth: this.widthTo100, maxHeight: this.widthTo100},
                    ]}>
                    {Languages.SortBy}
                  </Animated.Text> */}
                </Pressable>

                <Pressable
                  style={styles.filterIcon}
                  onPress={() => {
                    this.setState({
                      renderType: this.state.renderType == 1 ? 2 : 1,
                    });
                  }}>
                  {this.state.renderType == 2 ? (
                    <CardViewIcon
                      width={22}
                      height={22}
                      color={Color.primary}
                    />
                  ) : (
                    <CardsViewIcon
                      width={20}
                      height={20}
                      color={Color.primary}
                    />
                  )}
                  {/* <Animated.Text
                    style={[
                      styles.animatedText,
                      {maxWidth: this.widthTo100, maxHeight: this.widthTo100},
                    ]}>
                    {Languages.Style}
                  </Animated.Text> */}
                </Pressable>
              </View>
            }
          </View>
        }
        <View style={styles.HeaderRow2}>
          <FlatList
            data={
              this.state.isLoading || this.state.isMakesLoading
                ? [1, 2, 3, 4, 5]
                : [...this.Filters()]
            }
            horizontal
            contentContainerStyle={{minWidth: '100%'}}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled
            renderItem={({item, index}) => {
              if (this.state.isLoading || this.state.isMakesLoading)
                return <SkeletonTabFilter />;
              if (item.IsDisplay)
                return (
                  <Pressable
                    style={[styles.filterButton]}
                    onPress={item.OnPress}>
                    <Text style={styles.filterButtonText}>{item.Name}</Text>
                    <IconMa
                      name={'keyboard-arrow-down'}
                      size={20}
                      color={'#000'}
                    />
                  </Pressable>
                );
              return <View style={{width: 0, height: 0}} />;
            }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {
          <Animated.View style={{maxHeight: this.widthTo0}}>
            <TagsFilter
              Tags={[
                !!this.props.route.params?.SellType.ID &&
                  this.props.route.params?.SellType.ID != 7 &&
                  !this.state.selectedSection?.some(
                    item => item.ID === 4096 || item.ID === 2048, // Board 4096 , Accessories 2048 => not incloud 2048 OR 4096,
                  ) && {
                    Name: `${this.props.route.params?.ListingType?.Name} ${this.props.route.params?.SellType.Name}`,
                    Id: this.props.route.params?.SellType.ID,
                    Type: 'A',
                  },
                ...this.state.selectedSection.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'S'};
                }),
                ...this.state.selectedMake.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'M'};
                }),
                ...this.state.selectedModel.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'D'};
                }),
                ...this.state.selectedCategory.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'T'};
                }),
                ...this.state.selectedCity.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'C'};
                }),
                ...this.state.selectedRentPeriod.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'O'};
                }),
                ...this.state.selectedStatus.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'V'};
                }),
                ...this.state.selectedGearBox.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'G'};
                }),
                ...this.state.selectedFuelType.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'F'};
                }),
                ...this.state.selectedPaymentMethod.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'P'};
                }),
                ...this.state.selectedColor.map(i => {
                  return {Name: i.Name, Id: i.ID, Type: 'R'};
                }),
                (!!this.state.selectedMaxMileage ||
                  !!this.state.selectedMinMileage) && {
                  Name: `${
                    this.state.selectedMinMileage
                      ? this.state.selectedMinMileage
                      : '0'
                  } - ${
                    this.state.selectedMaxMileage
                      ? this.state.selectedMaxMileage
                      : '∞'
                  }`,
                  Id: '1',
                  Type: 'K',
                },
                (!!this.state.selectedMaxYear ||
                  !!this.state.selectedMinYear) && {
                  Name: `${
                    this.state.selectedMinYear
                      ? this.state.selectedMinYear
                      : '1960'
                  } - ${
                    this.state.selectedMaxYear
                      ? this.state.selectedMaxYear
                      : `${new Date().getFullYear() + 1}`
                  }`,
                  Id: '1',
                  Type: 'Y',
                },
                (!!this.state.selectedMaxPrice ||
                  !!this.state.selectedMinPrice) && {
                  Name: `${
                    this.state.selectedMinPrice
                      ? this.state.selectedMinPrice
                      : '0'
                  } - ${
                    this.state.selectedMaxPrice
                      ? this.state.selectedMaxPrice
                      : '∞'
                  }`,
                  Id: '1',
                  Type: 'I',
                },
              ]}
              OnCelarFilter={() => {
                this.ResetFilters();
              }}
              OnDeleteFilter={item => {
                this.handleDeleteFilter(item);
              }}
            />
          </Animated.View>
        }
      </Animated.View>
    );
  }
  LoadListingsPage = async item => {
    if (!this.state.footerLoading) {
      this.setState({page: this.state.page + 1}, async () => {
        if (this.state.page <= this.state.maximumPages) {
          await this.filterResults(
            true,
            (this.state.sortOption && this.state.sortOption.asc) || false,
            (this.state.sortOption && this.state.sortOption.sortBy) || false,
          );
        } else if (this.state.page > this.state.maximumPages) {
          if (
            !this.state.showLoadMore &&
            this.props.route.params?.ListingType?.ID != 32 &&
            this.props.ViewingCountry.cca2 != 'ALL'
          ) {
            this.setState({showLoadMore: true});
          }
        }
      });
    }
  };
  renderEmptyComponent() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontFamily: 'Cairo-Bold',
          }}>
          {Languages.NoOffers}
        </Text>
      </View>
    );
  }
  renderListingsFooter() {
    return (
      <View style={{}}>
        {this.state.footerLoading && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              marginBottom: 50,
            }}>
            <ActivityIndicator size="large" color={'#F85502'} />
          </View>
        )}

        {this.state.showLoadMore && false && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 25,
              marginVertical: 15,
              paddingVertical: 10,
              backgroundColor: 'green',
              borderRadius: 10,
              marginBottom: 120,
              alignSelf: 'center',
            }}
            onPress={() => {
              this.setState({showLoadMore: false, page: 1});
              let item = {
                callingCode: '',
                cca2: 'ALL',
                currency: 'All',
                flag: undefined,
                name: '',
              };
              this.props.setViewingCountry(item, () => {
                setTimeout(() => {
                  this.filterResults();
                  KS.CitiesGet({
                    langID: Languages.langID,
                    isoCode: 'ALL',
                  }).then(Cities => {
                    this.setState({Cities, fullCities: Cities});
                    this.setState({isCitiesLoading: false});
                  });
                }, 500);
              });
            }}>
            <Text
              numberOfLines={1}
              style={{
                color: 'white',
                fontSize: 18,
                textAlign: 'center',
              }}>
              {Languages.SeeResultsAllCountries}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  onScrollHandler = ({nativeEvent}) => {
    const currentY = nativeEvent.contentOffset.y;
    const deltaY = Math.abs(currentY - this.lastScrollY);
    const direction =
      currentY != 0 && currentY > this.lastScrollY ? 'down' : 'up';

    if (currentY > 0 && currentY < 50) {
      this.lastScrollY = currentY;
      return;
    }

    if (deltaY < 100 && currentY != 0) {
      return;
    }

    // Only animate if direction has changed
    if (direction !== this.currentDirection) {
      this.currentDirection = direction;

      Animated.parallel([
        Animated.timing(this.translateY, {
          toValue: direction === 'down' ? -Constants.listingsHeaderHiegth : 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.addBtnSpace, {
          toValue: direction === 'down' ? 0 : 180,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.bottomBar, {
          toValue: direction === 'down' ? 180 : 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.widthTo0, {
          toValue: direction === 'down' ? 0 : 150,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.filterHieght, {
          toValue:
            direction === 'down'
              ? FILTER_HEADER_HEIGHT_WITHOUT_TAGS
              : FILTER_HEADER_HEIGHT,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad),
        }),
      ]).start();
    }

    this.lastScrollY = currentY;
  };

  render() {
    const _this = this;

    this.filterGearBox = [
      {
        ID: '',
        Image: require('../images/SellTypes/BlueAll.png'),
        All: true,
        Name: Languages.All,
      },
      {
        ID: 1,
        Name: Languages.Automatic,
      },
      {
        ID: 2,
        Name: Languages.Manual,
      },
    ];
    this.FilterFuelTypes = [
      {
        ID: '',
        Image: require('../images/SellTypes/BlueAll.png'),
        All: true,
        Name: Languages.All,
      },
      {
        ID: 1,
        Name: Languages.Benzin,
      },
      {
        ID: 2,
        Name: Languages.Diesel,
      },
      {
        ID: 4,
        Name: Languages.Electric,
      },
      {
        ID: 8,
        Name: Languages.Hybrid,
      },
      {
        ID: 16,
        Name: Languages.Other,
      },
    ];
    this.FilterPaymentMethods = [
      {
        ID: '',
        Image: require('../images/SellTypes/BlueAll.png'),
        All: true,
        Name: Languages.All,
      },
      {
        ID: 3,
        Name: Languages.Cash,
      },
      {
        ID: 2,
        Name: Languages.Installments,
      },
    ];
    this.FilterRentPeriod = [
      {
        ID: '',
        Image: require('../images/SellTypes/BlueAll.png'),
        All: true,
        Name: Languages.All,
      },
      {
        ID: 1,
        Name: Languages.Daily,
      },
      {
        ID: 2,
        Name: Languages.Weekly,
      },
      {
        ID: 4,
        Name: Languages.Monthly,
      },
      {
        ID: 8,
        Name: Languages.Yearly,
      },
    ];
    this.FilterOfferCondition = [
      {
        ID: '',
        Image: require('../images/SellTypes/BlueAll.png'),
        All: true,
        Name: Languages.All,
      },
      {
        ID: 1,
        Name: Languages.New,
      },
      {
        ID: 2,
        Name: Languages.Used,
      },
    ];
    this.sellTypesFilter = [
      // {
      //   ID: 7,
      //   Name: Languages.All,
      //   img: require('../images/SellTypes/BlueAll.png'),

      //   backgroundColor: '#D31018',
      // },
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('../images/SellTypes/BlueSale.png'),

        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('../images/SellTypes/BlueRent.png'),

        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require('../images/SellTypes/BlueWanted.png'),

        backgroundColor: '#D31018',
      },
    ];
    this.SortOptions = [
      {
        ID: 1,
        Name: Languages.DateNewest,
        sortBy: 'date',
        asc: 'false', //so i can compare it and not resolve to false always
      },
      {
        ID: 2,

        Name: Languages.DateOldest,
        sortBy: 'date',
        asc: 'true',
      },
      {
        ID: 3,

        Name: Languages.YearNewest,
        sortBy: 'year',
        asc: 'false',
      },
      {
        ID: 4,

        Name: Languages.YearOldest,
        sortBy: 'year',
        asc: 'true',
      },
      {
        ID: 5,

        Name: Languages.PriceHighest,
        sortBy: 'price',
        asc: 'false',
      },
      {
        ID: 6,

        Name: Languages.PriceLowest,
        sortBy: 'price',
        asc: 'true',
      },
    ];

    return (
      <View style={{flex: 1, backgroundColor: '#f0f0f0'}}>
        <Animated.View
          style={{
            transform: [{translateY: this.translateY}],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: 'white',
          }}>
          <NewHeader
            navigation={this.props.navigation}
            back
            blue
            noElevation
            make
            query={this.state.query}
            onCountryChange={item => {
              //  console.log(item);
              this.setState({cca2: item.cca2}, () => {
                this.filterResults();

                KS.CitiesGet({
                  langID: Languages.langID,
                  isoCode: item.cca2 || '',
                }).then(Cities => {
                  this.setState({Cities, fullCities: Cities});
                  this.setState({isCitiesLoading: false});
                });
              });
            }}
          />
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: '#1C7DA2',
            }}
          />
          {this.renderFilterHeader()}
        </Animated.View>

        {this.state.isLoading || this.state.isMakesLoading ? (
          <FlatList
            keyExtractor={this.keyExtractor}
            numColumns={2}
            data={[1, 2, 3, 4]}
            contentContainerStyle={styles.LoadingList}
            renderItem={item => <SkeletonCard />}
          />
        ) : (
          <FlatList
            windowSize={16}
            removeClippedSubviews
            ListHeaderComponent={
              <>
                {[
                  ...this.state.Listings.filter(
                    x =>
                      x.IsSpecial &&
                      `${x.ISOCode}`.toLowerCase() ==
                        `${this.props.ViewingCountry?.cca2}`.toLowerCase(),
                  ),
                ].length == 0 &&
                  `${this.props.ViewingCountry?.cca2}`.toLowerCase() !=
                    'all' && (
                    <FeatueredListingsCards
                      ISOCode={this.props.ViewingCountry.cca2}
                      country={this.props.ViewingCountry}
                      langId={Languages.langID}
                      selectedCity={this.state.selectedCity}
                      type={this.props.route.params?.ListingType?.ID}
                    />
                  )}

                <FlatList
                  removeClippedSubviews
                  keyExtractor={this.keyExtractor}
                  contentContainerStyle={{
                    overflow: 'hidden',
                    minWidth: '100%',
                    flex: 3,
                  }}
                  numColumns={1}
                  horizontal={false}
                  key={this.state.renderType}
                  data={this.state.Listings.filter(
                    x =>
                      x.IsSpecial &&
                      `${x.ISOCode}`.toLowerCase() ==
                        `${this.props.ViewingCountry?.cca2}`.toLowerCase(),
                  )}
                  renderItem={this.renderItem.bind(this)}
                />
              </>
            }
            keyExtractor={this.keyExtractor}
            numColumns={this.state.renderType == 1 ? 2 : 1}
            key={this.state.renderType}
            ListEmptyComponent={this.renderEmptyComponent()}
            data={this.state.Listings.filter(x => !x.IsSpecial)}
            contentContainerStyle={styles.LoadingList}
            renderItem={this.renderItem.bind(this)}
            onEndReached={this.LoadListingsPage}
            onEndReachedThreshold={5} //was 0.5
            ListFooterComponent={this.renderListingsFooter()}
            onScroll={this.onScrollHandler}
          />
        )}
        {/*

     <FlashList
            estimatedItemSize={16 * 20} // you must set a good estimated size
            data={this.state.Listings} // .filter(x => !x.IsSpecial)}
            numColumns={this.state.renderType == 1 ? 2 : 1}
            renderItem={({item}) => (
              <RenderListingCard
                item={item}
                cca2={this.props.ViewingCountry.cca2}
                selectedCity={this.state.selectedCity}
                renderType={this.state.renderType}
              />
            )}
            // ListHeaderComponent={
            //   <>
            //     {[
            //       ...this.state.Listings.filter(
            //         x =>
            //           x.IsSpecial &&
            //           `${x.ISOCode}`.toLowerCase() ==
            //             `${this.props.ViewingCountry?.cca2}`.toLowerCase()
            //       ),
            //     ].length == 0 &&
            //       `${this.props.ViewingCountry?.cca2}`.toLowerCase() !=
            //         'all' && (
            //         <FeatueredListingsCards
            //           ISOCode={this.props.ViewingCountry.cca2}
            //           country={this.props.ViewingCountry}
            //           langId={Languages.langID}
            //           selectedCity={this.state.selectedCity}
            //           type={this.props.route.params?.ListingType?.ID}
            //           // renderType={this.state.renderType}
            //         />
            //       )}

            //     <FlatList
            //       windowSize={16}
            //       removeClippedSubviews
            //       keyExtractor={`2-${this.keyExtractor()}`}
            //       numColumns={1}
            //       key={this.state.renderType}
            //       data={this.state.Listings.filter(
            //         x =>
            //           x.IsSpecial &&
            //           `${x.ISOCode}`.toLowerCase() ==
            //             `${this.props.ViewingCountry?.cca2}`.toLowerCase()
            //       )}
            //       renderItem={({item, index}) => (
            //         <RenderListingCard
            //           item={item}
            //           cca2={this.props.ViewingCountry.cca2}
            //           selectedCity={this.state.selectedCity}
            //           renderType={this.state.renderType}
            //           key={`2-${index}-${item?.ID}`}
            //         />
            //       )}
            //     />
            //   </>
            // }
            ListFooterComponent={this.renderListingsFooter()}
            ListEmptyComponent={this.renderEmptyComponent()}
            onEndReached={this.LoadListingsPage}
            onEndReachedThreshold={0.2}
            contentContainerStyle={styles.LoadingList}
            onScroll={this.onScrollHandler}
            windowSize={16}
            removeClippedSubviews={true}
            keyExtractor={this.keyExtractor}
          />
*/}
        {this.state.AddShown && (
          <Animated.View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 10,
              transform: [{translateY: this.addBtnSpace}],
              minHeight: 'auto',
              minWidth: 'auto',
              zIndex: 2000,
            }}>
            <AddAdvButtonSquare navigation={this.props.navigation} />
          </Animated.View>
        )}
        <Animated.View
          style={{
            position: 'absolute',
            transform: [{translateY: this.bottomBar}],
            right: 0,
            bottom: 0,
            zIndex: 2000,
            minHeight: 'auto',
            minWidth: '100%',
          }}>
          <BottomNavigationBar />
        </Animated.View>
        <GearBoxModal
          SelectedGearBox={this.state.selectedGearBox ?? []}
          GearBoxList={this.filterGearBox}
          IsOpen={this.state.OpenGearBoxModal}
          OnClose={flag => {
            this.setState({OpenGearBoxModal: flag});
          }}
          OnSelect={list => {
            this.setState({selectedGearBox: list}, () => {
              this.filterResults();
            });
          }}
        />
        <FuelTypesModal
          SelectedFuelTypes={this.state.selectedFuelType ?? []}
          FuelTypesList={this.FilterFuelTypes}
          IsOpen={this.state.OpenFuelTypesModal}
          OnClose={flag => {
            this.setState({OpenFuelTypesModal: flag});
          }}
          OnSelect={list => {
            this.setState({selectedFuelType: list}, () => {
              this.filterResults();
            });
          }}
        />
        <StatusModal
          SelectedOptions={this.state.selectedStatus ?? []}
          DataList={this.FilterOfferCondition}
          IsOpen={this.state.OpenStatusModal}
          OnClose={flag => {
            this.setState({OpenStatusModal: flag});
          }}
          OnSelect={list => {
            this.setState({selectedStatus: list}, () => {
              this.filterResults();
            });
          }}
        />
        <ColorModal
          SelectedOptions={this.state.selectedColor ?? []}
          DataList={this.state.Colors ?? []}
          IsOpen={this.state.OpenColorModal}
          OnClose={flag => {
            this.setState({OpenColorModal: flag});
          }}
          OnSelect={list => {
            this.setState({selectedColor: list}, () => {
              this.filterResults();
            });
          }}
        />
        <PaymentMethodModal
          SelectedOptions={this.state.selectedPaymentMethod ?? []}
          DataList={this.FilterPaymentMethods}
          IsOpen={this.state.OpenPaymentMethodModal}
          OnClose={flag => {
            this.setState({OpenPaymentMethodModal: flag});
          }}
          OnSelect={list => {
            this.setState({selectedPaymentMethod: list}, () => {
              this.filterResults();
            });
          }}
        />
        <RentPeriodModal
          SelectedOptions={this.state.selectedRentPeriod ?? []}
          DataList={this.FilterRentPeriod}
          IsOpen={this.state.OpenRentPeriodModal}
          OnClose={flag => {
            this.setState({OpenRentPeriodModal: flag});
          }}
          OnSelect={list => {
            this.setState({selectedRentPeriod: list}, () => {
              this.filterResults();
            });
          }}
        />
        <PartNumberModal
          PartNumber={this.state.PartNumber}
          IsOpen={this.state.OpenPartNumberModal}
          OnClose={flag => {
            this.setState({OpenPartNumberModal: flag});
          }}
          OnEnter={partNumber => {
            this.setState({PartNumber: partNumber}, () => {
              this.filterResults();
            });
          }}
        />
        <AutobeebModal
          ref={instance => (this.filterModal = instance)}
          //  isOpen={true}
          style={[styles.filterModal]}
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          fullScreen={true}
          onOpened={() => {
            this.setState({AddShown: false});
            this.props.navigation.setParams({tabBarVisible: false});
          }}
          onClosed={() => {
            this.setState({AddShown: true});
            this.props.navigation.setParams({tabBarVisible: true});
          }}
          backdropOpacity={0.7}>
          <View
            style={[
              styles.modal,
              {
                flex: 1,
                //    justifyContent: "space-between",
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                elevation: 1,
                backgroundColor: '#fff',
                paddingVertical: 11,
                paddingHorizontal: 30,
              }}>
              {
                <TouchableOpacity
                  style={{}}
                  hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                  onPress={() => {
                    this.filterModal.close();
                  }}>
                  <IconFa name={'close'} size={25} color={'#f00'} style={{}} />
                </TouchableOpacity>
              }
              <View style={{}}></View>

              <TouchableOpacity
                style={{}}
                hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                onPress={() => {
                  this.filterResults();
                }}>
                <IconFa name={'check'} size={25} color={'green'} style={{}} />
              </TouchableOpacity>
            </View>
            <ScrollView
              //    keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 80}}
              style={{
                // style: 1,
                backgroundColor: '#f0f0f0',
                //  maxHeight: Dimensions.get("screen").height * 0.6
              }}>
              {this.state.Sections && this.state.Sections.length > 0 && (
                <View style={styles.filterSectionContainer}>
                  {this.renderSectionHeader(Languages.Section + ':')}

                  {this.renderSectionValue(
                    (this.state.selectedSection &&
                      this.state.selectedSection.length > 0 &&
                      this.state.selectedSection
                        .map(item => item.Name)
                        .join(', ')) ||
                      Languages.AllSections,
                    () => {
                      this.sectionModal.open();
                    },
                  )}
                </View>
              )}

              {this.props.route.params?.ListingType?.ID != 16 &&
                this.state.selectedSection &&
                !(
                  (this.props.route.params?.ListingType?.ID == 4 ||
                    this.props.route.params?.ListingType?.ID == 32) &&
                  this.state.selectedSection[0].All
                ) &&
                this.state.selectedSection[0].ID != 2048 &&
                this.state.selectedSection[0].ID != 4096 &&
                this.state.selectedSection[0].ID != 256 &&
                !this.state.MakesLoading &&
                this.state.FullMakes &&
                this.state.FullMakes.length > 1 && ( // was makes i changed it to full makes
                  <View
                    style={[styles.filterSectionContainer, {marginTop: 10}]}>
                    {this.renderSectionHeader(Languages.Make + ':')}

                    <FlatList
                      keyExtractor={(item, index) => index.toString()}
                      horizontal
                      //     legacyImplementation={I18nManager.isRTL}
                      data={this.state.FullMakes}
                      initialNumToRender={I18nManager.isRTL ? 150 : 20} // flatlist is broken on RTL+Horizontal , will keep updating infinite times, this is to stop rerendering. https://github.com/facebook/react-native/issues/19150
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: Color.secondary,
                      }}
                      renderItem={({item, index}) => {
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              {
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginHorizontal: 5,
                                borderRadius: 30,
                                width: 60,
                                height: 60,
                                backgroundColor: '#e6e6e6',
                              },
                              this.state.selectedMake.filter(
                                make => make.ID == item.ID,
                              ).length > 0 && {
                                borderWidth: 2,
                                borderColor: '#1C7EA5',
                              },
                            ]}
                            onPress={() => {
                              if (item.AllMake) {
                                this.setState({selectedMake: [item]});
                              } else if (
                                this.state.selectedMake.filter(
                                  make => make.ID == item.ID,
                                ).length > 0 //make is already selected
                              ) {
                                let makes = this.state.selectedMake.filter(
                                  make => make.ID != item.ID,
                                );
                                if (makes.length == 0) {
                                  // if resut is zero , make all the selected
                                  makes.unshift(AllMakes);
                                }
                                this.setState({
                                  selectedMake: makes,
                                  selectedModel: [All],
                                });
                              } else {
                                let makes = this.state.selectedMake.filter(
                                  make => make.ID > 0,
                                );
                                makes.push(item);
                                this.setState({
                                  selectedMake: makes,
                                  selectedModel: [All],
                                });
                              }
                            }}>
                            {this.state.selectedMake.filter(
                              make => make.ID == item.ID,
                            ).length > 0 && (
                              <View
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  zIndex: 10,
                                  right: -3,
                                  width: 18,
                                  height: 18,
                                  borderRadius: 9,
                                  overflow: 'hidden',
                                  backgroundColor: Color.secondary,
                                }}>
                                <IconMC
                                  name={'check'}
                                  color={'white'}
                                  size={17}
                                />
                              </View>
                            )}

                            {item.AllMake ? (
                              <Text style={{}}>{Languages.All}</Text>
                            ) : (
                              <FastImage
                                style={[{width: 50, height: 50}]}
                                resizeMode={FastImage.resizeMode.contain}
                                source={{
                                  uri:
                                    'https://autobeeb.com/' +
                                    item.FullImagePath +
                                    '_240x180.png',
                                }}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      }}
                    />

                    {this.renderSectionValue(
                      (this.state.selectedMake &&
                        this.state.selectedMake.length > 0 &&
                        this.state.selectedMake
                          .map(item => item.Name)
                          .join(', ')) ||
                        Languages.AllMakes,
                      () => {
                        //    return alert(JSON.stringify(this.state.selectedMake));
                        this.makeModal.open();
                      },
                    )}
                  </View>
                )}
              {this.props.route.params?.ListingType?.ID != 16 &&
                (this.state.sellType.ID != 1 &&
                (this.props.route.params?.ListingType?.ID == 2 ||
                  this.props.route.params?.ListingType?.ID == 4 ||
                  this.props.route.params?.ListingType?.ID == 8)
                  ? false
                  : true) &&
                this.state.selectedMake &&
                this.state.selectedMake.length == 1 &&
                !(
                  this.state.selectedMake[0].AllMake ||
                  this.state.selectedMake.All
                ) &&
                (this.props.route.params?.ListingType?.ID == 32 &&
                this.state.selectedSection &&
                this.state.selectedSection[0] &&
                !this.state.selectedSection[0].All &&
                this.state.selectedSection[0].ID != 64
                  ? false
                  : true) && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.Model + ':')}

                    {this.renderSectionValue(
                      (this.state.selectedModel &&
                        this.state.selectedModel
                          .map(item => item.Name)
                          .join(', ')) ||
                        Languages.AllModels,
                      () => {
                        this.setState({isModelLoading: true});
                        KS.ModelsGet({
                          langID: Languages.langID,
                          listingType:
                            this.props.route.params?.ListingType?.ID == 32 &&
                            this.state.selectedSection[0]
                              ? 1
                              : this.props.route.params?.ListingType?.ID == 4
                              ? this.state.selectedSection[0].ID
                              : this.props.route.params?.ListingType?.ID || '',
                          makeID:
                            this.state.selectedMake &&
                            this.state.selectedMake[0].ID,
                        }).then(data => {
                          data.unshift(All);
                          this.setState({
                            Models: data,
                            FullModels: data,
                            isModelLoading: false,
                          });
                        });
                        this.modelModal.open();
                      },
                    )}
                  </View>
                )}

              {!(
                this.state.selectedSection[0] &&
                this.state.selectedSection[0].All &&
                this.state.Categories &&
                this.state.Categories.length <= 1
              ) &&
                this.state.Categories &&
                this.state.Categories.length > 1 && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.Category + ':')}

                    {this.renderSectionValue(
                      (this.state.selectedCategory &&
                        this.state.selectedCategory.length > 0 &&
                        this.state.selectedCategory
                          .map(item => item.Name)
                          .join(', ')) ||
                        Languages.AllCategories,
                      () => {
                        this.categoryModal.open();
                      },
                    )}
                  </View>
                )}

              {this.props.ViewingCountry.cca2 != 'ALL' && (
                <View style={styles.filterSectionContainer}>
                  {this.renderSectionHeader(Languages.City + ':')}

                  {this.renderSectionValue(
                    (this.state.selectedCity &&
                      this.state.selectedCity.length > 0 &&
                      this.state.selectedCity
                        .map(item => item.Name)
                        .join(', ')) ||
                      Languages.All,
                    () => {
                      this.cityModal.open();
                    },
                  )}
                </View>
              )}

              {this.state.sellType.ID == 1 &&
                this.props.route.params?.ListingType?.ID != 16 &&
                this.props.route.params?.ListingType?.ID != 32 && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.GearBox + ':')}
                    {this.renderGearBoxSelect()}
                  </View>
                )}

              {this.state.sellType.ID == 1 &&
                (this.props.route.params?.ListingType?.ID == 1 ||
                  this.props.route.params?.ListingType?.ID == 8) && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.FuelType + ':')}
                    {this.renderFuelTypeSelect()}
                  </View>
                )}

              {this.state.sellType.ID != 2 &&
                this.state.sellType.ID != 7 &&
                !(
                  this.props.route.params?.ListingType?.ID == 32 &&
                  (this.state.selectedSection[0].ID == 2048 ||
                    this.state.selectedSection[0].ID == 4096)
                ) &&
                //true
                (this.props.route.params?.ListingType?.ID != 32 ||
                  this.state.sellType.ID != 4) && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.Status + ':')}
                    {this.renderStatusSelect()}
                  </View>
                )}

              {this.state.sellType.ID == 1 &&
                (this.props.route.params?.ListingType?.ID == 1 ||
                  this.props.route.params?.ListingType?.ID == 8 ||
                  this.props.route.params?.ListingType?.ID == 2) && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.Color + ':')}
                    {this.renderColorSelect()}
                  </View>
                )}

              {this.state.sellType.ID == 1 &&
                this.props.route.params?.ListingType?.ID != 32 && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.PaymentMethod + ':')}
                    {this.renderPaymentMethodSelect()}
                  </View>
                )}

              {this.state.sellType.ID == 2 && (
                <View style={styles.filterSectionContainer}>
                  {this.renderSectionHeader(Languages.RentPeriod + ':')}
                  {this.renderRentPeriodSelect()}
                </View>
              )}
              {((this.props.route.params?.ListingType?.ID == 32 &&
                this.state.selectedSection &&
                !this.state.selectedSection[0].All &&
                this.state.selectedSection[0].ID != 2048 &&
                this.state.selectedSection[0].ID != 4096 &&
                this.state.selectedSection[0].ID != 256) ||
                this.props.route.params?.ListingType?.ID != 32) && (
                <View style={styles.filterSectionContainer}>
                  {this.renderSectionHeader(Languages.Year + ':')}
                  {this.renderYearSelect()}
                </View>
              )}
              {this.state.sellType.ID != 4 &&
                this.state.sellType.ID != 7 &&
                !(
                  this.props.route.params?.ListingType?.ID == 32 &&
                  (this.state.selectedSection[0].ID == 2048 ||
                    this.state.selectedSection[0].ID == 4096)
                ) && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.Price + ':')}
                    {this.renderPriceSelect()}
                  </View>
                )}

              {this.state.sellType.ID == 1 &&
                this.props.route.params?.ListingType?.ID != 32 &&
                this.props.route.params?.ListingType?.ID != 16 && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(
                      this.props.route.params?.ListingType?.ID == 4
                        ? Languages.Hours
                        : Languages.Mileage + ':',
                    )}
                    {this.renderMileageSelect()}
                  </View>
                )}

              {this.props.route.params?.ListingType?.ID >= 32 &&
                !this.state.selectedSection?.some(
                  item => item.ID === 4096 || item.ID === 2048,
                ) && // Board 4096 , Accessories 2048 => not incloud 2048 OR 4096
                !!this.state.Sections?.length && (
                  <View style={styles.filterSectionContainer}>
                    {this.renderSectionHeader(Languages.PartNumber + ':')}

                    <TextInput
                      style={styles.PartNumberInput}
                      placeholder={Languages.EnterPartNumber}
                      onChangeText={text => {
                        this.setState({PartNumber: text});
                      }}
                      value={this.state.PartNumber}
                    />
                  </View>
                )}
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                //    position: "absolute",
                //   backgroundColor: "red",
                //   bottom: Dimensions.get("screen").height * 0.1,
                //   bottom: 0,
                zIndex: 10,
                //    alignItems: "center",
                //      justifyContent: "center"
              }}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{flex: 2, backgroundColor: 'green'}}
                onPress={() => {
                  this.filterResults();
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    paddingVertical: 15,
                    color: '#fff',
                  }}>
                  {Languages.FilterResults}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.ResetFilters();
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#E6E6FA',
                }}>
                <Text style={{textAlign: 'center', paddingVertical: 15}}>
                  {Languages.Reset}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AutobeebModal>
        <AutobeebModal //make modal
          ref={instance => (this.makeModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose={false}
          coverscreen={false}
          backdropOpacity={0.5}>
          <View style={[styles.modelContainer]}>
            <View style={{}}>
              <TextInput
                style={{
                  height: 40,
                  fontFamily: 'Cairo-Regular',
                  borderColor: Color.secondary,
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                placeholder={Languages.Search}
                onChangeText={text => {
                  let tempMakes = JSON.parse(
                    JSON.stringify(this.state.FullMakes),
                  ); // take value instead of ref
                  let filteredMakes = tempMakes.filter(item => {
                    return item.Name.toUpperCase().includes(text.toUpperCase());
                  });
                  this.setState({Makes: filteredMakes, text});
                }}
                value={this.state.text}
              />

              <FlatList
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                data={this.state.Makes || []}
                style={{height: Dimensions.get('screen').height * 0.52}}
                extraData={this.state}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalRowContainer}
                      onPress={() => {
                        if (item.AllMake) {
                          this.setState({selectedMake: [item]});
                        } else if (
                          this.state.selectedMake.filter(
                            make => make.ID == item.ID,
                          ).length > 0 //make is already selected
                        ) {
                          let makes = this.state.selectedMake.filter(
                            make => make.ID != item.ID,
                          );
                          if (makes.length == 0) {
                            // if resut is zero , make all the selected
                            makes.unshift(AllMakes);
                          }
                          this.setState({
                            selectedMake: makes,
                            selectedModel: [All],
                          });
                        } else {
                          let makes = this.state.selectedMake.filter(
                            make => make.ID > 0,
                          );
                          makes.push(item);
                          this.setState({
                            selectedMake: makes,
                            selectedModel: [All],
                          });
                        }
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          {item.FullImagePath && (
                            <FastImage
                              style={{
                                width: 40,
                                height: 40,
                                marginRight: 10,
                              }}
                              resizeMode={FastImage.resizeMode.contain}
                              source={{
                                uri:
                                  'https://autobeeb.com/' +
                                  item.FullImagePath +
                                  '_240x180.png',
                              }}
                            />
                          )}

                          {item.Image && (
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                marginRight: 8,
                              }}>
                              <FastImage
                                style={{
                                  width: 20,
                                  height: 20,
                                  marginVertical: 10,
                                  marginHorizontal: 10,
                                  marginRight: 15,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                                source={item.Image}
                              />
                            </View>
                          )}
                          <Text style={{color: 'black', fontSize: 15}}>
                            {item.Name}
                          </Text>
                        </View>

                        <IconMC
                          name={
                            this.state.selectedMake.filter(
                              make => make.ID == item.ID,
                            ).length > 0
                              ? 'checkbox-marked'
                              : 'checkbox-blank-outline'
                          }
                          color={Color.secondary}
                          size={20}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            {this.renderOkCancelButton(
              () => {
                this.setState({
                  selectedMake: [AllMakes],
                  text: '',
                  Makes: this.state.FullMakes,
                });
                this.makeModal.close();
              },
              () => {
                this.makeModal.close();
                this.setState(
                  {btnloader: true, text: '', Makes: this.state.FullMakes},
                  () => {
                    if (!this.filterModal.isOpen) {
                      this.filterResults();
                    }
                  },
                );
              },
            )}
          </View>
        </AutobeebModal>
        <AutobeebModal //selltype modal
          ref={instance => (this.SortModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          keyboardResponsive={true}
          entry="top"
          swipeToClose={true}
          //   backdropPressToClose={true}
          coverscreen={false}
          backdropOpacity={0.5}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              // justifyContent: 'center',
              // alignItems:"center",
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 5,
                borderRadius: 10,
              }}>
              {this.SortOptions.map(type => this.renderSortOptionRow(type))}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.SortModal.close();
                }}>
                <Text
                  style={{
                    color: Color.secondary,
                    flex: 1,
                    fontSize: 23,
                    textAlign: 'center',
                  }}>
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AutobeebModal>
        <AutobeebModal //selltype modal
          ref={instance => (this.SellTypeModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={true}
          // backdropPressToClose
          coverscreen={false}
          backdropOpacity={0.5}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              // justifyContent: 'center',
              // alignItems:"center",
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 5,
                borderRadius: 10,
              }}>
              {this.sellTypesFilter.map(type => this.renderSellTypesRow(type))}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.SellTypeModal.close();
                }}>
                <Text
                  style={{
                    color: Color.secondary,
                    flex: 1,
                    fontSize: 26,
                    textAlign: 'center',
                  }}>
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AutobeebModal>
        <AutobeebModal //currency modal
          ref={instance => (this.CurrencyModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={true}
          // backdropPressToClose
          coverscreen={false}
          backdropOpacity={0.5}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              // justifyContent: 'center',
              // alignItems:"center",
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 5,
                borderRadius: 10,
              }}>
              {this.state.PrimaryCurrencies &&
                this.state.PrimaryCurrencies.map(type =>
                  this.renderCurrencyRow(type),
                )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.CurrencyModal.close();
                }}>
                <Text
                  style={{
                    color: Color.secondary,
                    flex: 1,
                    fontSize: 26,
                    textAlign: 'center',
                  }}>
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AutobeebModal>
        <AutobeebModal //section Modal
          ref={instance => (this.sectionModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          // backdropPressToClose
          coverscreen={false}
          backdropOpacity={0.5}>
          <View style={styles.modelContainer}>
            <Text
              style={{
                color: '#000',
                fontSize: Constants.mediumFont,
                paddingBottom: 5,
              }}>
              {Languages.Section + ' :'}
            </Text>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={this.state.Sections || []}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              //  style={{ flex: 1 }}
              extraData={this.state}
              //contentContainerStyle={{ flexGrow: 1 }}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    {
                      flex: 1,
                      elevation: 1,
                      margin: 1,
                      justifyContent: 'center',
                      backgroundColor:
                        this.state.selectedSection &&
                        this.state.selectedSection[0] &&
                        this.state.selectedSection[0].All
                          ? Color.secondary
                          : '#fff',
                    },
                  ]}
                  onPress={() => {
                    this.setState(
                      {
                        selectedSection: [All],
                        Categories: [],
                        selectedMake: [AllMakes],
                      },
                      () => {
                        this.sectionModal.close();
                      },
                    );
                  }}>
                  <View
                    style={{
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          this.state.selectedSection &&
                          this.state.selectedSection[0] &&
                          this.state.selectedSection[0].All
                            ? '#FFF'
                            : Color.secondary,
                        fontSize: 15,
                      }}>
                      {All.Name}
                    </Text>
                  </View>
                </TouchableOpacity>
              }
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    style={[
                      {
                        flex: 1,
                        elevation: 1,
                        borderWidth: 0,
                        margin: 1,
                        //  borderWidth: 1,
                        //  borderColor: "#ccc",
                        justifyContent: 'center',
                        backgroundColor:
                          this.state.selectedSection &&
                          this.state.selectedSection.filter(
                            model => model.ID == item.ID,
                          ).length > 0
                            ? Color.secondary
                            : '#fff',
                      },
                    ]}
                    onPress={() => {
                      //     alert(JSON.stringify(item));
                      this.setState(
                        {
                          selectedSection: [item],
                          selectedMake: [AllMakes],
                          selectedCategory: [All],
                          MakesLoading: true,
                        },
                        () => {
                          this.sectionModal.close();

                          KS.MakesGet({
                            langID: Languages.langID,
                            listingType: getMakeParentId(
                              item.RelatedEntity ? item.RelatedEntity : item.ID,
                              this.state.selectedSection,
                            ),
                          }).then(data => {
                            data.unshift(AllMakes);

                            this.setState({
                              MakesLoading: false,
                              Makes: data,
                              FullMakes: data,
                            });
                            //       this.refs.sectionModal.close();
                          });
                          try {
                            KS.TypeCategoriesGet({
                              langID: Languages.langID,
                              typeID: item.ID,
                            }).then(data => {
                              this.setState({
                                Categories: data,
                              });
                            });
                          } catch (CategorError) {
                            console.log({CategorError});
                          }
                          if (!this.filterModal.isOpen) {
                            this.filterResults();
                          }
                        },
                      );
                    }}>
                    <View
                      style={{
                        paddingVertical: 5,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {item.FullImagePath && (
                        <FastImage
                          style={{
                            width: 70,
                            height: 70,
                          }}
                          tintColor={
                            this.state.selectedSection &&
                            this.state.selectedSection.filter(
                              model => model.ID == item.ID,
                            ).length > 0
                              ? '#FFF'
                              : Color.secondary
                          }
                          resizeMode={FastImage.resizeMode.contain}
                          source={{
                            uri:
                              'https://autobeeb.com/' +
                              item.FullImagePath +
                              '_300x150.png',
                          }}
                        />
                      )}
                      <Text
                        style={{
                          color:
                            this.state.selectedSection &&
                            this.state.selectedSection.filter(
                              model => model.ID == item.ID,
                            ).length > 0
                              ? '#FFF'
                              : Color.secondary,
                          fontSize: 15,
                          textAlign: 'center',
                        }}>
                        {item.Name.replace('Spare', '')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </AutobeebModal>
        <AutobeebModal //cateogry Modal
          ref={instance => (this.categoryModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          // backdropPressToClose
          coverscreen={false}
          backdropOpacity={0.5}>
          <View style={styles.modelContainer}>
            <Text
              style={{
                color: '#000',
                fontSize: Constants.mediumFont,
                paddingBottom: 5,
              }}>
              {Languages.Category + ' :'}
            </Text>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={this.state.Categories || []}
              showsVerticalScrollIndicator={false}
              //keyboardShouldPersistTaps="handled"
              numColumns={3}
              style={{height: Dimensions.get('screen').height * 0.52}}
              extraData={this.state}
              //contentContainerStyle={{ flexGrow: 1 }}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    {
                      flex: 1,
                      elevation: 1,
                      shadowColor: '#000',
                      shadowOpacity: 0.2,
                      shadowOffset: {height: 1, width: 2},

                      margin: 1,
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                      backgroundColor:
                        this.state.selectedCategory &&
                        this.state.selectedCategory.filter(
                          model => model.ID == All.ID,
                        ).length > 0
                          ? Color.secondary
                          : '#fff',
                    },
                  ]}
                  onPress={() => {
                    this.setState({selectedCategory: [All]});
                  }}>
                  <View
                    style={{
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          this.state.selectedCategory &&
                          this.state.selectedCategory.filter(
                            model => model.ID == All.ID,
                          ).length > 0
                            ? '#FFF'
                            : Color.secondary,
                        fontSize: 15,
                      }}>
                      {All.Name}
                    </Text>
                  </View>
                </TouchableOpacity>
              }
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    style={[
                      {
                        flex: 1,
                        elevation: 1,
                        borderWidth: 0,
                        margin: 1,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: {height: 1, width: 2},
                        // shadow
                        //  borderWidth: 1,
                        //  borderColor: "#ccc",
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        height: 90,
                        backgroundColor:
                          this.state.selectedCategory &&
                          this.state.selectedCategory.filter(
                            model => model.ID == item.ID,
                          ).length > 0
                            ? Color.secondary
                            : '#fff',
                      },
                    ]}
                    onPress={() => {
                      if (item.All) {
                        this.setState({selectedCategory: [item]});
                      } else if (
                        this.state.selectedCategory &&
                        this.state.selectedCategory.filter(
                          model => model.ID == item.ID,
                        ).length > 0 //model is already selected
                      ) {
                        let models = this.state.selectedCategory.filter(
                          model => model.ID != item.ID, //remove model
                        );
                        if (models.length == 0) {
                          models.unshift(All);
                        }
                        this.setState({
                          selectedCategory: models,
                        });
                      } else {
                        let models = [];
                        models = this.state.selectedCategory.filter(
                          item => !item.All,
                        );
                        models.push(item);
                        this.setState({
                          selectedCategory: models,
                        });
                      }
                    }}>
                    <View
                      style={{
                        paddingVertical: 5,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {item.FullImagePath && (
                        <FastImage
                          style={{
                            width: 50,
                            height: 50,
                          }}
                          tintColor={
                            this.state.selectedCategory &&
                            this.state.selectedCategory.filter(
                              model => model.ID == item.ID,
                            ).length > 0
                              ? '#FFF'
                              : Color.secondary
                          }
                          resizeMode={FastImage.resizeMode.contain}
                          source={{
                            uri:
                              'https://autobeeb.com/' +
                              item.FullImagePath +
                              '_300x150.png',
                          }}
                        />
                      )}
                      <Text
                        style={{
                          color:
                            this.state.selectedCategory &&
                            this.state.selectedCategory.filter(
                              model => model.ID == item.ID,
                            ).length > 0
                              ? '#FFF'
                              : Color.secondary,
                          fontSize: 12,
                          textAlign: 'center',
                        }}>
                        {item.Name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            {this.renderOkCancelButton(
              () => {
                this.setState({selectedCategory: [All]});
                this.categoryModal.close();
              },
              () => {
                this.categoryModal.close();
                this.setState({btnloader: true});
                if (!this.filterModal.isOpen) {
                  this.filterResults();
                }
              },
            )}
          </View>
        </AutobeebModal>
        <AutobeebModal //model modal
          ref={instance => (this.modelModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose={false}
          coverscreen={false}
          //   isOpen={true}
          backdropOpacity={0.5}>
          {this.state.isModelLoading ? (
            <View
              style={[
                styles.modelContainer,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                },
              ]}>
              <LogoSpinner fullStretch={true} />
            </View>
          ) : (
            <View style={[styles.modelContainer]}>
              <View style={{}}>
                <TextInput
                  style={{
                    height: 40,
                    fontFamily: 'Cairo-Regular',

                    borderColor: Color.secondary,
                    borderBottomWidth: 1,
                    paddingHorizontal: 15,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                  }}
                  placeholder={Languages.Search}
                  onChangeText={text => {
                    let tempMakes = this.state.FullModels.filter(item => {
                      return item.Name.toUpperCase().includes(
                        text.toUpperCase(),
                      );
                    });
                    this.setState({Models: tempMakes, modelSearch: text});
                  }}
                  value={this.state.modelSearch}
                />

                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  data={this.state.Models || []}
                  //keyboardShouldPersistTaps="handled"
                  style={{height: Dimensions.get('screen').height * 0.52}}
                  extraData={this.state}
                  //contentContainerStyle={{ flexGrow: 1 }}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.modalRowContainer}
                        onPress={() => {
                          if (item.All) {
                            this.setState({selectedModel: [item]});
                          } else if (
                            this.state.selectedModel &&
                            this.state.selectedModel.filter(
                              model => model.ID == item.ID,
                            ).length > 0 //model is already selected
                          ) {
                            let models = this.state.selectedModel.filter(
                              model => model.ID != item.ID, //remove model
                            );
                            if (models.length == 0) {
                              models.unshift(All);
                            }
                            this.setState({
                              selectedModel: models,
                            });
                          } else {
                            let models = [];
                            models = this.state.selectedModel.filter(
                              item => !item.All,
                            );
                            models.push(item);
                            this.setState({
                              selectedModel: models,
                            });
                          }
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={{color: 'black', fontSize: 15}}>
                            {item.Name}
                          </Text>
                          <IconMC
                            name={
                              this.state.selectedModel &&
                              this.state.selectedModel.filter(
                                model => model.ID == item.ID,
                              ).length > 0
                                ? 'checkbox-marked'
                                : 'checkbox-blank-outline'
                            }
                            color={Color.secondary}
                            size={20}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {this.renderOkCancelButton(
                () => {
                  this.setState({selectedModel: [All], modelSearch: ''});
                  this.modelModal.close();
                },
                () => {
                  this.setState({modelSearch: '', btnloader: true});
                  this.modelModal.close();
                  if (!this.filterModal.isOpen) {
                    this.filterResults();
                  }
                },
              )}
            </View>
          )}
        </AutobeebModal>
        <AutobeebModal //city modal
          ref={instance => (this.cityModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose={false}
          coverscreen={false}
          //   isOpen={true}
          backdropOpacity={0.5}>
          <View style={[styles.modelContainer]}>
            <View style={{}}>
              <TextInput
                style={{
                  height: 40,
                  fontFamily: 'Cairo-Regular',

                  borderColor: Color.secondary,
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                placeholder={Languages.Search}
                onChangeText={text => {
                  let tempMakes = this.state.fullCities.filter(item => {
                    return item.Name.toUpperCase().includes(text.toUpperCase());
                  });
                  this.setState({Cities: tempMakes, citySearch: text});
                }}
                value={this.state.citySearch}
              />

              <FlatList
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                data={this.state.Cities || []}
                //keyboardShouldPersistTaps="handled"
                style={{height: Dimensions.get('screen').height * 0.52}}
                extraData={this.state}
                //contentContainerStyle={{ flexGrow: 1 }}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalRowContainer}
                      onPress={() => {
                        if (item.All) {
                          this.setState({selectedCity: [item]});
                        } else if (
                          !!this.state.selectedCity &&
                          this.state.selectedCity?.filter(
                            model => model.ID == item.ID,
                          ).length > 0 //model is already selected
                        ) {
                          let models = this.state.selectedCity?.filter(
                            model => model.ID != item.ID, //remove model
                          );
                          if (models?.length == 0) {
                            models.unshift(All);
                          }
                          this.setState({
                            selectedCity: models,
                          });
                        } else {
                          let models = [];
                          models = this.state.selectedCity?.filter(
                            item => !item.All,
                          );
                          models?.push(item);
                          this.setState({
                            selectedCity: models,
                          });
                        }
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={{color: 'black', fontSize: 15}}>
                          {item.Name}
                        </Text>
                        <IconMC
                          name={
                            this.state.selectedCity &&
                            this.state.selectedCity.filter(
                              model => model.ID == item.ID,
                            ).length > 0
                              ? 'checkbox-marked'
                              : 'checkbox-blank-outline'
                          }
                          color={Color.secondary}
                          size={20}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {this.renderOkCancelButton(
              () => {
                this.setState({
                  selectedCity: [All],
                  citySearch: '',
                  Cities: this.state.fullCities,
                });
                this.cityModal.close();
              },
              () => {
                this.cityModal.close();
                this.setState(
                  {
                    citySearch: '',
                    Cities: this.state.fullCities,
                    btnloader: true,
                  },
                  () => {
                    if (!this.filterModal.isOpen) {
                      this.filterResults();
                    }
                  },
                );
              },
            )}
          </View>
        </AutobeebModal>
        <AutobeebModal //Year modal
          ref={instance => (this.yearModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose={false}
          coverscreen={false}
          //   isOpen={true}
          backdropOpacity={0.5}>
          <View
            style={[
              styles.modelContainer,
              {
                //     height: Dimensions.get("screen").height * 0.5
              },
            ]}>
            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  borderBottomColor: Color.secondary,
                  marginBottom: 10,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.rangeTitle}>{Languages.Year}</Text>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      minYear: '',
                      maxYear: '',
                      maxYearsList: this.state.FullmaxYearsList,
                      minYearsList: this.state.FullminYearsList,
                    });
                  }}>
                  <Text style={styles.rangeCancel}>{Languages.Reset}</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  style={{
                    height: Dimensions.get('screen').height * 0.3,
                    flex: 1,
                  }}
                  data={this.state.minYearsList}
                  renderItem={this.renderMinYearItem.bind(this)}
                  stickyHeaderIndices={[0]}
                  ListHeaderComponent={
                    <TextInput
                      placeholder={Languages.From}
                      keyboardType="number-pad"
                      value={this.state.minYear}
                      style={{
                        borderWidth: 1,
                        fontFamily: 'Cairo-Regular',

                        borderRadius: 5,
                        marginBottom: 10,
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        paddingVertical: 3,
                        textAlign: 'center',
                        width: Dimensions.get('screen').width * 0.3,
                      }}
                      onChangeText={minYear => {
                        this.setState({minYear});
                      }}
                      maxLength={4}
                    />
                  }
                />
                <FlatList
                  extraData={this.state.maxYearsList}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  style={{
                    height: Dimensions.get('screen').height * 0.3,
                    flex: 1,
                  }}
                  stickyHeaderIndices={[0]}
                  data={this.state.maxYearsList}
                  renderItem={this.renderMaxYearItem.bind(this)}
                  ListHeaderComponent={
                    <TextInput
                      placeholder={Languages.RangeTo}
                      keyboardType="number-pad"
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        fontFamily: 'Cairo-Regular',

                        marginBottom: 10,
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        paddingVertical: 3,
                        textAlign: 'center',
                        width: Dimensions.get('screen').width * 0.3,
                      }}
                      value={this.state.maxYear}
                      onChangeText={maxYear => {
                        this.setState({maxYear});
                      }}
                      maxLength={4}
                    />
                  }
                />
              </View>
            </View>
            {this.renderOkCancelButton(
              () => {
                this.setState({
                  minYear: '',
                  maxYear: '',
                  maxYearsList: this.state.FullmaxYearsList,
                  minYearsList: this.state.FullminYearsList,
                });
                this.yearModal.close();
              },
              () => {
                this.yearModal.close();
                this.setState(
                  {
                    minYear: '',
                    maxYear: '',
                    maxYearsList: this.state.FullmaxYearsList,
                    minYearsList: this.state.FullminYearsList,
                    selectedMinYear: this.state.minYear,
                    selectedMaxYear: this.state.maxYear,
                    btnloader: true,
                  },
                  () => {
                    if (!this.filterModal.isOpen) {
                      this.filterResults();
                    }
                  },
                );
              },
            )}
          </View>
        </AutobeebModal>
        <AutobeebModal //Price modal
          ref={instance => (this.PriceModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose={false}
          coverscreen={false}
          //   isOpen={true}
          backdropOpacity={0.5}>
          <View style={[styles.modelContainer]}>
            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  borderBottomColor: Color.secondary,
                  marginBottom: 10,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.rangeTitle}>{Languages.Price}</Text>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      minPrice: '',
                      maxPrice: '',
                      maxPricesList: this.state.FullmaxPricesList,
                      minPricesList: this.state.FullminPricesList,
                    });
                  }}>
                  <Text style={styles.rangeCancel}>{Languages.Reset}</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  style={{
                    height: Dimensions.get('screen').height * 0.3,
                    flex: 1,
                  }}
                  data={this.state.minPricesList}
                  renderItem={this.renderMinPriceItem.bind(this)}
                  stickyHeaderIndices={[0]}
                  ListHeaderComponent={
                    <TextInput
                      placeholder={Languages.From}
                      keyboardType="number-pad"
                      value={this.state.minPrice}
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        fontFamily: 'Cairo-Regular',

                        marginBottom: 10,
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        paddingVertical: 3,
                        textAlign: 'center',
                        width: Dimensions.get('screen').width * 0.3,
                      }}
                      onChangeText={minPrice => {
                        this.setState({minPrice});
                      }}
                      maxLength={8}
                    />
                  }
                />
                <FlatList
                  extraData={this.state.maxPricesList}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  style={{
                    height: Dimensions.get('screen').height * 0.3,
                    flex: 1,
                  }}
                  stickyHeaderIndices={[0]}
                  data={this.state.maxPricesList}
                  renderItem={this.renderMaxPriceItem.bind(this)}
                  ListHeaderComponent={
                    <TextInput
                      placeholder={Languages.RangeTo}
                      keyboardType="number-pad"
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        fontFamily: 'Cairo-Regular',

                        marginBottom: 10,
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        paddingVertical: 3,
                        textAlign: 'center',
                        width: Dimensions.get('screen').width * 0.3,
                      }}
                      value={this.state.maxPrice}
                      onChangeText={maxPrice => {
                        this.setState({maxPrice});
                      }}
                      maxLength={8}
                    />
                  }
                />
              </View>
            </View>
            {this.renderOkCancelButton(
              () => {
                this.PriceModal.close();
                this.setState({
                  minPrice: '',
                  maxPrice: '',
                  maxPricesList: this.state.FullmaxPricesList,
                  minPricesList: this.state.FullminPricesList,
                });
              },
              () => {
                this.PriceModal.close();
                this.setState(
                  {
                    minPrice: '',
                    maxPrice: '',
                    maxPricesList: this.state.FullmaxPricesList,
                    minPricesList: this.state.FullminPricesList,
                    selectedMinPrice: this.state.minPrice,
                    selectedMaxPrice: this.state.maxPrice,
                    btnloader: true,
                  },
                  () => {
                    if (!this.filterModal.isOpen) {
                      this.filterResults();
                    }
                  },
                );
              },
            )}
          </View>
        </AutobeebModal>
        <AutobeebModal //Mileage modal
          ref={instance => (this.MileageModal = instance)}
          style={[styles.modelModal]}
          position="center"
          keyboardResponsive={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose={false}
          coverscreen={false}
          //   isOpen={true}
          backdropOpacity={0.5}>
          <View style={[styles.modelContainer]}>
            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  borderBottomColor: Color.secondary,
                  marginBottom: 10,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.rangeTitle}>
                  {this.props.route.params?.ListingType?.ID == 4
                    ? Languages.Hours
                    : Languages.Mileage}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      minMileage: '',
                      maxMileage: '',
                      maxMileagesList: this.state.FullmaxMileagesList,
                      minMileagesList: this.state.FullminMileagesList,
                    });
                  }}>
                  <Text style={styles.rangeCancel}>{Languages.Reset}</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  style={{
                    height: Dimensions.get('screen').height * 0.3,
                    flex: 1,
                  }}
                  data={this.state.minMileagesList}
                  renderItem={this.renderMinMileageItem.bind(this)}
                  stickyHeaderIndices={[0]}
                  ListHeaderComponent={
                    <TextInput
                      placeholder={Languages.From}
                      keyboardType="number-pad"
                      value={this.state.minMileage}
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        fontFamily: 'Cairo-Regular',

                        marginBottom: 10,
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        paddingVertical: 3,
                        textAlign: 'center',
                        width: Dimensions.get('screen').width * 0.3,
                      }}
                      onChangeText={minMileage => {
                        this.setState({minMileage});
                      }}
                      maxLength={8}
                    />
                  }
                />
                <FlatList
                  extraData={this.state.maxMileagesList}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  style={{
                    height: Dimensions.get('screen').height * 0.3,
                    flex: 1,
                  }}
                  stickyHeaderIndices={[0]}
                  data={this.state.maxMileagesList}
                  renderItem={this.renderMaxMileageItem.bind(this)}
                  ListHeaderComponent={
                    <TextInput
                      placeholder={Languages.RangeTo}
                      keyboardType="number-pad"
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        fontFamily: 'Cairo-Regular',

                        marginBottom: 10,
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        paddingVertical: 3,
                        textAlign: 'center',
                        width: Dimensions.get('screen').width * 0.3,
                      }}
                      value={this.state.maxMileage}
                      onChangeText={maxMileage => {
                        this.setState({maxMileage});
                      }}
                      maxLength={8}
                    />
                  }
                />
              </View>
            </View>
            {this.renderOkCancelButton(
              () => {
                this.setState({
                  minMileage: '',
                  maxMileage: '',
                  maxMileagesList: this.state.FullmaxMileagesList,
                  minMileagesList: this.state.FullminMileagesList,
                });
                this.MileageModal.close();
              },
              () => {
                this.MileageModal.close();
                this.setState(
                  {
                    minMileage: '',
                    maxMileage: '',
                    maxMileagesList: this.state.FullmaxMileagesList,
                    minMileagesList: this.state.FullminMileagesList,
                    selectedMinMileage: this.state.minMileage,
                    selectedMaxMileage: this.state.maxMileage,
                    btnloader: true,
                  },
                  () => {
                    if (!this.filterModal.isOpen) {
                      this.filterResults();
                    }
                  },
                );
              },
            )}
          </View>
        </AutobeebModal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainListingsComponentItem: {
    borderRadius: 5,
    borderWidth: 0,
    overflow: 'hidden',
    marginHorizontal: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    justifyContent: 'space-between',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    marginBottom: 4,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width * 0.485,
  },
  MainListingsComponentImage: {
    width: Dimensions.get('window').width * 0.485,
    height: Dimensions.get('window').height * 0.2,
  },
  modelContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginBottom: 80,
    //   height: Dimensions.get("screen").height * 0.7,

    width: Dimensions.get('screen').width * 0.85,
  },
  rangeTitle: {fontSize: 17, color: '#000'},
  rangeCancel: {
    color: Color.secondary,
  },
  rangeBox: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    borderColor: '#e6e6e6',
    width: Dimensions.get('screen').width * 0.45,
  },
  rangeBoxText: {
    textAlign: 'left',
    color: 'gray',
    fontSize: 16,
  },
  modalRowContainer: {
    marginVertical: 3,
    paddingBottom: 5,
    height: 50,
    justifyContent: 'center',
    //       borderWidth:1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  filterSectionContainer: {
    elevation: 2,
    borderWidth: 0,
    overflow: 'hidden',
    marginHorizontal: 7,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  filterValueContainer: {
    flexDirection: 'row',
    width: Dimensions.get('screen').width,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    padding: 10,
  },
  FilterSectionHeader: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e6e6e6',
    borderBottomColor: '#e6e6e6',
    paddingHorizontal: 10,
  },
  FilterSectionHeaderText: {
    color: Color.secondary,
    fontSize: 17,
    textAlign: 'left',
  },

  FilterButton: {
    borderColor: Color.secondary,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  filterContainer: {},
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',
    borderWidth: 0,
    elevation: 2,
    padding: 10,
  },
  sortContainerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
  },
  modal: {
    elevation: 10,
    zIndex: 20,
    height: Dimensions.get('screen').height * 0.9,
    width: Dimensions.get('screen').width,
  },
  modelModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
  },

  filterModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    height: '100%',
    justifyContent: 'flex-end',
    width: Dimensions.get('screen').width,
    padding: 0,
    elevation: 10,
  },
  sellTypeModal: {
    zIndex: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    flex: 1,
  },
  sortContainerText: {
    textAlign: 'left',
    color: '#000',
    fontSize: MediumFont,
  },
  whiteContainer: {
    backgroundColor: 'white',
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
  PartNumberInput: {
    height: 45,
    fontFamily: 'Cairo-Regular',
    paddingHorizontal: 15,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  NoRelatedOffers: {
    width: '90%',
    alignSelf: 'center',
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 18,
    fontWeight: 700,
    marginVertical: 5,
  },
  OfferSimilerSearch: {
    width: '90%',
    color: Color.primary,
    alignSelf: 'center',
    paddingVertical: 5,
    fontSize: 18,
    fontWeight: 700,
    marginVertical: 5,
  },
  Line: {
    width: '50%',
    borderWidth: 0.5,
    borderColor: Color.primary,
    alignSelf: 'center',
  },
  filterBox: {},
  filterIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  HeaderFiltersBtns: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  HeaderRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  HeaderRow2: {
    width: Dimensions.get('screen').width - 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    overflow: 'scroll',
    gap: 5,
  },
  HeaderRowContainer: {
    width: '100%',
    flexDirection: 'column',
    paddingBottom: 6,
    paddingTop: 6,
    gap: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#2b2b2b1f',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    height: 32,
    paddingHorizontal: 6,
    marginEnd: 5,
    minWidth: 75,
  },
  filterButtonText: {
    color: '#000',
    textAlign: 'center',
    verticalAlign: 'middle',
    paddingEnd: 3,
    fontSize: 13,
    fontFamily: Constants.fontFamilyBold,
  },
  LoadingList: {
    paddingTop: Constants.listingsHeaderHiegth + FILTER_HEADER_HEIGHT + 10,
    backgroundColor: '#fff',
  },
  animatedText: {
    fontSize: 14,
    overflow: 'hidden',
    textAlign: 'center',
    verticalAlign: 'top',
    fontWeight: '700',
    color: '#000',
  },
});

const mapStateToProps = ({menu, user}) => ({
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
  user: user.user,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/MenuRedux');
  const {recentFilterSeach} = require('../redux/RecentListingsRedux');

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),
    recentFilterSeach: (filterObj, selectedEntities) =>
      dispatch(recentFilterSeach(filterObj, selectedEntities)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListingsScreen);
