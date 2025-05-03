import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  I18nManager,
  Platform,
  Linking,
  Pressable,
  Animated,
  Modal,
} from 'react-native';
import {NewHeader} from '../containers';
import {
  MainListingsComponent,
  BannerListingsComponent,
  RowListingsComponent,
  LogoSpinner,
  FeatueredListingCard,
  BottomNavigationBar,
  SkeletonCard,
  AutobeebModal,
} from '../components';
import AddAdvButtonSquare from '../components/AddAdvButtonSquare';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconEn from 'react-native-vector-icons/Entypo';
import {Color, ExtractScreenObjFromUrl} from '../common';
import IconIon from 'react-native-vector-icons/Ionicons';
import Languages from '../common/Languages';
import KS from '../services/KSAPI';
import Constants from '../common/Constants';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import FeatueredListingsCards from '../components/ListingsComponent/FeatueredListingsCards';
import Octicons from 'react-native-vector-icons/Octicons';
import {
  CardsViewIcon,
  FilterIcon,
  SortIcon,
  CardViewIcon,
} from '../components/SVG';
import {Easing} from 'react-native';

const BigFont = 22;
const MediumFont = 16;
const SmallFont = 14;
const pageSize = 16;
let ViewsIds = [];
const FILTER_HEADER_HEIGHT = 100;
const FILTER_HEADER_HEIGHT_WITHOUT_TAGS = 50;
const SCREEN_WIDTH = Dimensions.get('screen').width;

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.intrestedFlag = false;
    this.similarAdsFlag = false;
    this.state = {
      renderType: 1,
      PageNum: 1,
      isLoading: true,
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
    this.widthTo33 = new Animated.Value(22);
    this.filterHieght = new Animated.Value(FILTER_HEADER_HEIGHT);
    this.widthToFull = new Animated.Value(SCREEN_WIDTH / 2);
    this.headerSpace = new Animated.Value(
      Constants.listingsHeaderHiegth + FILTER_HEADER_HEIGHT,
    ); // initially visible
    this.lastScrollY = 0; // Keep this as a number!
  }

  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  componentDidMount() {
    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : '2',
    })
      .then(result => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));
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
    KS.FreeSearch({
      searchFor: !!this.props.route.params?.submitted
        ? this.props.route.params?.query ?? ''
        : '',
      makeID: this.props.route.params?.MakeID ?? '',
      modelID: this.props.route.params?.ModelID ?? '',
      langID: Languages.langID,
      isocode: this.props.ViewingCountry.cca2,
      pagenum: this.state.PageNum,
      userid: (this.props.user && this.props.user.ID) || '',
      cur: this.state.currency?.ID,
      pageSize,
    }).then(data => {
      if (data && data.Success) {
        this.countListingsViews(
          data.Listings.map(x => x.ID),
          this.state.PageNum,
          data.Pages,
        );

        this.setState({
          Listings: data.Listings,
          ISOCode: data.ISOCode,
          NoRelatedOffers: data.NoRelatedOffers,
          NumberOfIntrested: data.NumberOfIntrested,
          isLoading: false,
          maximumPages: data.Pages,
        });
        this.intrestedFlag = false;
        this.similarAdsFlag = false;
      }
    });
    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 3,
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

    KS.GetCountry({Id: `${this.props.ViewingCountry?.cca2}`.toLowerCase()})
      .then(res => {
        this.setState({Country: res.Country});
      })
      .catch(err => {
        console.log({err});
      });

    if (this.props.route.params?.Make) {
      this.setState({
        CanFilter: true,
        selectedMake: this.props.route.params?.Make || 0,
        selectedModel: this.props.route.params?.Model || undefined,
      });
    }

    let tempTypes = [...this.props.homePageData.MainTypes];
    let lastItem = tempTypes.splice(5, 1)[0]; // remove spare parts from last
    tempTypes.splice(1, 0, lastItem); //add spare parts to 2nd option per client request
    this.setState({MainTypes: tempTypes});
  }
  renderSelectedCityName() {
    if (!this.state.selectedCity?.length || !this.state.selectedCity[0].ID) {
      return Languages.AllCities;
    }

    let _names = this.state.selectedCity.map(item => item.Name);
    let totalLength = _names.join(', ').length;

    if (totalLength > 15) {
      let truncatedNames = '';
      let currentLength = 0;
      let remainingCitiesCount = 0;

      for (let name of _names) {
        if (currentLength + name.length + 2 > 15) {
          remainingCitiesCount = _names.length - _names.indexOf(name);
          break;
        }
        truncatedNames += name + ', ';
        currentLength += name.length + 2;
      }

      return remainingCitiesCount > 0
        ? `${truncatedNames.slice(0, -2)}... +${remainingCitiesCount}`
        : `${truncatedNames.slice(0, -2)}...`;
    }

    if (_names.length > 3) {
      const displayedCities = _names.slice(0, 3);
      const remainingCitiesCount = _names.length - 3;
      return `${displayedCities.join(', ')} +${remainingCitiesCount}`;
    } else {
      return _names.join(', ');
    }
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

  renderCatRow({item}) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          this.props.navigation.navigate('SearchResult', {
            Category: this.props.route.params?.Category,
            SubCategory: this.props.route.params?.SubCategory,
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
    //  alert(JSON.stringify(item));
    if (item.skip && this.state.renderType != 1) {
      return <View></View>;
    }
    if (item.skipForAutoBeebBanner && this.state.renderType != 1) {
      return <View></View>;
    }

    if (item.Banner && this.state.renderType == 1) {
      return;
    }

    if (item.AutoBeebBanner) {
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
    }

    switch (item.IsSpecial ? 4 : this.state.renderType) {
      case 1:
        return (
          <MainListingsComponent
            item={item}
            key={index}
            AllCountries={this.state.ISOCode == 'ALL'}
            AppCountryCode={this.state.ISOCode}
            navigation={this.props.navigation}
            imageStyle={{
              width: Dimensions.get('window').width * 0.485,
              height: Dimensions.get('window').height * 0.2,
            }}
            itemStyle={{
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
            }}
          />
        );

      case 2:
        return (
          <BannerListingsComponent
            key={index}
            AllCountries={this.state.ISOCode == 'ALL'}
            AppCountryCode={this.state.ISOCode}
            item={item}
            navigation={this.props.navigation}
          />
        );
      case 4:
        return (
          <FeatueredListingCard
            key={index}
            AllCountries={this.state.ISOCode == 'ALL'}
            AppCountryCode={this.state.ISOCode}
            item={item}
            navigation={this.props.navigation}
            SelectedCities={this.state.selectedCity}
            // isListingsScreen
          />
        );
    }
  }

  renderSortBox = (text, icon, onPress) => {
    return (
      <TouchableOpacity
        style={[
          styles.sortContainerBox,
          icon != 'filter' && {
            borderRightColor: '#333',
            borderRightWidth: 1,
            paddingRight: 10,
          },
        ]}
        onPress={() => {
          onPress();
        }}>
        <IconFa name={icon} size={20} color={'#000'} style={{marginRight: 5}} />
        <Text style={styles.sortContainerText}>{text}</Text>
      </TouchableOpacity>
    );
  };

  renderCurrencyRow(Currency) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        key={Currency.ID}
        onPress={() => {
          global.ViewingCurrency = Currency;
          this.setState({
            currency: Currency,
            PageNum: 1,
          });
          this.openCurrencyModal.close();
          KS.FreeSearch({
            searchFor: this.props.route.params?.query ?? '',
            makeID: this.props.route.params?.MakeID ?? '',
            modelID: this.props.route.params?.ModelID ?? '',
            langID: Languages.langID,
            isocode: this.props.ViewingCountry.cca2,
            pagenum: 1,

            selltype:
              this.state.sellType && this.state.sellType.ID
                ? this.state.sellType.ID
                : '',
            typeid:
              this.state.ListingType && this.state.ListingType.ID
                ? this.state.ListingType.ID
                : '',
            sortby:
              this.state.sortOption && this.state.sortOption.sortBy
                ? this.state.sortOption.sortBy
                : '',
            asc:
              this.state.sortOption && this.state.sortOption.asc
                ? this.state.sortOption.asc
                : '',
            cur: Currency.ID,
            pageSize,
          }).then(data => {
            if (data && data.Success) {
              this.countListingsViews(
                data.Listings.map(x => x.ID),
                1,
                data.Pages,
              );

              this.setState({
                Listings: data.Listings,
                isLoading: false,
                maximumPages: data.Pages,
                NoRelatedOffers: data.NoRelatedOffers,
                NumberOfIntrested: data.NumberOfIntrested,
              });
              this.intrestedFlag = false;
              this.similarAdsFlag = false;
            }
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
  renderSellTypesRow(SellType) {
    if (
      this.state.ListingType &&
      this.state.ListingType.ID == 32 &&
      SellType.ID == 2
    ) {
      // hide "rent" from spare parts
      return;
    }
    return (
      <TouchableOpacity
        key={SellType.ID}
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          this.openSellTypeModal.close();
          this.setState(
            {
              sellType: SellType,
              PageNum: 1,
              footerLoading: false,
              isLoading: true,
            },
            () => {
              KS.FreeSearch({
                searchFor: this.props.route.params?.query ?? '',
                makeID: this.props.route.params?.MakeID ?? '',
                modelID: this.props.route.params?.ModelID ?? '',
                langID: Languages.langID,
                isocode: this.props.ViewingCountry.cca2,
                pagenum: this.state.PageNum,
                selltype: SellType.ID,
                typeID: this.state.ListingType.ID,
                cur: this.state.currency?.ID,
                pageSize,
              }).then(data => {
                if (data && data.Success) {
                  this.countListingsViews(
                    data.Listings.map(x => x.ID),
                    this.state.PageNum,
                    data.Pages,
                  );

                  this.setState({
                    Listings: data.Listings,
                    isLoading: false,
                    maximumPages: data.Pages,
                    NoRelatedOffers: data.NoRelatedOffers,
                    NumberOfIntrested: data.NumberOfIntrested,
                  });
                  this.intrestedFlag = false;
                  this.similarAdsFlag = false;
                }
              });
            },
          );
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

  renderMainTypesRow(MainType) {
    return (
      <TouchableOpacity
        key={MainType.ID}
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          this.mainTypesModal.close();
          this.setState({ListingType: MainType}, () => {
            if (this.state.goToFilter) {
              this.props.navigation.navigate('SellTypeScreen', {
                ListingType: MainType,
                cca2: this.props.ViewingCountry?.cca2 || 'us',
              });
            } else {
              this.openSellTypeModal.open();
            }
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
              width: 40,
              height: 40,
              flex: 1,
            }}
            //  tintColor={Color.secondary}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri:
                'https://autobeeb.com/' +
                MainType.FullImagePath +
                '_115x115.png',
            }}
          />
          <Text
            style={{
              color: '#000',
              marginLeft: 20,
              fontSize: 22,
              flex: 5,
              textAlign: 'left',
            }}>
            {MainType.Name}
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

  renderMainTypesBubble(MainType) {
    let IsActive = this.state.ListingType?.ID == MainType.ID;
    return (
      <TouchableOpacity
        key={MainType.ID}
        activeOpacity={0.9}
        style={{
          backgroundColor: IsActive ? Color.primary : 'white',
          elevation: 1,
          marginLeft: 10,
          borderRadius: 5,
          paddingHorizontal: 10,
          marginBottom: 10,
          paddingVertical: 5,
        }}
        onPress={() => {
          this.setState({ListingType: MainType}, () => {
            this.setState(
              {
                sellType: {
                  ID: 1,
                  Name: Languages.ForSale,
                  img: require('../images/SellTypes/BlueAll.png'),
                  backgroundColor: '#D31018',
                },
                PageNum: 1,
                footerLoading: false,
                isLoading: true,
              },
              () => {
                KS.FreeSearch({
                  searchFor: this.props.route.params?.query ?? '',
                  makeID: this.props.route.params?.MakeID ?? '',
                  modelID: this.props.route.params?.ModelID ?? '',
                  langID: Languages.langID,
                  isocode: this.props.ViewingCountry.cca2,
                  pagenum: this.state.PageNum,
                  selltype: 7,
                  typeID: this.state.ListingType.ID,
                  cur: this.state.currency?.ID,
                  pageSize,
                }).then(data => {
                  if (data && data.Success) {
                    this.countListingsViews(
                      data.Listings.map(x => x.ID),
                      this.state.PageNum,
                      data.Pages,
                    );

                    this.setState({
                      Listings: data.Listings,
                      isLoading: false,
                      maximumPages: data.Pages,
                      NoRelatedOffers: data.NoRelatedOffers,
                      NumberOfIntrested: data.NumberOfIntrested,
                    });
                    this.intrestedFlag = false;
                    this.similarAdsFlag = false;
                  }
                });
              },
            );
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {
            <FastImage
              style={{
                width: 30,
                height: 30,
              }}
              tintColor={IsActive ? '#fff' : '#000'}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri:
                  'https://autobeeb.com/' +
                  MainType.FullImagePath +
                  '_115x115.png',
              }}
            />
          }
          <Text
            style={{
              color: IsActive ? '#fff' : '#000',
              marginLeft: 10,
              fontSize: 18,
              textAlign: 'left',
            }}>
            {MainType.Name}
          </Text>
        </View>
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
          this.setState(
            {
              sortOption: SortOption,
              PageNum: 1,
              isLoading: true,
            },
            () => {
              this.openSortModal.close();
              KS.FreeSearch({
                searchFor: this.props.route.params?.query ?? '',
                makeID: this.props.route.params?.MakeID ?? '',
                modelID: this.props.route.params?.ModelID ?? '',
                langID: Languages.langID,
                isocode: this.props.ViewingCountry.cca2,
                pagenum: this.state.PageNum,
                sortby: SortOption.sortBy,
                asc: SortOption.asc,
                selltype:
                  this.state.sellType && this.state.sellType.ID
                    ? this.state.sellType.ID
                    : '',
                typeid:
                  this.state.ListingType && this.state.ListingType.ID
                    ? this.state.ListingType.ID
                    : '',
                cur: this.state.currency?.ID,
                pageSize,
              }).then(data => {
                if (data && data.Success) {
                  this.countListingsViews(
                    data.Listings.map(x => x.ID),
                    this.state.PageNum,
                    data.Pages,
                  );

                  this.setState({
                    Listings: data.Listings,
                    isLoading: false,
                    maximumPages: data.Pages,
                    NoRelatedOffers: data.NoRelatedOffers,
                    NumberOfIntrested: data.NumberOfIntrested,
                  });
                  this.intrestedFlag = false;
                  this.similarAdsFlag = false;
                }
              });
            },
          );
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

  openMainTypesModal(fromFilter) {
    this.mainTypesModal.open();
    this.setState({goToFilter: fromFilter});
  }

  Filters() {
    return [];
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
                  this.openCurrencyModal.open();
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
                    if (this.state.selectedMake && this.state.ListingType) {
                      this.props.navigation.replace('ListingsScreen', {
                        ListingType: this.state.ListingType,
                        shouldOpenFilter: true,
                        SellType: this.state.sellType || {
                          ID: 1,
                          Name: Languages.ForSale,
                          img: require('../images/SellTypes/BlueAll.png'),
                        },
                        selectedMake: this.state.selectedMake,
                        selectedModel: this.state.selectedModel,
                        query: this.props.route.params?.query || 0,
                      });
                    } else {
                      this.mainTypesModal.open();
                    }
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
                    this.openSortModal.open();
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
                </Pressable>
              </View>
            }
          </View>
        }
        {
          <Animated.View style={{maxHeight: this.widthTo0}}>
            <FlatList
              style={{}}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{}}
              horizontal
              data={this.state.MainTypes}
              renderItem={({item, index}) => {
                return this.renderMainTypesBubble(item);
              }}
            />
          </Animated.View>
        }
        {/*
         <View style={styles.HeaderRow2}>
          <FlatList
            data={this.Filters()}
            horizontal
            contentContainerStyle={{minWidth: '100%'}}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled
            renderItem={({item, index}) => {
              if (item.IsDisplay)
                return (
                  <Pressable style={styles.filterButton} onPress={item.OnPress}>
                    <Text style={styles.filterButtonText}>{item.Name}</Text>
                    <IconMa
                      name={'keyboard-arrow-down'}
                      size={20}
                      color={'#000'}
                    />
                  </Pressable>
                );
              return <></>;
            }}
            showsHorizontalScrollIndicator={false}
          />
        </View> 
        */}
      </Animated.View>
    );
  }

  LoadListingsPage = async () => {
    if (!this.state.footerLoading) {
      this.setState({PageNum: this.state.PageNum + 1}, () => {
        if (this.state.PageNum <= this.state.maximumPages) {
          this.setState({footerLoading: true});
          //khaled
          KS.FreeSearch({
            searchFor:
              this.props.route.params?.submitted ?? false
                ? this.props.route.params?.query ?? ''
                : '',
            makeID: this.props.route.params?.MakeID ?? '',
            modelID: this.props.route.params?.ModelID ?? '',
            langID: Languages.langID,
            isocode: this.props.ViewingCountry.cca2,
            pagenum: this.state.PageNum,
            selltype:
              this.state.sellType && this.state.sellType.ID
                ? this.state.sellType.ID
                : '',
            typeid:
              this.state.ListingType && this.state.ListingType.ID
                ? this.state.ListingType.ID
                : '',
            sortby:
              this.state.sortOption && this.state.sortOption.sortBy
                ? this.state.sortOption.sortBy
                : '',
            asc:
              this.state.sortOption && this.state.sortOption.asc
                ? this.state.sortOption.asc
                : '',
            cur: this.state.currency?.ID,
            pageSize,
          }).then(data => {
            if (data && data.Success) {
              this.countListingsViews(
                data.Listings.map(x => x.ID),
                this.state.PageNum,
                data.Pages,
              );

              let concattedListings = this.state.Listings;
              let tempBanners = this.state.Banners || [];

              if (this.state.Banners?.length > 0) {
                concattedListings.push({
                  AutoBeebBanner: true,
                  BannerDetails: tempBanners.shift(),
                });

                this.setState({Banners: tempBanners});
                concattedListings.push({
                  skipForAutoBeebBanner: true,
                });
              }
              // else {
              //   concattedListings.push({Banner: true});
              //   concattedListings.push({skip: true});
              // }

              concattedListings = concattedListings.concat(data.Listings);
              this.setState(
                {
                  Listings: concattedListings,
                  maximumPages: data.Pages,
                  NoRelatedOffers: data.NoRelatedOffers,
                  NumberOfIntrested: data.NumberOfIntrested,
                },
                () => {
                  this.intrestedFlag = false;
                  this.similarAdsFlag = false;
                  setTimeout(() => {
                    this.setState({footerLoading: false});
                  }, 1000);
                },
              );
            }
          });
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
    if (!this.state.footerLoading) return <></>;
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          marginBottom: 50,
        }}>
        <ActivityIndicator size="large" color={'#F85502'} />
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
        Animated.timing(this.headerSpace, {
          toValue:
            direction === 'down'
              ? FILTER_HEADER_HEIGHT_WITHOUT_TAGS
              : Constants.listingsHeaderHiegth + FILTER_HEADER_HEIGHT,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.widthTo0, {
          toValue: direction === 'down' ? 0 : 150,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.widthTo33, {
          toValue: direction === 'down' ? SCREEN_WIDTH / 3 - 20 : 22,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad),
        }),
        // Animated.timing(this.widthTo100, {
        //   toValue: direction === 'down' ? 100 : 0,
        //   duration: 200,
        //   useNativeDriver: false,
        //   easing: Easing.inOut(Easing.quad),
        // }),
        Animated.timing(this.widthToFull, {
          toValue: direction === 'down' ? SCREEN_WIDTH : SCREEN_WIDTH / 2,
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
            make
            query={this.props.route.params?.query || 0}
            onCountryChange={item => {
              this.setState(
                {
                  cca2: item.cca2,
                  PageNum: 1,
                  isLoading: true,
                  ISOCode: item.cca2,
                },
                () => {
                  KS.FreeSearch({
                    searchFor: this.props.route.params?.query ?? '',
                    makeID: this.props.route.params?.MakeID ?? '',
                    modelID: this.props.route.params?.ModelID ?? '',
                    langID: Languages.langID,
                    isocode: this.state.cca2,
                    pagenum: this.state.PageNum,
                    userid: (this.props.user && this.props.user.ID) || '',
                    cur: this.state.currency?.ID,
                    pageSize,
                  }).then(data => {
                    if (data && data.Success) {
                      this.countListingsViews(
                        data.Listings.map(x => x.ID),
                        1,
                        data.Pages,
                      );

                      this.setState({
                        Listings: data.Listings,
                        isLoading: false,
                        maximumPages: data.Pages,
                        NoRelatedOffers: data.NoRelatedOffers,
                        NumberOfIntrested: data.NumberOfIntrested,
                      });
                      this.intrestedFlag = false;
                      this.similarAdsFlag = false;
                    }
                  });
                },
              );
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

        {this.state.isLoading ? (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            data={[1, 2, 3, 4]}
            contentContainerStyle={styles.LoadingList}
            renderItem={item => <SkeletonCard />}
          />
        ) : (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={this.state.renderType == 1 ? 2 : 1}
            contentContainerStyle={styles.LoadingList}
            key={this.state.renderType}
            ListEmptyComponent={this.renderEmptyComponent()}
            data={this.state.Listings.filter(x => !x.IsSpecial)}
            renderItem={this.renderItem.bind(this)}
            onEndReached={this.LoadListingsPage}
            onEndReachedThreshold={0.5} //was 0.5
            ListHeaderComponent={
              <>
                {[
                  ...this.state.Listings.filter(
                    x =>
                      x.IsSpecial && x.CountryID == `${this.state.Country?.ID}`,
                  ),
                ].length == 0 &&
                  !this.state.NoRelatedOffers &&
                  `${this.props.ViewingCountry?.cca2}`.toLowerCase() !=
                    'all' && (
                    <FeatueredListingsCards
                      ISOCode={this.state.ISOCode}
                      country={this.props.ViewingCountry}
                      langId={Languages.langID}
                      selectedCity={this.state.selectedCity}
                      type={(this.state.Listings ?? [{}])[0]?.TypeID}
                      fallbackTypes={[1, 2, 4, 8]}
                    />
                  )}

                {!!this.state.NoRelatedOffers && (
                  <>
                    <Text style={styles.NoRelatedOffers}>
                      {Languages.NoResultsFound}
                    </Text>

                    <View style={styles.Line} />

                    <Text style={styles.OfferSimilerSearch}>
                      {Languages.AdsMaybeOfInterestToYou} {' : '}
                    </Text>
                  </>
                )}

                {/* in case listings array incloud featured listings */}
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  numColumns={1}
                  key={this.state.renderType}
                  data={this.state.Listings.filter(x => x.IsSpecial)}
                  renderItem={this.renderItem.bind(this)}
                />
              </>
            }
            ListFooterComponent={this.renderListingsFooter()}
            onScroll={this.onScrollHandler}
          />
        )}

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

        <AutobeebModal
          ref={instance => (this.openCurrencyModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          backButtonClose={true}
          entry="bottom"
          swipeToClose={true}
          coverscreen={false}
          backdropOpacity={0.5}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}>
            <View
              style={{backgroundColor: 'white', padding: 5, borderRadius: 10}}>
              {this.state.PrimaryCurrencies &&
                this.state.PrimaryCurrencies.map(type =>
                  this.renderCurrencyRow(type),
                )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.openCurrencyModal.close();
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

        <AutobeebModal //sort modal
          ref={instance => (this.openSortModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          backButtonClose={true}
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
              style={{backgroundColor: 'white', padding: 5, borderRadius: 10}}>
              {this.SortOptions.map(type => this.renderSortOptionRow(type))}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.openSortModal.close();
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

        <AutobeebModal
          ref={instance => (this.openSellTypeModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          backButtonClose={true}
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
              style={{backgroundColor: 'white', padding: 5, borderRadius: 10}}>
              {this.sellTypesFilter.map(type => this.renderSellTypesRow(type))}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.openSellTypeModal.close();
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

        <AutobeebModal //maintypes modal
          ref={instance => (this.mainTypesModal = instance)}
          style={[styles.sellTypeModal]}
          position="center"
          backButtonClose={true}
          entry="bottom"
          swipeToClose={true}
          // backdropPressToClose
          coverscreen={false}
          backdropOpacity={0.5}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}>
            <View
              style={{backgroundColor: 'white', padding: 5, borderRadius: 10}}>
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  textAlign: 'center',
                  paddingVertical: 10,
                }}>
                {Languages.SelectDesiredSection}
              </Text>
              {this.props.homePageData.MainTypes.map(type =>
                this.renderMainTypesRow(type),
              )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.mainTypesModal.close();
                }}>
                <Text
                  style={{
                    color: Color.primary,
                    flex: 1,
                    fontSize: 22,
                    textAlign: 'center',
                  }}>
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AutobeebModal>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: '#1C7DA2',
          }}></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modelContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    alignSelf: 'center',
    //   height: Dimensions.get("screen").height * 0.7,
    width: Dimensions.get('screen').width * 0.8,
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
    //borderColor:Color.secondary,
    overflow: 'hidden',
    marginHorizontal: 7,
    borderRadius: 5,
    backgroundColor: '#fff',
    //   borderWidth: 1,
    //  borderColor: "#f00",
    marginVertical: 5,
  },
  filterValueContainer: {
    flexDirection: 'row',
    width: Dimensions.get('screen').width,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    //  borderColor: Color.secondary,
    padding: 10,
    //  borderBottomWidth: 1,
    //   borderColor: "#e6e6e6"
  },
  FilterSectionHeader: {
    // marginBottom: 10,
    backgroundColor: '#fff',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e6e6e6',
    borderBottomColor: '#e6e6e6',
    paddingHorizontal: 10,
  },
  FilterSectionHeaderText: {
    //color: "#808080",
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
  filterContainer: {
    //   paddingVertical: 20
  },
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
    // backgroundColor: "#fff",
    justifyContent: 'center',
  },
  modal: {
    zIndex: 50,

    elevation: 10,
    zIndex: 20,

    height: Dimensions.get('screen').height * 0.8,

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
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },

  filterModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    height: '100%',
    justifyContent: 'flex-end',
    width: Dimensions.get('screen').width,
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },
  sellTypeModal: {
    zIndex: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    height: '100%',
    flex: 1,
  },
  sortContainerText: {
    textAlign: 'left',
    color: '#000',
    fontSize: MediumFont,
  },
  whiteContainer: {
    //  marginBottom: 10,
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
    // marginHorizontal: 4,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
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
  filterIcon: {},
  HeaderRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  HeaderRowContainer: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 6,
    marginTop: 6,
    gap: 6,
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
    borderColor: '#2b2b2b',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    height: 28,
    paddingHorizontal: 6,
    marginEnd: 5,
    minWidth: 75,
  },
  filterButtonText: {
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    verticalAlign: 'middle',
    paddingEnd: 3,
    fontSize: 12,
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

const mapStateToProps = ({home, menu, user}) => ({
  homePageData: home.homePageData,
  user: user.user,
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/MenuRedux');

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),

    //  fetchListings: (parentid) => Listingredux.actions.fetchListings(dispatch, parentid, 1)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResult);
