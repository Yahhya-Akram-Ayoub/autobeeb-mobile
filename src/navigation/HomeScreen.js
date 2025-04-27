import React, {Component} from 'react';
import NewHeader from '../containers/NewHeader';
import {connect} from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  Image,
  Platform,
  I18nManager,
} from 'react-native';
import {Color, Constants, ExtractScreenObjFromUrl, Languages} from '../common';
import {
  LogoSpinner,
  MainListingsComponent,
  DealersBanner,
  ImagePopUp,
  HorizontalSwiper,
} from '../components';
import IconFa from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import KS from '../services/KSAPI';
import HTML from 'react-native-render-html';
import FastImage from 'react-native-fast-image';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BigFont = 22;
const MediumFont = 18;
const SmallFont = 14;
const BannersDisplayed = [];

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AlertedNotif: false,
      autoplay: true,
      position: 1,
      refreshing: false,
    };
    this.renderItem = this.renderItem.bind(this);
  }
  SaleObject = {ID: 1, Name: Languages.ForSale};
  NewTabs = [
    {
      ID: 1,
      Name: Languages.ElectricCars,
      Image: 'https://autobeeb.com/wsImages/ElectricCars.png',
      SellType: {ID: 1, Name: Languages.ForSale},
      selectedFuelType: {ID: 4, All: false, Name: Languages.Electric},
    },
    {
      ID: 32,
      Name: Languages.Accessories,
      Image: 'https://autobeeb.com/wsImages/Accessories.png',
      SellType: {ID: 1, Name: Languages.ForSale},
      SectionID: 2048,
      selectedSection: {ID: 2048, All: false, Name: Languages.Accessories},
    },
    {
      ID: 32,
      Name: Languages.Boards,
      Image: 'https://autobeeb.com/wsImages/Board.png',
      SellType: {ID: 1, Name: Languages.ForSale},
      SectionID: 4096,
      selectedSection: {ID: 4096, All: false, Name: Languages.Boards},
    },
  ];
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.props.HomeScreenGet(
      this.props.userData?.ID ?? '',
      Languages.langID,
      this.props.ViewingCountry.cca2,
      5,
      global.ViewingCurrency
        ? global.ViewingCurrency.ID
        : this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : undefined,
      () => {
        this.setState({refreshing: false});
      }
    );

    this.setState({dealersLoading: true});

    try {
      KS.DealersGet({
        langid: Languages.langID,
        page: 1,
        pagesize: 5,
        isocode: this.props.ViewingCountry.cca2,
      }).then(data => {
        if (data && data.Success) {
          this.setState({
            Dealers: data.Dealers,
          });
        }
        this.setState({dealersLoading: false});
      });
    } catch {
      this.setState({dealersLoading: false});
    }
  };
  renderItem({item, index}) {
    return (
      <MainListingsComponent
        key={index}
        item={item}
        navigation={this.props.navigation}
        AppCountryCode={this.props.ViewingCountry?.cca2}
        AllCountries={this.props.homePageData.ISOCode == 'ALL'}
      />
    );
  }

  setPushNotification(ID) {
    const _this = this;
    FCM = messaging();
    // check to make sure the user is authenticated

    // requests permissions from the user
    FCM.requestPermission();
    // gets the device's push token
    FCM.getToken().then(token => {
      if (!!token)
        KS.SetUserToken({
          userid: ID,
          token: token,
          langId: Languages.langID,
        });
    });
  }
  componentDidMount = () => {
    //  alert(JSON.stringify(this.props.ViewingCurrency));
    setTimeout(() => {
      if (this.props.userData && this.props.userData.ID) {
        this.setPushNotification(this.props.userData.ID);
      }
    }, 2000);

    this.setState({dealersLoading: true});

    if (
      this.props.userData &&
      ((this.props.userData?.EmailRegister &&
        this.props.userData.EmailConfirmed) ||
        (!this.props.userData?.EmailRegister &&
          this.props.userData.OTPConfirmed)) &&
      !this.props.userData?.IsDealer &&
      this.props.userData?.MemberOf &&
      this.props.userData?.MemberOf.filter(
        x => x.ID == '33333333-3333-3333-3333-333333333333'
      ).length > 0
    ) {
      KS.UserGet({
        userID: this.props.userData.ID,
        langid: Languages.langID,
      }).then(userdata => {
        //   alert(JSON.stringify(data));
        if (userdata && userdata.Success == 1) {
          this.props.storeUserData(userdata.User, () => {
            KS.PlansGet({
              langid: Languages.langID,
              isocode: userdata.User?.ISOCode,
            }).then(data => {
              if (data?.Plans?.length > 0) {
                this.setState({PaymentPending: true, Plans: data.Plans});
              }
            });
          });
        }
      });
    }
    try {
      KS.DealersGet({
        langid: Languages.langID,
        page: 1,
        pagesize: 5,
        isocode: this.props.ViewingCountry.cca2,
      }).then(data => {
        if (data && data.Success) {
          this.setState({
            Dealers: data.Dealers,
          });
        }
        this.setState({dealersLoading: false});
      });
    } catch {
      this.setState({dealersLoading: false});
    }

    if (!global.ShowedHomePopUp) {
      KS.BannersGet({
        isoCode: this.props.ViewingCountry?.cca2,
        langID: Languages.langID,
        placementID: 7,
      }).then(data => {
        if (data?.Banners && data?.Banners.length > 0) {
          this.setState(
            {BannerImage: data.Banners[data.Banners.length - 1]},
            () => {
              setTimeout(() => {
                global.ShowedHomePopUp = true;
                this.refs?.ImagePopUp?.open();
              }, 1000);
            }
          );
        }
      });
    }
  };

  checkCountry(callback) {
    if (!this.props.userData) {
      //if user isnt logged in check if country is email based or phone based
      AsyncStorage.getItem('cca2', (error, data) => {
        if (data) {
          KS.CountriesGet({langid: Languages.langID}).then(CountriesData => {
            if (CountriesData && CountriesData.Success == '1') {
              this.setState({CountriesData: CountriesData.Countries}, () => {
                let selectedCountry =
                  this.state.CountriesData &&
                  this.state.CountriesData.find(
                    x => x.ISOCode.toLowerCase() == data.toLowerCase()
                  )
                    ? this.state.CountriesData.find(
                        x => x.ISOCode.toLowerCase() == data.toLowerCase()
                      )
                    : null;
                callback(selectedCountry.EmailRegister);
              });
            }
          });
        }
      });
    } else {
      callback(false);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ViewingCountry != this.props.ViewingCountry) {
      this._onRefresh();
    }
    if (prevProps.userData != this.props.userData) {
      if (
        this.props.userData &&
        ((this.props.userData?.EmailRegister &&
          this.props.userData.EmailConfirmed) ||
          (!this.props.userData?.EmailRegister &&
            this.props.userData.OTPConfirmed)) &&
        !this.props.userData?.IsDealer &&
        this.props.userData?.MemberOf &&
        this.props.userData?.MemberOf.filter(
          x => x.ID == '33333333-3333-3333-3333-333333333333'
        ).length > 0
      ) {
        KS.PlansGet({
          langid: Languages.langID,
          isocode: this.props.userData?.ISOCode,
        }).then(data => {
          if (data?.Plans?.length > 0) {
            this.setState({PaymentPending: true, Plans: data.Plans});
          }
        });
      }

      if (this.props.userData && this.props.userData.IsDealer) {
        this.setState({PaymentPending: false});
      }
    }
  }

  renderTintColor(index) {
    switch (index) {
      case 0:
        return '#C20037';
      case 1:
        return '#018404';
      case 2:
        return '#FFBF00';
      case 3:
        return '#9D4E01';
      case 4:
        return '#795091';
      case 5:
        return '#636363';
      default:
        return '#C20037';
    }
  }

  borderRadiusStyle(index) {
    switch (index) {
      case 0:
        return {
          borderTopLeftRadius: 10,
        };
      case 2:
        return {
          borderTopRightRadius: 10,
        };
      case 6:
        return {
          borderBottomLeftRadius: 10,
        };
      case 8:
        return {
          borderBottomRightRadius: 10,
        };
      default:
        return {};
    }
  }

  handleIndexChanged = async index => {
    // incease banner viewed in admin
    if (!BannersDisplayed.includes(index)) {
      BannersDisplayed.push(index);
      const _banner = this.props.homePageData.NewBanners[index];
      KS.BannerViewed(_banner.ID);
    }
  };

  render() {
    if (this.props.isFetching) {
      return (
        <View style={{flex: 1}}>
          <NewHeader
            navigation={this.props.navigation}
            HomeScreen
            onCountryChange={item => {
              this.setState({cca2: item.cca2});
              this.props.HomeScreenGet(
                this.props.userData?.ID ?? '',
                Languages.langID,
                item.cca2,
                5,
                global.ViewingCurrency
                  ? global.ViewingCurrency.ID
                  : this.props.ViewingCurrency
                  ? this.props.ViewingCurrency.ID
                  : undefined
              );
            }}
          />
          <LogoSpinner fullStretch />
        </View>
      );
    }

    return this.props.homePageData && this.props.homePageData.Sections ? (
      <View style={{backgroundColor: '#f0f0f0', flex: 1}}>
        <ImagePopUp
          Banner={this.state.BannerImage}
          ref="ImagePopUp"
          navigation={this.props.navigation}
        />

        <NewHeader
          navigation={this.props.navigation}
          HomeScreen
          onCountryChange={item => {
            this.setState({cca2: item.cca2});
            this.props.HomeScreenGet(
              this.props.userData?.ID ?? '',
              Languages.langID,
              item.cca2,
              5,
              global.ViewingCurrency
                ? global.ViewingCurrency.ID
                : this.props.ViewingCurrency
                ? this.props.ViewingCurrency.ID
                : undefined
            );
          }}
        />
        <ScrollView
          style={{backgroundColor: '#f8f8f8'}}
          contentContainerStyle={{paddingBottom: 30}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }>
          {this.props.homePageData && this.props.homePageData.NewBanners && (
            <Swiper
              showsPagination={false}
              ref="swiper"
              height={Dimensions.get('window').width / 2.5}
              width={Dimensions.get('screen').width}
              autoplay={this.state.autoplay}
              onIndexChanged={this.handleIndexChanged}
              autoplayTimeout={5}
              loop
              // showsButtons={true}
            >
              {this.props.homePageData.NewBanners.map((banner, index) => {
                this.handleIndexChanged(0);
                if (banner)
                  return (
                    <TouchableOpacity
                      style={{flex: 1}}
                      disabled={!banner.Link}
                      onPress={async () => {
                        let url = banner.Link;
                        if (!url) return;

                        KS.BannerClick({
                          bannerID: banner.ID,
                        });

                        const {screen, params} = await ExtractScreenObjFromUrl(
                          url
                        );
                        if (!!screen) {
                          this.props.navigation.navigate(
                            screen,
                            !!params && params
                          );
                        } else {
                          Linking.openURL(url);
                        }
                      }}
                      key={index}>
                      <FastImage
                        style={{
                          width: Dimensions.get('window').width,
                          height: Dimensions.get('window').width / 2.5,
                        }}
                        resizeMode={FastImage.resizeMode.stretch}
                        source={{
                          uri:
                            'https://autobeeb.com/' +
                            banner.FullImagePath +
                            '_1000x400.jpg',
                        }}
                      />
                    </TouchableOpacity>
                  );
              })}
            </Swiper>
          )}
          {!this.props.isFetching && (
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={this.props.homePageData.MainTypes || []}
              numColumns={3}
              contentContainerStyle={{
                flex: 1,
                alignItems: 'center',
                padding: Dimensions.get('screen').width * 0.01,
                justifyContent: 'center',
                width: Dimensions.get('screen').width,
              }}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.props.navigation.navigate('SellTypeScreen', {
                        ListingType: item,
                        category: item,
                        cca2: this.props.ViewingCountry?.cca2 || 'us',
                      });
                    }}
                    style={[
                      {
                        backgroundColor: 'white',
                        borderWidth: 1,
                        margin: 2,
                        borderColor: '#ccc',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: Dimensions.get('screen').width * 0.31,
                        height: Dimensions.get('screen').width * 0.29,
                      },
                      this.borderRadiusStyle(index),
                      index > 2 && {marginBottom: 0},
                    ]}>
                    <FastImage
                      style={[
                        {
                          width: 90,
                          flex: 3,
                        },
                        index == 0 && {position: 'relative', top: 8},
                        index == 5 && {width: 60, height: 60},
                      ]}
                      tintColor={this.renderTintColor(index)}
                      resizeMode={FastImage.resizeMode.contain}
                      source={{
                        uri:
                          'https://autobeeb.com/' +
                          item.FullImagePath +
                          '_115x115.png',
                      }}
                    />

                    <Text
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 16,
                        color: '#000',
                      }}>
                      {item.Name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {!this.props.isFetching && (
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={this.NewTabs}
              numColumns={3}
              contentContainerStyle={{
                flex: 1,
                alignItems: 'center',
                padding: Dimensions.get('screen').width * 0.01,
                justifyContent: 'center',
                width: Dimensions.get('screen').width,
                paddingTop: 0,
              }}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.props.navigation.navigate('ListingsScreen', {
                        cca2: this.props.ViewingCountry?.cca2 || 'us',
                        ListingType: this.props.homePageData.MainTypes.find(
                          x => x.ID == item.ID
                        ),
                        ...item,
                      });
                    }}
                    style={[
                      {
                        backgroundColor: 'white',
                        borderWidth: 1,
                        margin: 2,
                        borderColor: '#ccc',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: Dimensions.get('screen').width * 0.31,
                        height: Dimensions.get('screen').width * 0.29,
                      },
                      this.borderRadiusStyle(index + 6),
                      {marginTop: 0},
                    ]}>
                    <FastImage
                      style={[
                        {
                          width: 90,
                          flex: 3,
                        },
                      ]}
                      resizeMode={FastImage.resizeMode.contain}
                      source={{
                        uri: item.Image,
                      }}
                    />

                    <Text
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 16,
                        color: '#000',
                      }}>
                      {item.Name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {this.state.PaymentPending ? (
            <TouchableOpacity
              style={{
                width: Dimensions.get('screen').width * 0.96,
                marginVertical: 5,
                alignSelf: 'center',
                flexDirection: 'row',
                elevation: 1,
                borderRadius: 5,
                marginBottom: 10,
                backgroundColor: 'red',
                minHeight: 60,
              }}
              onPress={() => {
                this.props.navigation.navigate('SubscriptionsScreen', {
                  ISOCode: this.props.userData.ISOCode,
                  User: this.props.userData,
                  Plans: this.state.Plans,
                });
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    textAlign: 'center',
                    padding: 5,
                    fontFamily: 'Cairo-Regular',
                    fontSize: 18,
                    lineHeight: 28.5,
                  }}>
                  {Languages.AccountIsPaymentPending}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                width: Dimensions.get('screen').width * 0.96,
                marginVertical: 5,
                alignSelf: 'center',
                flexDirection: 'row',
                elevation: 1,
                borderRadius: 5,
                marginBottom: 10,
                backgroundColor: Color.primary,
              }}
              onPress={() => {
                this.checkCountry(isEmailBased => {
                  if (isEmailBased) {
                    this.props.navigation.navigate('LoginScreen', {
                      skippable: true,
                    });
                  } else {
                    this.props.navigation.navigate('PostOfferScreen');
                  }
                });
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconFa
                  name="plus"
                  size={25}
                  color="white"
                  style={{marginRight: 5}}
                />
                <Animatable.Text
                  style={{
                    color: '#fff',
                    textAlign: 'center',
                    padding: 10,
                    fontFamily: 'Cairo-Regular',
                    fontSize: BigFont,
                  }}>
                  {Languages.PostYourOffer}
                </Animatable.Text>
                <Animatable.Text
                  iterationCount="infinite"
                  animation="flash"
                  iterationDelay={5000}
                  duration={2500}
                  style={{
                    // color: "#3F3F37",
                    color: '#fff',
                    fontSize: BigFont,
                    fontFamily: 'Cairo-Regular',
                  }}>
                  {Languages.FREE}
                </Animatable.Text>
              </View>
            </TouchableOpacity>
          )}

          {this.props.homePageData?.Blog &&
            this.props.homePageData?.Blog.length > 0 && (
              <View
                style={{
                  backgroundColor: '#EBEBEB',
                  paddingBottom: 10,
                  marginTop: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flex: 1,
                    width: Dimensions.get('screen').width,
                    paddingVertical: 5,
                    //     backgroundColor: "red"
                  }}>
                  <View />
                  <View />

                  <View style={{alignSelf: 'center'}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: MediumFont,
                        color: '#000',
                        fontFamily: 'Cairo-Bold',
                      }}
                      onPress={() => {
                        this.props.navigation.navigate('BlogsScreen');
                      }}>
                      {Languages.LatestNews}
                    </Text>
                    <View
                      style={{
                        height: 1,
                        width: 70,
                        marginBottom: 5,
                        backgroundColor: Color.secondary,
                        alignSelf: 'center',
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    style={{alignSelf: 'flex-end', marginRight: 20}}
                    onPress={() => {
                      this.props.navigation.navigate('BlogsScreen');
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
                      <Text
                        style={{
                          fontFamily: Constants.fontFamily,
                          //       textDecorationLine: "underline",
                          color: Color.secondary,
                          marginBottom: 12,
                        }}>
                        {Languages.ViewAll}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <HorizontalSwiper
                  autoLoop
                  intervalValue={4000}
                  showButtons
                  data={this.props.homePageData?.Blog}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity
                        style={{
                          width: Dimensions.get('screen').width,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          this.props.navigation.navigate('BlogDetails', {
                            Blog: item,
                          });
                        }}>
                        <View
                          style={{
                            overflow: 'hidden',
                            borderBottomWidth: 1,
                            borderColor: '#eee',
                            backgroundColor: '#ddd',
                            alignSelf: 'center',
                            width: Dimensions.get('screen').width * 0.95,
                            height: (Dimensions.get('screen').width * 0.95) / 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                          }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              textAlign: 'center',
                              padding: 5,
                              width: '100%',
                              color: '#fff',
                              backgroundColor: 'rgba(0,0,0,0.4)',
                              zIndex: 100,
                            }}>
                            {item.Name}
                          </Text>
                          {
                            <Image
                              source={{
                                uri: `https://autobeeb.com/${item.FullImagePath}_1024x683.jpg`,
                              }}
                              style={{
                                alignSelf: 'center',
                                width: '100%',
                                height: '100%',
                              }}
                              resizeMode="cover"
                            />
                          }
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          {this.props.homePageData && this.props.homePageData.Sections && (
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={this.props.homePageData.Sections}
              renderItem={({item, index}) => {
                return (
                  item.Items &&
                  item.Items.length > 0 && (
                    <View style={styles.mainSection} key={index}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingHorizontal: 20,
                          alignItems: 'center',
                          flex: 1,
                          width: Dimensions.get('screen').width,
                          paddingTop: 10,
                        }}>
                        <TouchableOpacity
                          style={{}}
                          onPress={() => {
                            KS.MakesGet({
                              langID: Languages.langID,
                              listingType: item.Type.ID,
                            }).then(data => {
                              let AllMakes = {
                                ID: '',
                                All: true,
                                Image: require('../images/SellTypes/BlueAll.png'),
                                AllMake: true,
                                Name: Languages.AllMakes,
                              };
                              data.unshift(AllMakes);

                              this.props.navigation.push('ListingsScreen', {
                                ListingType: item.Type,
                                SellType: this.SaleObject,
                                selectedMake: AllMakes,
                                Makes: data,
                              });
                            });
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <FastImage
                              style={{
                                width: 45,
                                height: 45,
                                marginRight: 15,
                                //     tintColor: this.renderTintColor(index)
                              }}
                              tintColor={this.renderTintColor(index)}
                              resizeMode={FastImage.resizeMode.contain}
                              source={{
                                uri:
                                  'https://autobeeb.com/' +
                                  item.Type.FullImagePath +
                                  '_115x115.png',
                              }}
                            />

                            {item.Type.ID != 32 ? (
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontSize: MediumFont,
                                  color: '#000',
                                }}>
                                {item.Type.Name}
                              </Text>
                            ) : (
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontSize: MediumFont,
                                  color: '#000',
                                }}>
                                {item.Type.Name + Languages.AndPlates}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{}}
                          onPress={() => {
                            KS.MakesGet({
                              langID: Languages.langID,
                              listingType: item.Type.ID,
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

                              this.props.navigation.push('ListingsScreen', {
                                ListingType: item.Type,
                                SellType: this.SaleObject,
                                selectedMake: AllMakes,
                                Makes: data,
                              });
                            });
                          }}>
                          <Text
                            style={{
                              fontFamily: Constants.fontFamily,
                              //   textDecorationLine: "underline",
                              color: Color.secondary,
                            }}>
                            {Languages.ViewAll}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 7,
                        }}
                        style={{
                          paddingVertical: 15,
                          paddingHorizontal: 15,

                          //     backgroundColor: "red"
                        }}
                        initialNumToRender={I18nManager.isRTL ? 150 : 20} // flatlist is broken on RTL+Horizontal , will keep updating infinite times, this is to stop rerendering. https://github.com/facebook/react-native/issues/19150
                        data={item.Categories}
                        ItemSeparatorComponent={() => {
                          return (
                            <View
                              style={{
                                height: 15,
                                width: 1,
                                //   marginTop: 8,
                                alignSelf: 'center',
                                marginHorizontal: 7,
                                backgroundColor: Color.secondary || '#555',
                              }}
                            />
                          );
                        }}
                        renderItem={({item, index}) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onPress={() => {
                                const _this = this;

                                if (item.IsMake) {
                                  KS.MakesGet({
                                    langID: Languages.langID,
                                    listingType: item.TypeID,
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

                                    _this.props.navigation.navigate(
                                      'ListingsScreen',
                                      {
                                        ListingType:
                                          _this.props.homePageData.MainTypes.find(
                                            mainType =>
                                              mainType.ID == item.TypeID
                                          ),
                                        SellType: this.SaleObject,
                                        selectedMake: item,
                                        Makes: data,
                                      }
                                    );
                                  });
                                } else {
                                  KS.MakesGet({
                                    langID: Languages.langID,
                                    listingType:
                                      item.TypeID == 32
                                        ? item.RelatedEntity
                                        : item.TypeID == 4
                                        ? item.SectionID
                                        : item.TypeID,
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

                                    _this.props.navigation.navigate(
                                      'ListingsScreen',
                                      {
                                        ListingType:
                                          _this.props.homePageData.MainTypes.find(
                                            mainType =>
                                              mainType.ID == item.TypeID
                                          ),
                                        CategoryID:
                                          item.TypeID == 32 ? '' : item.ID,

                                        SectionID: item.SectionID,
                                        selectedSection:
                                          item.TypeID == 32
                                            ? item
                                            : {
                                                ID: item.SectionName
                                                  ? item.SectionID ||
                                                    item.TypeID
                                                  : '', // for typeCategoriesGet in trailer case
                                                Name: item.SectionName,
                                              },
                                        selectedCategory:
                                          item.TypeID == 4 || item.TypeID == 16
                                            ? item
                                            : {
                                                ID: '',
                                                Image: require('../images/SellTypes/BlueAll.png'),
                                                All: true,
                                                Name: Languages.All,
                                              },

                                        SellType: this.SaleObject,
                                        selectedMake: AllMakes,
                                        Makes: data,
                                      }
                                    );
                                  });
                                }
                              }}>
                              {item.FullImagePath && (
                                <FastImage
                                  style={{
                                    width: 35,
                                    height: 35,
                                    marginRight: 4,
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
                              <Text
                                style={{color: 'gray', fontSize: SmallFont}}>
                                {item.Name}
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />

                      <FlatList
                        horizontal
                        keyExtractor={(item, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{paddingHorizontal: 5}}
                        style={{alignSelf: 'flex-start'}}
                        data={item.Items}
                        renderItem={this.renderItem}
                      />
                    </View>
                  )
                );
              }}
            />
          )}
          {this.state.Dealers && this.state.Dealers.length > 0 && (
            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  flex: 1,
                  width: Dimensions.get('screen').width,
                  paddingTop: 10,
                  marginBottom: 20,

                  //     backgroundColor: "red"
                }}>
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('DealersScreen');
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <IconFa
                      name="users"
                      size={26}
                      color={Color.secondary}
                      style={{marginRight: 15}}
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: MediumFont,
                        color: '#000',
                      }}>
                      {Languages.Dealers}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('DealersScreen');
                  }}>
                  <Text
                    style={{
                      fontFamily: Constants.fontFamily,
                      //   textDecorationLine: "underline",
                      color: Color.secondary,
                    }}>
                    {Languages.ViewAll}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                style={{alignSelf: 'flex-start'}}
                data={this.state.Dealers}
                contentContainerStyle={{
                  alignItems: 'center',
                  paddingHorizontal: 7,
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
                renderItem={({item, index}) => {
                  return (
                    <DealersBanner
                      item={item}
                      navigation={this.props.navigation}
                      homeScreen></DealersBanner>
                  );
                }}
              />
            </View>
          )}
        </ScrollView>
      </View>
    ) : (
      <View style={{backgroundColor: 'white', flex: 1}}>
        <NewHeader
          navigation={this.props.navigation}
          HomeScreen
          onCountryChange={item => {
            this.setState({cca2: item.cca2});
            console.log({IDDD: this.props.userData?.ID});
            this.props.HomeScreenGet(
              this.props.userData?.ID ?? '',
              Languages.langID,
              item.cca2,
              5,
              global.ViewingCurrency
                ? global.ViewingCurrency.ID
                : this.props.ViewingCurrency
                ? this.props.ViewingCurrency.ID
                : undefined
            );
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{
              width: Dimensions.get('screen').width * 0.4,
              aspectRatio: 0.85114503816,
              height: Dimensions.get('screen').width * 0.8,
            }}
            resizeMode="cover"
            source={require('../images/errorpage.png')}
          />
          <Text style={{fontSize: 30, fontFamily: 'Cairo-Bold', color: 'red'}}>
            {Languages.SomethingWentWrong}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              minWidth: 200,
              backgroundColor: Color.primary,
              borderRadius: 10,
            }}
            onPress={() => {
              this._onRefresh();
            }}>
            <Text
              style={{
                paddingVertical: 10,
                textAlign: 'center',
                fontSize: 20,
                paddingHorizontal: 5,
                color: '#fff',
              }}>
              {Languages.TryAgain}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  mainSection: {},
});

//make this component available to the app

const mapStateToProps = ({home, user, menu}) => {
  return {
    ViewingCountry: menu.ViewingCountry,
    ViewingCurrency: menu.ViewingCurrency,

    homePageData: home.homePageData,
    isFetching: home.isFetching,
    userData: user.user,
  };
};

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/HomeRedux');
  const UserRedux = require('../redux/UserRedux');

  return {
    HomeScreenGet: (userID, langId, isoCode, listingsCount, cur, callback) => {
      actions.HomeScreenGet(
        dispatch,
        langId,
        isoCode,
        listingsCount,
        cur,
        callback,
        userID
      );
    },
    storeUserData: (user, callback) =>
      UserRedux.actions.storeUserData(dispatch, user, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
