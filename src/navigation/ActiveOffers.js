import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Share,
  TouchableOpacity,
  Alert,
  I18nManager,
  Pressable,
  Platform,
} from 'react-native';
import KS from '../services/KSAPI';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Languages, Color, Constants} from '../common';
import {
  LogoSpinner,
  BannerListingsComponent,
  OTPModal,
  SpecialSVG,
} from '../components';
import NewHeader from '../containers/NewHeader';
import {toast} from '../Omni';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AddAdvButton from '../components/AddAdvButton';

var md5 = require('md5');

class ActiveOffers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      FeaturedListings: 0,
      ListingsLoading: true,
      User: this.props.user,
      UserLoading: true,
      active: !!this.props?.route?.params?.active,
      onActivateLoading: false,
      Listings: [],
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  fetchUserListings() {
    try {
      KS.UserGet({
        userID: this.props?.user?.ID || null,
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success == 1) {
          if (data.User == null) {
            this.Logout();
          } else {
            this.getUserListings(
              this.props?.route?.params?.status === 10 ? -1 : 16,
              1,
            );
            this.setState({
              UserLoading: false,
              User: data.User,
              userLimit:
                data.User && data.User.IsDealer
                  ? data.User.DealerLimit
                  : data.User.UserLimit,
              ActiveListings: data.ActiveListings,
              InActiveListings: data.InActiveListings,
            });

            if (data.User.IsActive == false) {
              toast(Languages.AccountBlocked, 3500);
            }
          }
        } else {
          this.setState({
            UserLoading: false,
          });
        }
      });
    } catch (e) {
      this.setState({ListingsLoading: false, UserLoading: false});
    }
  }

  fetchFeaturedListings() {
    if (!!this.props.user?.ID) {
      KS.Core_UserListings({
        LangId: Languages.langID,
        Page: 1,
        PageSize: 1,
        Status: 16,
        UserId: this.props.user.ID,
        IsSpecial: true,
      }).then(data => {
        this.setState({
          FeaturedListings: data.count ?? 0,
          ListingsLoading: false,
        });
      });
    }
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener(
      'focus',
      this.handleFocus,
    );
    this.blurListener = this.props.navigation.addListener(
      'blur',
      this.handleBlur,
    );
    this.fetchUserListings();
    this.fetchFeaturedListings();
  }

  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
      //    this.props.navigation.navigate("HomeScreen");
    });
  }
  mapKeysToOldFormat(item) {
    const oldItem = {
      _Currency: item._currency,
      CategoryID: item.categoryID,
      CategoryName: item.categoryName,
      CityID: item.cityID,
      CityName: item.cityName,
      Condition: item.condition,
      Consumption: item.consumption,
      CountryID: item.countryID,
      CountryName: item.countryName,
      FactoredPrice: item.factoredPrice,
      Favorite: item.favorite,
      FormatedPrice: item.formatedPrice,
      FuelType: item.fuelType,
      ID: item.id,
      Images: item.images,
      ImagesString: item.imagesString,
      IsDealer: item.isDealer,
      IsSpecial: item.isSpecial,
      IsoCode: item.isoCode,
      MakeID: item.makeID,
      MakeName: item.makeName,
      ModelName: item.modelName,
      Name: item.typeID == 32 ? item.name : item.listingName,
      OriginalPrice: item.originalPrice,
      OwnerID: item.ownerID,
      OwnerName: item.ownerName,
      ParentCategoryID: item.parentCategoryID,
      ParentCategoryName: item.parentCategoryName,
      PartNumber: item.partNumber,
      PaymentMethod: item.paymentMethod,
      Phone: item.phone,
      Section: item.section,
      SellType: item.sellType,
      Status: item.status,
      ThumbURL: item.thumbURL,
      TypeID: item.typeID,
      TypeName: item.typeName,
      Year: item.year,
      FullImagePath: item.fullImagePath,
      ImageBasePath: item.imageBasePath,
      Views: item.views,
      DateAdded: item.dateAdded,
      RenewalDate: item.renewalDate,
      SpecialExpiryDate: item.specialExpiryDate,
      TitleFullImagePath: item.titleFullImagePath,
      ISOCode: item.isoCode,
    };
    return oldItem;
  }
  onShare = async item => {
    try {
      await Share.share({
        message:
          Languages.CheckOffer +
          '\n' +
          (I18nManager.isRTL
            ? 'https://autobeeb.com/ar/ads/'
            : 'https://autobeeb.com/ads/') +
          item.Name +
          '/' +
          item.ID +
          '/' +
          item.TypeID,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  getUserListings(status, page) {
    this.setState(
      {refreshing: page == 1, active: status == 16, NextPage: page + 1},
      () => {
        KS.Core_UserListings({
          LangId: Languages.langID,
          Page: page,
          PageSize: 25,
          Status: status == -1 ? null : status,
          AllStatusButActive: status == -1,
          UserId: this.props.user?.ID || null,
          active: status != -1,
        }).then(data => {
          this.setState({
            Listings:
              page == 1
                ? data.listings
                : [...this.state.Listings, ...data.listings],
            TotalPages: data.pages,
            footerLoading: page + 1 <= data.pages,
            ListingsLoading: false,
            refreshing: false,
          });
        });
      },
    );
  }

  handleBlur() {
    this.setState({renderLimitListingsModal: false});
  }

  handleFocus() {
    this.setState({
      active: this.props?.route?.params?.active || true,
    });

    this.fetchUserListings();
    this.fetchFeaturedListings();
  }

  resendCode() {

    this.setState({otp: ''});
    KS.ResendOTP({
      userID: this.state.User.ID,
      otpType: this.state.User?.EmailRegister ? 2 : 1,
    }).then(data => {
   
      if (data.Success == 1) {
        toast(Languages.WeSendUOTP);
      } else {
        toast('something went wrong');
      }
      //
    });
  }
  checkOTP() {
    const _this = this;
    const otp = this.state.otp;

    KS.UserVerifyOTP({
      otpcode: otp,
      userid: this.state.User.ID,
      username:
        this.props.user && this.props.user.EmailRegister
          ? this.props.user.Email
          : this.state.User && this.state.User.Phone,
    }).then(data => {
      if (data.OTPVerified == true || data.EmailConfirmed == true) {
        if (data.User) {
          _this.props.storeUserData(data.User, () => {
            _this.setState({openOTPModal: false});
            _this.props.navigation.navigate('HomeScreen');
          });
        }
        //
      } else {
        toast(Languages.WrongOTP);

        setTimeout(() => {
          this.setState({otp: ''});
        }, 1800);
      }
    });
  }

  render() {
    if (!this.props.user) {
      return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
          <NewHeader navigation={this.props.navigation} back={true} />
          <View
            style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
            <IconMC
              name="login"
              size={40}
              //    color={Color.secondary}
              //    style={{ marginRight: 15 }}
            />
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Cairo-Bold',
                fontSize: 25,
              }}>
              {Languages.YouNeedToLoginFirst}
            </Text>

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: 'green',
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 5,
              }}
              onPress={() => {
                this.props.navigation.navigate('DrawerStack', {
                  screen: 'LoginScreen',
                });
              }}>
              <Text style={{color: '#fff', fontSize: 18}}>
                {Languages.LoginNow}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (this.state.ListingsLoading || this.state.UserLoading) {
      return (
        <View style={{flex: 1}}>
          <NewHeader
            back={true}
            navigation={this.props.navigation}
            HomeScreen
            onCountryChange={item => {
              this.setState({cca2: item.cca2});
            }}
          />
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <View style={{flex: 1}}>
        {this.state.User && (
          <OTPModal
            isOpen={this.state.openOTPModal}
            OTPMessage={Languages.WeHavePreviouslySentTheOTP}
            EnterMessage={Languages.ToPublishAndVerifyAccount}
            pendingDelete={this.state.pendingDelete}
            ignoreResend
            onOpened={() => {
              this.setState({footerShown: false});
            }}
            Username={
              this.props.user && this.props.user.EmailRegister
                ? this.props.user.Email
                : this.state.User && this.state.User.Phone
            }
            otp={this.state.otp}
            onChange={otp => {
              this.setState({otp});
            }}
            checkOTP={() => {
              this.checkOTP();
            }}
            toast={msg => {
              toast(msg);
            }}
            onClosed={() => {
              this.setState({footerShown: true});
            }}
            resendCode={() => {
              this.resendCode();
            }}
          />
        )}
        {this.state.active && (
          <AddAdvButton navigation={this.props.navigation} />
        )}
        <ScrollView
          contentContainerStyle={{flex: 1}}
          style={{backgroundColor: '#eee'}}>
          <StatusBar
            backgroundColor="#fff"
            barStyle="dark-content"
            translucent={false}
          />

          <NewHeader
            back={true}
            navigation={this.props.navigation}
            onCountryChange={item => {
              this.setState({cca2: item.cca2});
            }}
          />
          {
            <View
              style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderColor: '#ddd',
                elevation: 1,
                alignItems: 'center',
                backgroundColor: '#fff',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderBottomColor: this.state.active ? Color.primary : '#fff',
                  borderBottomWidth: 1,
                  padding: 5,
                  paddingVertical: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightColor: '#ddd',
                  borderRightWidth: 1,
                }}
                onPress={() => {
                  this.getUserListings(16, 1);
                  this.fetchFeaturedListings();
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}>
                  <IconMC
                    name="check-circle-outline"
                    color={'green'}
                    size={18}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000',
                      textAlign: 'center',
                    }}>
                    {Languages.ActiveOffers}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    width: '100%',
                    justifyContent: 'space-around',
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      textAlign: 'center',
                    }}>
                    {this.state.ActiveListings -
                      this.state.FeaturedListings +
                      '/' +
                      this.state.userLimit}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row-reverse',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        textAlign: 'center',
                      }}>
                      {this.state.FeaturedListings}
                    </Text>
                    <SpecialSVG color={'#FF0000'} />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  borderBottomColor: !this.state.active
                    ? Color.primary
                    : '#fff',
                  borderBottomWidth: 1,
                  padding: 5,
                  paddingVertical: 5,
                }}
                onPress={() => {
                  this.getUserListings(-1, 1);
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}>
                  <IconMC name="close-circle-outline" color={'red'} size={18} />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000',
                      textAlign: 'center',
                    }}>
                    {Languages.InActiveOffers}
                  </Text>
                </View>
                <Text
                  style={{
                    color: '#000',
                    textAlign: 'center',
                  }}>
                  {this.state.InActiveListings}
                </Text>
              </TouchableOpacity>
            </View>
          }

          {this.state.refreshing || this.state.onActivateLoading ? (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <ActivityIndicator size="large" color={'#F85502'} />
            </View>
          ) : !!this.state.renderLimitListingsModal ? (
            this.renderFullLimit()
          ) : (
            <FlatList
              extraData={this.state.Listings}
              keyExtractor={(item, index) => `${index}`}
              contentContainerStyle={{
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 60,
              }}
              refreshing={this.state.refreshing}
              data={this.state.Listings}
              renderItem={({item, index}) => {
                return (
                  <BannerListingsComponent
                    key={`${index}`}
                    user={this.state.User}
                    AppCountryCode={this.props.ViewingCountry?.cca2}
                    activeOffers
                    active={this.state.active}
                    onDelete={item => {
                      Alert.alert(
                        '',
                        Languages.DeleteConfirm,
                        [
                          {
                            text: Languages.Cancel,
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: Languages.Delete,
                            onPress: () => {
                              KS.DeleteOffer({
                                listingID: item.ID,
                                kensoftware: md5(
                                  item.ID + 'KhaledYazeedMohammad',
                                ),
                                userid: this.props.user?.ID,
                              }).then(data => {
                                //  alert(JSON.stringify(data));
                                if (data && data.Success) {
                                  //  alert(JSON.stringify(data));
                                  let formattedListings =
                                    this.state.Listings.filter(
                                      x => x.id != item.ID,
                                    );
                                  this.setState({
                                    Listings: formattedListings,
                                  });
                                  if (this.state.active) {
                                    this.setState({
                                      ActiveListings:
                                        this.state.ActiveListings - 1,
                                    });
                                  } else {
                                    this.setState({
                                      InActiveListings:
                                        this.state.InActiveListings - 1,
                                    });
                                  }
                                }
                              });
                            },
                          },
                        ],
                        {cancelable: true},
                      );
                    }}
                    onDeactivate={item => {
                      Alert.alert(
                        '',
                        Languages.DeactivateConfirm,
                        [
                          {
                            text: Languages.Cancel,
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: Languages.Deactivate,
                            onPress: () => {
                              this.setState({ListingsLoading: true});
                              KS.OfferUpdateStatus({
                                listingID: item.ID,
                                status: 8,
                                userid: this.props.user?.ID,
                              }).then(OfferData => {
                                if (OfferData && OfferData.Success) {
                                  this.getUserListings(16, 1);
                                  this.setState({
                                    InActiveListings: OfferData.DeactiveCount,
                                    ActiveListings: OfferData.ActiveCount,
                                    FeaturedListings: item.isSpecial
                                      ? this.state.FeaturedListings - 1
                                      : this.state.FeaturedListings,
                                  });
                                }
                              });
                            },
                            style: 'cancel',
                          },
                        ],
                        {cancelable: true},
                      );
                    }}
                    onActivate={item => {
                      this.setState({onActivateLoading: true});
                      setTimeout(() => {
                        this.setState({onActivateLoading: false});
                      }, 1000);
                      KS.OfferUpdateStatus({
                        listingID: item.ID,
                        status: 16,
                        userid: this.props.user?.ID,
                      }).then(OfferData => {
                        if (OfferData.Status == 1) {
                          this.getUserListings(-1, 1);
                          this.setState({
                            InActiveListings: OfferData.DeactiveCount,
                            ActiveListings: OfferData.ActiveCount,
                            FeaturedListings: item.isSpecial
                              ? this.state.FeaturedListings + 1
                              : this.state.FeaturedListings,
                          });
                        } else {
                          this.setState({renderLimitListingsModal: true});
                          // toast(Languages.ExhaustedActiveOffers, 7000);
                        }
                      });
                    }}
                    onShare={item => {
                      this.onShare(item);
                    }}
                    onEdit={item => {
                      KS.ListingEditGet({
                        langid: Languages.langID,
                        id: item.ID,
                        userid: this.props.user?.ID,
                      }).then(data => {
                        this.props.navigation.navigate('PostOfferScreen', {
                          Edit: true, // this is for editing the steps so it only edits one by one
                          EditOffer: true, //while this is to load the data from this listing
                          Category: data.Category,
                          Section: data.Section,
                          ParentCategory: data.ParentCategory,
                          step: 18,
                          Listing: data.Listing,
                        });
                      });
                    }}
                    onVerify={() => {
                      this.setState({openOTPModal: true});
                    }}
                    item={this.mapKeysToOldFormat(item)}
                    navigation={this.props.navigation}
                  />
                );
              }}
              onEndReached={() => {
                this.setState(
                  {
                    footerLoading: this.state.NextPage <= this.state.TotalPages,
                  },
                  () => {
                    if (this.state.NextPage <= this.state.TotalPages) {
                      this.getUserListings(
                        this.state.active ? 16 : -1,
                        this.state.NextPage,
                      );
                    }
                  },
                );
              }}
              onEndReachedThreshold={0.9}
              ListFooterComponent={
                this.state.footerLoading && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 10,
                      marginBottom: 20,
                    }}>
                    <ActivityIndicator size="large" color={'#F85502'} />
                  </View>
                )
              }
            />
          )}
        </ScrollView>
      </View>
    );
  }

  renderFullLimit() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
        <Pressable
          style={{
            position: 'absolute',
            top: 5,
            left: 10,
            zIndex: 150,
            borderRadius: 20,
            borderBlockColor: '#000',
          }}
          onPress={() => {
            this.setState({renderLimitListingsModal: false});
          }}>
          <IconMC name="close" color={'#000'} size={25} />
        </Pressable>

        <Text style={{color: '#000', textAlign: 'center', fontSize: 21}}>
          {Languages.ExhaustedActiveOffers}
        </Text>
        <Text style={{color: '#228b22', textAlign: 'center', fontSize: 21}}>
          {Languages.Or} {Languages.Feature_1}
        </Text>

        {!this.state.isDealer && (
          <Text
            style={{
              color: '#000',
              textAlign: 'center',
              marginTop: 10,
              fontSize: 21,
            }}>
            {Languages.IfYouAreADealer}
          </Text>
        )}

        {this.state.isDealerPending && (
          <View style={{}}>
            <Animatable.Text
              useNativeDriver
              iterationCount="infinite"
              animation="flash"
              iterationDelay={5000}
              duration={3000}
              //  delay={1000}
              style={{
                textAlign: 'center',
                marginTop: 10,
                fontSize: 18,
                color: Color.primary,
                fontFamily: 'Cairo-Bold',
              }}>
              {Languages.DealerPendingApproval}
            </Animatable.Text>
          </View>
        )}

        {this.state.isPaymentPending && (
          <Animatable.Text
            useNativeDriver
            iterationCount="infinite"
            animation="flash"
            iterationDelay={5000}
            duration={3000}
            //  delay={1000}
            style={{
              textAlign: 'center',
              marginTop: 10,
              fontSize: 18,
              color: Color.primary,
              fontFamily: 'Cairo-Bold',
            }}>
            {Languages.AbleToAddNewAd}
          </Animatable.Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            gap: 5,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
          {!this.state.isDealer && (
            <TouchableOpacity
              style={{
                backgroundColor: Color.primary,
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 15,
                paddingHorizontal: 20,
                width: '48%',
              }}
              onPress={() => {
                this.props.navigation.navigate('DealerSignUp', {
                  BecomeADealer: true,
                });
              }}>
              <Text style={{color: '#fff', fontSize: 20, textAlign: 'center'}}>
                {Languages.BecomeADealer}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              paddingVertical: 5,
              borderRadius: 5,
              flexGrow: 0,
              marginTop: 15,
              paddingHorizontal: 20,
              width: '48%',
            }}
            onPress={() => {
              this.getUserListings(16, 1);
              this.setState({
                renderLimitListingsModal: false,
              });
            }}>
            <Text style={{color: '#fff', fontSize: 20, textAlign: 'center'}}>
              {Languages.Feature_2}
            </Text>
          </TouchableOpacity>
          {this.state.isPaymentPending && (
            <TouchableOpacity
              style={{
                backgroundColor: 'green',
                paddingVertical: 5,
                borderRadius: 5,
                flexGrow: 0,
                marginTop: 15,
                paddingHorizontal: 20,
              }}
              onPress={() => {
                this.props.navigation.replace('SubscriptionsScreen', {
                  ISOCode: this.props.user?.ISOCode,
                  User: this.props.user,
                });
              }}>
              <Text style={{color: '#fff', fontSize: 20, textAlign: 'center'}}>
                {Languages.Subscribe}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  const UserRedux = require('../redux/UserRedux');
  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),
    storeUserData: (user, callback) =>
      UserRedux.actions.storeUserData(dispatch, user, callback),
  };
};
const mapStateToProps = ({user, menu}) => ({
  user: user.user,
  ViewingCountry: menu.ViewingCountry,
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveOffers);
