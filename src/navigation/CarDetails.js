import React, {Component} from 'react';

import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SectionList,
  Linking,
  I18nManager,
  BackHandler,
  Platform,
  Share,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
  Easing,
} from 'react-native';
import {connect} from 'react-redux';
import {Languages, Color, Constants, ExtractScreenObjFromUrl} from '../common';
import {toast} from '../Omni';
import {
  LogoSpinner,
  DealersBanner,
  OTPModal,
  SpecialSVG,
  BottomNavigationBar,
  AutobeebModal,
} from '../components';
import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconSLI from 'react-native-vector-icons/SimpleLineIcons';
import IconEV from 'react-native-vector-icons/EvilIcons';
import IconFE from 'react-native-vector-icons/Feather';
import IconEn from 'react-native-vector-icons/Entypo';
import AddAdvButtonSquare from '../components/AddAdvButtonSquare';
import IconIon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import KS from '../services/KSAPI';
import ImageViewer from 'react-native-image-zoom-viewer';
import {isIphoneX} from 'react-native-iphone-x-helper';
import FastImage from 'react-native-fast-image';
import * as Animatable from 'react-native-animatable';
import getDirections from 'react-native-google-maps-directions';
import MapView, {Marker} from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ButtonIndex, AskListingOwner} from '../components';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import SpecialPlans from './SpecialPlans';
import Clipboard from '@react-native-clipboard/clipboard';
import ShareLib from 'react-native-share';
import Svg, {Line, Path} from 'react-native-svg';
import {Animated} from 'react-native';
import {Keyboard} from 'react-native';

const countryMessage1 = [
  '897',
  '946',
  '973',
  '979',
  '989',
  '992',
  '1004',
  '1008',
  '1053',
  '1058',
  '1063',
  '1071',
  '1085',
  '1088',
];
const FAILOVER_IMAGE = require('../images/placeholder.png');
const tempListing = {
  Name: 'Loading',
  NameFirstPart: 'Loading',
  NameSecondPart: '',
  GearBox: 1,
  FuelType: 1,
  PaymentMethod: 1,
  RentPeriod: null,
  ColorID: 4,
  Color: '#000',
  ColorLabel: 'Black',
  Extras: 0,
  Consumption: 0,
  ID: 0,
  TypeID: 1,
  TypeName: 'Cars',
  SellType: 1,
  Status: 16,
  Condition: 2,
  Section: null,
  SectionName: null,
  MakeID: 1638,
  MakeName: 'Nissan',
  ModelID: 5306,
  ModelName: 'Murano',
  Year: 2005,
  CityID: 7785,
  CityName: 'Amman',
  CountryID: 979,
  CountryName: 'Jordan',
  Price: 6500.0,
  EntryPrice: 6500.0,
  EntryCur: '1',
  CategoryID: 256,
  CategoryName: 'SUV',
  ISOCode: 'JO',
  DateAdded: '2020-05-19T04:02:29.433',
  RenewalDate: '2020-05-19T04:02:29.433',
  Favorite: false,
  Description: 'Loading',
  ShowPhone: false,
};
let reportData = {
  userId: '',
  listingId: '',
  typeId: 3,
  message: '',
  email: '',
  listingname: '',
};
let reportOptions = [
  {
    title: 'MisleadingAd',
    type: 1,
    icon: (x = '#555') => <IconMa name="bug-report" color={x} size={30} />,
  },
  {
    title: 'DuplicatedAd',
    type: 2,
    icon: (x = '#555') => (
      <MaterialCommunityIcons name="repeat" color={x} size={30} />
    ),
  },
  {
    title: 'FraudulentAd',
    type: 3,
    icon: (x = '#555') => <IconMa name="report" color={x} size={30} />,
  },
  {
    title: 'SoldAd',
    type: 4,
    icon: (x = '#555') => <IconMa name="money-off" color={x} size={30} />,
  },
  {
    title: 'WrongSectionAd',
    type: 5,
    icon: (x = '#555') => <IconMa name="sim-card-alert" color={x} size={30} />,
  },
  {
    title: 'Other',
    type: 6,
    icon: (x = '#555') => (
      <IconEn name="dots-three-horizontal" color={x} size={30} />
    ),
  },
];

class CarDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: 1,
      date: new Date(),
      userCountry: {},
      interval: null,
      isLoading: true,
      isFeaturesModalLoading: false,
      footerShown: true,
      modalPhotoOpen: false,
      DescriptionHidden: true,
      selectedFeatures: [],
      selectedDropdownFeatures: [],
      Listing:
        !!this.props?.route?.params?.item &&
        this.props?.route?.params?.item?.Name
          ? this.props?.route?.params?.item ?? tempListing
          : tempListing,
      isFocused: true,
      imageIndex: 1,
      loadingReport: false,
      reportDetailError: false,
      firstLoad: false,
    };
    reportData.email = this.props.userData?.Email;

    AsyncStorage.getItem('warningShown', (error, data) => {
      if (!data && this.state.Listing.OwnerID != this?.props?.userData?.ID) {
        AsyncStorage.setItem('warningShown', 'true');
        this.setState({firstLoad: true});
      } else if (this.state.Listing.OwnerID == this?.props?.userData?.ID) {
        AsyncStorage.getItem('ItemNeedSharePoup', (_error, _item) => {
          // ItemNeedSharePoup to display share poup to user , when he open his offer in second time
          if (!!_item && _item.includes(this.state.Listing?.ID ?? '')) {
            AsyncStorage.setItem(
              'ItemNeedSharePoup',
              _item.replace(`${this.state.Listing?.ID},`, ''),
            );
            this.IsSharePopup.open();
          }
        });
      }
    });

    this.BottomBarSpace = new Animated.Value(0);
    this.ContactBoxSpace = new Animated.Value(100);
  }

  renderCurrency(Listing) {
    switch (Listing.ISOCode) {
      case 'JO':
        return I18nManager.isRTL ? 'دينار' : 'JOD';
      case 'PS':
        return I18nManager.isRTL ? 'شيكل' : 'ILS';
      default:
        return '';
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  handleGetDirections = destination => {
    const data = {
      destination: destination,
      params: [
        {
          key: 'travelmode',
          value: 'driving', // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate', // this instantly initializes navigation using the given travel mode
        },
      ],
    };

    getDirections(data);
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    const item = this.props?.route?.params?.item;

    if (
      !!this.props?.route?.params?.showFeatures ||
      !!this.props?.route?.params?.isNewUser
    ) {
      KS.FeaturesGet({
        langid: Languages.langID,
        selltype: item.SellType,
        typeID: item.Section ? item.Section : item.TypeID,
      })
        .then(data => {
          if (data && data.Success == 1) {
            if (data.Features && data.Features.length > 0) {
              this.setState(
                {
                  FeaturesSwitch: data.FeaturesSwitch,
                  FeaturesDropDown: data.FeaturesDropDown,
                  FeaturesLoaded: true,
                },
                () => {
                  if (!!this.props?.route?.params?.showFeatures == true) {
                    this.FeaturesModal.open();
                  }
                },
              );
            } else {
              if (!!this.props?.route?.params?.isNewUser == true) {
                this.setState({
                  OtpOpen: true,
                });
              }
              if (!!this.props?.route?.params?.pendingDelete) {
                this.setState({pendingDelete: true, OtpOpen: true});
              }
            }
          }
        })
        .finally(() => {
          this.setState({loadingReport: false});
        });
    }
    KS.ListingGet({
      langid: Languages.langID,
      pID: this.props?.route?.params?.item?.ID,
      typeID: (this.props?.route?.params?.item || {TypeID: 1}).TypeID,
      userid: (this?.props?.userData && this?.props?.userData?.ID) || '',
      isoCode: this.props.ViewingCountry?.cca2,
    }).then(data => {
      if (data && data.Success == 1) {
        this.setState({
          Listing: data.Listing,
          Features: data.ItemFeatures,
          Owner: data.Owner,
          Dealer: data.Dealer || undefined,
          RelatedListings: data.RelatedListings,
          Favorite: data.Listing?.Favorite,
          isLoading: false,
        });
        if (!this.props.userData || this.props.userData?.ID != data.Owner?.ID) {
          this.props.updateRecentlySeenListings(data.Listing);
        }
        if (data.Deleted) {
          this.props.navigation.replace('HomeScreen');
        }
      } else {
        this.setState({
          isLoading: false,
        });
        //   alert("hh");
        //   toast(Languages.SomethingWentWrong);
        //  this.props.navigation.goBack();
      }
    });

    if (!!this.props.userData && !!this.props.userData.Country) {
      KS.GetCountry({Id: this.props.userData.Country})
        .then(res => {
          this.setState({userCountry: res.Country});
        })
        .catch(err => {
          console.log({err});
        });
    }

    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        KS.BannersGet({
          isoCode: data,
          langID: Languages.langID,
          placementID: 9,
        }).then(data => {
          if (data && data.Success == '1' && data.Banners?.length > 0) {
            this.setState(
              {
                AutobeebBanner:
                  data.Banners[this.getRandomInt(data.Banners.length - 1)],
              },
              () => {
                KS.BannerViewed(this.state.AutobeebBanner.ID);
              },
            );
          }
        });
      }
    });

    this.keyboardWillShowSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardWillHideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  _keyboardDidShow = () => {
    Animated.timing(this.BottomBarSpace, {
      toValue: 100, // move it off-screen (you can adjust)
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  _keyboardDidHide = () => {
    Animated.timing(this.BottomBarSpace, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
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
                    x => x.ISOCode.toLowerCase() == data.toLowerCase(),
                  )
                    ? this.state.CountriesData.find(
                        x => x.ISOCode.toLowerCase() == data.toLowerCase(),
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

  AppLink() {
    return `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;
  }

  componentWillUnmount() {
    this.backHandler.remove();
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  handleBackPress = () => {
    if (this.state.isSpecialPlansModal) {
      this.SpecialPlansModal.close();
    } else if (!!this.state.openedImage) {
      this.setState({openedImage: null});
    } else if (this.state.modalPhotoOpen) {
      this.setState({modalPhotoOpen: false}, () => {
        setTimeout(() => {
          if (this.state.scrollToImage) {
            this.imagesListRef.scrollToIndex({
              animated: true,
              index: this.state.scrollToImage,
            });
          }
        }, 1000);
      });
    } else {
      this.props.navigation.goBack();
    }
    return true;
  };

  CopyText = text => {
    Clipboard.setString(text);
    this.setState({displyCopyNotify: true});
    setTimeout(() => {
      this.setState({displyCopyNotify: false});
    }, 700);
  };

  getShareMessage = () => {
    return (
      (I18nManager.isRTL
        ? 'https://autobeeb.com/ar/ads/'
        : 'https://autobeeb.com/ads/') +
      this.state.Listing.Name.replace(/\ /g, '-') +
      '/' +
      this.state.Listing.ID +
      '/' +
      this.state.Listing.TypeID
    );
  };
  shareOnSocial = async platform => {
    const options = {
      url: this.AppLink(),
      message: `${Languages.CheckOffer}\n${this.getShareMessage()}`,
    };

    switch (platform) {
      case 'facebook':
        options.social = ShareLib.Social.FACEBOOK;
        break;
      case 'twitter': // X (formerly Twitter)
        options.social = ShareLib.Social.TWITTER;
        break;
      case 'whatsapp':
        options.social = ShareLib.Social.WHATSAPP;
        break;
      case 'instagram':
        options.social = ShareLib.Social.INSTAGRAM;
        break;
      case 'snapchat':
        options.social = ShareLib.Social.SNAPCHAT;
        break;
      default:
        console.log('Unsupported platform');
        return;
    }

    try {
      await ShareLib.shareSingle(options);
    } catch (error) {
      console.log('Error =>', ShareLib);
      console.log('Error =>', error);
    }
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          Languages.CheckOffer +
          '\n' +
          this.getShareMessage() +
          '\n' +
          '\n' +
          Languages.DownloadAutobeeb +
          '\n' +
          this.AppLink(),
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  renderPaymentMethod(value) {
    switch (value) {
      case 1:
        return '';
      case 2:
        return '/ ' + Languages.Installments;
      default:
        return '';
    }
  }

  renderFuelType(value) {
    try {
      if (value) {
        return this.fuelTypes.find(FT => FT.ID == value).Name;
      } else {
        return Languages.SomethingWentWrong;
      }
    } catch {
      return '';
    }
  }
  renderGearBox(value) {
    try {
      if (value) {
        return this.gearBoxTrucks.find(GB => GB.ID == value).Name;
      } else {
        return Languages.SomethingWentWrong;
      }
    } catch {
      return '';
    }
  }

  renderSection(Listing) {
    try {
      if (Listing.TypeID == 4 && Languages.langID != 2) {
        return Listing.SectionName.split(' ')[0];
      } else if (
        Listing.TypeID == 32 &&
        Listing.SectionName.split(' ').length > 2 &&
        Languages.langID != 2
      ) {
        return Listing.SectionName.split(' ')[0];
      } else if (
        Listing.TypeID == 32 &&
        Listing.SectionName.split(' ').length > 2 &&
        Languages.langID == 2
      ) {
        return Listing.SectionName.split(' ')[2];
      } else {
        return Listing.SectionName;
      }
    } catch {
      return Listing.SectionName;
    }
  }

  resendCode() {
    this.setState({otp: ''});
    KS.ResendOTP({
      userID:
        this.props?.route?.params?.UserID ??
        (this.props.userData && this.props.userData.ID),
      otpType: this.props.userData?.EmailRegister ? 2 : 0,
    }).then(data => {
      if (data.Success == 1) {
      } else {
        alert('something went wrong');
      }
      //
    });
  }
  openPhoto = index => {
    this.setState({
      index: index,
    });
    this.modalPhoto.open();
  };
  closePhoto = () =>
    this.setState({
      modalPhotoOpen: false,
    });
  handleScroll(event) {
    let page = this.state.imageIndex;
    if (I18nManager.isRTL) {
      page =
        this.state.Listing?.Images?.length -
        1 -
        Math.round(
          event.nativeEvent.contentOffset.x / Dimensions.get('screen').width,
        );

      this.setState({imageIndex: Math.round(page) + 1});
    } else {
      page = event.nativeEvent.contentOffset.x / Dimensions.get('screen').width;
      this.setState({imageIndex: Math.round(page) + 1});
    }
    //   alert(JSON.stringify(page))
    //console.log(Math.round(page));
    //  alert(JSON.stringify(page))
  }

  XIconSVG = ({size, color}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.75 2H21.5L14.25 10.625L22.5 22H15.75L10.75 15.125L4.5 22H1.75L9.5 12.875L2 2H8.75L13.25 8.25L18.75 2ZM17.5 20H19L7.5 4H6L17.5 20Z"
        fill={color}
      />
    </Svg>
  );

  renderImages = () => {
    return (
      <View
        style={[
          {
            height: Dimensions.get('screen').width / 1.2,
            width: Dimensions.get('screen').width,
          },
          this.state.Listing &&
            this.state.Listing.Images &&
            this.state.Listing.Images.length == 0 && {
              alignItems: 'center',
              justifyContent: 'center',
            },
        ]}>
        {this.state.Listing.IsSpecial && (
          <>
            {Languages.prefix == 'en' || Languages.prefix == 'ar' ? (
              <View style={styles.specialSiganl}>
                <Text style={styles.specialSiganlText}>
                  {Languages.SpecialOffer}
                </Text>
              </View>
            ) : (
              <View
                style={[styles.specialSiganl, styles.specialSiganlOtherLang]}>
                <Text
                  style={[
                    styles.specialSiganlText,
                    styles.specialSiganlTextOtherLang,
                  ]}>
                  <SpecialSVG />
                  <View style={{width: 5}} />
                  <SpecialSVG />
                  <View style={{width: 5}} />
                  <SpecialSVG />
                </Text>
              </View>
            )}
          </>
        )}

        {this.state.Listing &&
        this.state.Listing.Images &&
        this.state.Listing.Images.length > 0 ? (
          <FlatList
            ref={ins => (this.imagesListRef = ins)}
            style={{
              height: Dimensions.get('screen').width / 1.2,
              width: Dimensions.get('screen').width,
            }}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{minWidth: '100%', justifyContent: 'center'}}
            pagingEnabled
            onScroll={this.handleScroll.bind(this)}
            initialNumToRender={16}
            data={this.state.Listing.Images}
            renderItem={({item, index}) => {
              const isFailOver = this.state.FailOverImages?.includes(index);
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    this.openPhoto(index);
                  }}>
                  <FastImage
                    style={{
                      height: Dimensions.get('screen').width / 1.2,
                      width:
                        Dimensions.get('screen').width * (isFailOver ? 0.7 : 1),
                    }}
                    resizeMode={isFailOver ? 'contain' : 'cover'}
                    source={
                      isFailOver
                        ? FAILOVER_IMAGE
                        : {
                            uri: `https://autobeeb.com/${this.state.Listing.ImageBasePath}${item}_1024x853.jpg`,
                          }
                    }
                    onError={() => {
                      this.setState(prevState => ({
                        FailOverImages: !prevState.FailOverImages
                          ? [index]
                          : [...prevState.FailOverImages, index],
                      }));
                    }}
                  />
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <Image
            style={{
              height: Dimensions.get('screen').width / 1.2,
              width: Dimensions.get('screen').width * 0.7,
              alignSelf: 'center',
            }}
            resizeMode="contain"
            source={require('../images/placeholder.png')}
          />
        )}

        {this.state.Listing.Images && this.state.Listing.Images.length > 1 && (
          <Text
            style={{
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              position: 'absolute',
              zIndex: 100,
              bottom: 10,
              left: I18nManager.isRTL ? 10 : undefined,
              right: I18nManager.isRTL ? undefined : 10,
              alignSelf: 'center',
              paddingHorizontal: 5,
              fontSize: 14,
              borderRadius: 4,
            }}>
            {`${this.state.Listing.Images.length - this.state.imageIndex + 1}`}{' '}
            <IconFa name={'image'} size={14} color={'#fff'} />
          </Text>
        )}
      </View>
    );
  };

  checkOTP() {
    const _this = this;
    const otp = this.state.otp;
    KS.UserVerifyOTP({
      otpcode: otp,
      userid:
        this.props?.route?.params?.UserID ||
        (this.props.userData && this.props.userData.ID),
      username:
        !!this.props?.route?.params?.isEmailRegister ||
        (this.props.userData &&
          this.props.userData.EmailRegister &&
          this.props.userData.EmailConfirmed == false)
          ? this.props?.route?.params?.Email || this.props.userData?.Email
          : this.props?.route?.params?.Phone ||
            (this.props.userData && this.props.userData.Phone),
    }).then(data => {
      if (data.OTPVerified == true || data.EmailConfirmed == true) {
        if (this.state.pendingDelete)
          KS.TransferListing({
            userid:
              this.props?.route?.params?.UserID ??
              (this.props.userData && this.props.userData.ID),
            listingID: this.state.Listing.ID,
          });

        toast(Languages.PublishSuccess, 3500);
        //  Alert.alert('DONE!!');
        if (data.User) {
          _this.props.storeUserData(data.User, () => {
            this.setState({OtpOpen: false});
            this.SpecialPlansModal.open();
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

  renderOkCancelButton(onCancelPress, onOkPress) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderTopColor: '#ccc',
          borderTopWidth: 1,
          marginTop: 5,
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
          {this.state.isFeaturesModalLoading ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
              style={{paddingVertical: 12}}
            />
          ) : (
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                paddingVertical: 10,
                fontSize: 15,
              }}>
              {Languages.OK}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  onScrollHandler = ({nativeEvent}) => {
    const currentY = nativeEvent.contentOffset.y;
    const direction =
      currentY != 0 && currentY > this.lastScrollY ? 'down' : 'up';

    if (currentY < 100) {
      this.lastScrollY = currentY;
      return;
    }

    // Only animate if direction has changed
    if (direction !== this.currentDirection) {
      this.currentDirection = direction;

      Animated.parallel([
        Animated.timing(this.BottomBarSpace, {
          toValue: direction === 'down' ? 100 : 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(this.ContactBoxSpace, {
          toValue: direction === 'down' ? 0 : 100,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ]).start();
    }

    this.lastScrollY = currentY;
  };

  render() {
    const {Listing} = this.state;

    this.gearBoxTrucks = [
      {
        ID: 1,
        Name: Languages.Automatic,
      },
      {
        ID: 2,
        Name: Languages.Manual,
      },
      {
        ID: 4,
        Name: Languages.SemiAutomatic,
      },
    ];

    this.fuelTypes = [
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

    this.offerCondition = [
      {
        ID: 1,
        Name: Languages.New,
      },
      {
        ID: 2,
        Name: Languages.Used,
      },
    ];

    this.sellTypes = [
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('../images/SellTypes/WhiteSale.png'),

        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('../images/SellTypes/WhiteRent.png'),

        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require('../images/SellTypes/WhiteWanted.png'),

        backgroundColor: '#D31018',
      },
    ];
    this.rentPeriod = [
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
      {
        ID: 15,
        Name: Languages.AnyPeriod,
      },
    ];

    const notOtpConfirmed =
      this.props.userData &&
      this.props.userData.OTPConfirmed == false &&
      this.props.userData.ID == this.state.Owner?.ID &&
      !this.props.userData.EmailRegister;

    const notEmailConfirmed =
      this.props.userData &&
      this.props.userData.EmailConfirmed == false &&
      this.props.userData.ID == this.state.Owner?.ID &&
      this.props.userData.EmailRegister;
    let isOnline = this.props.chat.onlineUsers?.includes(Listing.OwnerID);

    if (
      (this.state.isLoading && !this.state.Listing.Name) ||
      this.state.loadingReport
    ) {
      return (
        <View
          style={{flex: 1, justifyContent: 'center', backgroundColor: '#fff'}}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"></StatusBar>
          <LogoSpinner fullStretch={true} />
        </View>
      );
    }

    if (!this.state.isFocused || this.state.modalPhotoOpen) {
      return (
        <View
          style={{flex: 1, justifyContent: 'center', backgroundColor: '#fff'}}>
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.8)',
              'rgba(0,0,0,0.5)',
              'rgba(0,0,0,0.3)',
              'rgba(0,0,0,0.1)',
            ]}
            style={{
              position: 'absolute',

              top: 0,
              zIndex: 200,
              //   elevation:10,
              minHeight: 50,
              paddingTop: isIphoneX() ? 20 : 10,
              width: Dimensions.get('screen').width,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 5,
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{marginRight: 15}}
                onPress={() => {
                  if (!!this.state.openedImage) {
                    this.setState({
                      openedImage: null,
                    });
                  } else {
                    this.setState({
                      modalPhotoOpen: false,
                    });
                  }
                }}>
                <IconEV name="close" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{marginRight: 15}}
                onPress={() => {
                  this.onShare();
                }}>
                <IconEV name="share-google" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        {this.state.firstLoad && (
          <AutobeebModal
            ref={instance => (this.WarningPopup = instance)}
            isOpen={this.state.firstLoad}
            style={[styles.modelModal]}
            position="center"
            onClosed={() => {
              this.setState({firstLoad: false});
            }}
            backButtonClose
            entry="bottom"
            swipeToClose={true}
            backdropPressToClose
            coverScreen={Platform.OS == 'android'}
            backdropOpacity={0.9}>
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <IconFE
                name="alert-triangle"
                style={{fontSize: 90, color: '#ffcc00'}}></IconFE>
              <Text
                style={{fontSize: 20, color: '#ffcc00', textAlign: 'center'}}>
                {Languages.WarningMessage}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState({firstLoad: false});
                }}>
                <Text
                  style={{
                    paddingHorizontal: 25,
                    paddingVertical: 5,
                    borderRadius: 10,
                    marginTop: 20,
                    fontSize: 20,
                    color: '#ffffff',
                    backgroundColor: Color.secondary,
                    textAlign: 'center',
                  }}>
                  {Languages.OK}
                </Text>
              </TouchableOpacity>
            </View>
          </AutobeebModal>
        )}
        {this.state.isLoading && <LogoSpinner fullStretch={true} />}
        <OTPModal
          isOpen={this.state.OtpOpen}
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterItNow}
          pendingDelete={this.state.pendingDelete}
          onOpened={() => {
            this.setState({footerShown: false});
          }}
          Username={
            !!this.props?.route?.params?.isEmailRegister ||
            (this.props.userData &&
              this.props.userData.EmailRegister &&
              this.props.userData.EmailConfirmed == false)
              ? this.state.Email || this.props.userData?.Email
              : this.props?.route?.params?.Phone ||
                (this.props.userData && this.props.userData.Phone)
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
        <AutobeebModal
          ref={instance => (this.FeaturesModal = instance)}
          style={[styles.modelModal]}
          fullScreen={true}
          position="center"
          onClosed={() => {
            if (!!this.props?.route?.params?.isNewUser == true) {
              this.setState({
                OtpOpen: true,
              });
            }

            if (!!this.props?.route?.params?.pendingDelete == true) {
              this.setState({pendingDelete: true, OtpOpen: true});
            }
            console.log({
              IsSpecial: this.props?.route?.params?.IsSpecial,
              TypeID: this.props?.route?.params?.item?.TypeID,
              SellType: `${this.props?.route?.params?.item?.SellType}`,
            });
            if (
              !!this.props?.route?.params?.pendingDelete == false &&
              !!this.props?.route?.params?.isNewUser == false &&
              !this.props?.route?.params?.IsSpecial &&
              this.props?.route?.params?.item?.TypeID != '32' &&
              `${this.props?.route?.params?.item?.SellType}` != '4'
            ) {
              this.SpecialPlansModal.open();
            }
          }}
          backButtonClose={true}
          entry="bottom"
          swipeToClose={false}
          // backdropPressToClose
          coverScreen={true}
          backdropOpacity={0.5}>
          <View
            style={[
              styles.modelContainer,
              {
                backgroundColor: '#fff',
                maxHeight: Dimensions.get('screen').height * 0.8,
              },
              {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
              },
            ]}>
            <ScrollView nestedScrollEnabled={true}>
              {this.state.FeaturesLoaded ? (
                <View style={{}}>
                  <Text
                    style={{padding: 5, textAlign: 'center', color: '#000'}}>
                    {Languages.SelectFeatureSet}
                  </Text>
                  <View style={{}}>
                    <FlatList
                      nestedScrollEnabled
                      keyExtractor={(item, index) => index.toString()}
                      data={this.state.FeaturesSwitch || []}
                      style={{
                        maxHeight: Dimensions.get('screen').height * 0.75,
                      }}
                      extraData={this.state}
                      renderItem={({item, index}) => {
                        return (
                          <TouchableOpacity
                            style={[
                              {
                                borderBottomWidth: 1,
                                borderBottomColor: '#ddd',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                backgroundColor:
                                  this.state.selectedFeatures &&
                                  this.state.selectedFeatures.filter(
                                    model => model.ID == item.ID,
                                  ).length > 0
                                    ? Color.primary
                                    : '#fff',
                              },
                            ]}
                            onPress={() => {
                              if (
                                this.state.selectedFeatures &&
                                this.state.selectedFeatures.filter(
                                  model => model.ID == item.ID,
                                ).length > 0 //model is already selected
                              ) {
                                let models = this.state.selectedFeatures.filter(
                                  model => model.ID != item.ID, //remove model
                                );

                                this.setState({
                                  selectedFeatures: models,
                                });
                              } else {
                                let models = this.state.selectedFeatures;

                                models.push(item);
                                this.setState({
                                  selectedFeatures: models,
                                });
                              }
                            }}>
                            <Image
                              style={{
                                width: 50,
                                height: 50,
                              }}
                              tintColor={
                                this.state.selectedFeatures &&
                                this.state.selectedFeatures.filter(
                                  model => model.ID == item.ID,
                                ).length > 0
                                  ? '#FFF'
                                  : Color.secondary
                              }
                              resizeMode={'contain'}
                              source={{
                                uri:
                                  'https://autobeeb.com/' +
                                  item.FullImagePath +
                                  '_300x150.png',
                              }}
                            />

                            <Text
                              style={{
                                color:
                                  this.state.selectedFeatures &&
                                  this.state.selectedFeatures.filter(
                                    model => model.ID == item.ID,
                                  ).length > 0
                                    ? '#FFF'
                                    : Color.secondary,
                                fontSize: 15,
                                textAlign: 'left',
                                flex: 1,
                              }}>
                              {item.Name}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />

                    <SectionList
                      sections={this.state.FeaturesDropDown.map(item => {
                        return {title: item.Name, data: item.Options};
                      })}
                      keyExtractor={(item, index) => item + index}
                      style={
                        {
                          //marginHorizontal: 10
                        }
                      }
                      renderItem={({item}) => {
                        return (
                          <TouchableOpacity
                            style={{
                              marginBottom: 3,
                            }}
                            onPress={() => {
                              let SingleFeature =
                                this.state.FeaturesDropDown.find(
                                  x => x.ID == item.FeatureID,
                                );
                              SingleFeature.Value = item.ID; // this set the state of the item

                              let selectedDropdownFeatures =
                                this.state.selectedDropdownFeatures;
                              if (
                                selectedDropdownFeatures.filter(
                                  x => x.ID == item.FeatureID,
                                ).length == 0
                              ) {
                                //already selected value for this
                                selectedDropdownFeatures = [
                                  ...this.state.selectedDropdownFeatures,
                                  SingleFeature,
                                ];
                              }

                              var mapped = selectedDropdownFeatures.map(
                                item => ({
                                  [item.ID]: item.Value,
                                }),
                              );
                              let newObj = Object.assign({}, ...mapped);

                              this.setState({
                                selectedDropdownFeatures,
                                FormattedDropDownFeatures: newObj,
                              });
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'left',
                                marginLeft: 10,
                                color:
                                  this.state.selectedDropdownFeatures.filter(
                                    x => x.Value == item.ID,
                                  ).length > 0
                                    ? Color.primary
                                    : 'black',
                              }}>
                              {item.Name}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                      renderSectionHeader={({section: {title}}) => (
                        <Text
                          style={{
                            color: Color.secondary,
                            borderBottomWidth: 1,
                            textAlign: 'left',

                            fontSize: 18,
                            marginTop: 15,
                            borderBottomColor: '#ddd',
                            fontFamily: 'Cairo-Bold',
                          }}>
                          {title}
                        </Text>
                      )}
                    />
                  </View>
                </View>
              ) : (
                <Text style={{}}>{'loading'}</Text>
              )}
            </ScrollView>
            {this.renderOkCancelButton(
              () => {
                this.FeaturesModal.close();
              },
              () => {
                this.setState({isFeaturesModalLoading: true}, () => {
                  KS.FeatureSetAdd({
                    listingID: this.state.Listing.ID,
                    featureSet: {
                      FeaturesOn: this.state.selectedFeatures
                        ? this.state.selectedFeatures.map(feature => feature.ID)
                        : [],
                      FeaturesDropdown:
                        this.state.FormattedDropDownFeatures || {},
                    },
                  })
                    .then(data => {
                      if (data && data.Success == 1) {
                        KS.ListingGet({
                          // to refresh features
                          userid:
                            (this.props.userData && this.props.userData.ID) ||
                            '',
                          langid: Languages.langID,
                          pID: this.props?.route?.params?.item?.ID,
                          typeID: this.props?.route?.params?.item?.TypeID,
                          ignoreDelete:
                            this.props?.route?.params?.item?.TypeID == 32
                              ? false
                              : true,
                        }).then(data => {
                          if (data.Success == 1) {
                            this.setState({
                              Listing: data.Listing,
                              Features: data.ItemFeatures,
                            });
                          } else {
                            toast(Languages.SomethingWentWrong);
                          }
                        });
                        this.FeaturesModal.close();
                      }
                    })
                    .finally(() => {
                      this.setState({isFeaturesModalLoading: false});
                    });
                });
              },
            )}
          </View>
        </AutobeebModal>
        <AutobeebModal
          ref={instance => (this.SpecialPlansModal = instance)}
          style={[
            styles.modelModal,
            {flexDirection: 'column', justifyContent: 'flex-end'},
          ]}
          fullScreen={true}
          position="center"
          onClosed={() => {
            this.setState({
              isSpecialPlansModal: false,
            });
          }}
          onOpened={() => {
            this.setState({
              isSpecialPlansModal: true,
            });
          }}
          backButtonClose={true}
          entry="bottom"
          swipeToClose={false}
          backdropPressToClose
          coverScreen={true}
          backdropOpacity={0.5}>
          <View
            style={[
              styles.modelContainer,
              {
                backgroundColor: '#fff',
                height: Dimensions.get('screen').height * 0.93,
                width: Dimensions.get('screen').width * 0.9,
                bottom: 0,
                alignItems: 'center',
              },
            ]}>
            <SpecialPlans
              pOffer={Listing}
              pUser={!!this.props.userData ? {...this.props.userData} : null}
              pCurrency={global.ViewingCurrency || this.props.ViewingCurrency}
              pOnClose={() => {
                this.SpecialPlansModal.close();
              }}
            />
          </View>
        </AutobeebModal>
        <AutobeebModal //the full view
          ref={instance => (this.modalPhoto = instance)}
          swipeToClose={false}
          fullScreen={true}
          animationDuration={200}
          style={styles.modalBoxWrap}
          useNativeDriver={true}>
          <FlatList
            style={{
              height: Dimensions.get('screen').width / 1.2,
              width: Dimensions.get('screen').width,
            }}
            contentContainerStyle={{
              gap: 15,
              paddingBottom: 20,
            }}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={16}
            numColumns={0}
            data={this.state.Listing.Images}
            renderItem={({item, index}) => {
              return (
                <FastImage
                  style={{
                    height: Dimensions.get('screen').width / 1.2,
                    width: Dimensions.get('screen').width,
                  }}
                  resizeMode="cover"
                  source={{
                    uri: `https://autobeeb.com/${this.state.Listing.ImageBasePath}${item}.jpg`,
                  }}
                />
              );
            }}
          />
        </AutobeebModal>
        <View
          style={{
            position: 'absolute',
            top: 0,
            zIndex: 200,
            minHeight: 70,
            paddingTop: 15,
            width: Dimensions.get('screen').width,
          }}>
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              style={{
                marginRight: 15,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 100,
                padding: 7,
              }}
              onPress={data => {
                this.props.navigation.goBack();
              }}>
              <Ionicons
                name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
                size={20}
                color={'white'}
              />
            </TouchableOpacity>

            <Pressable
              onPress={() => {
                this.shareOnSocial('facebook');
              }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 10,
              }}>
              <FacebookIcon size={32} />
            </Pressable>
          </View>
        </View>

        {!this.state.modalPhotoOpen && this.state.footerShown && (
          <Animated.View
            style={{
              transform: [{translateY: this.ContactBoxSpace}],
              position: 'absolute',
              bottom: 0,
              width: Dimensions.get('screen').width,
              zIndex: 2,
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              gap: 6,
              paddingVertical: 8,
            }}>
            {!(
              this.state.Dealer &&
              this.state.Dealer.HideMobile &&
              this.state.Dealer.User.Phone == Listing.Phone
            ) && ( // if the dealer hide his phone and the phone is the same as it, hide it too
              <TouchableOpacity
                style={[
                  styles.bottomBox,
                  {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: Color.secondary,
                    borderRadius: 5,
                  },
                ]}
                onPress={() => {
                  Linking.openURL(`tel:${Listing.Phone}`);
                  KS.UpdateMobileClick({
                    UserId: Listing.OwnerID,
                    ListingId: Listing.ID,
                  });
                }}>
                <IconFa name="phone" size={20} color={Color.secondary} />
                <Text
                  style={{
                    color: Color.secondary,
                    fontSize: 16,
                    marginHorizontal: 4,
                  }}>
                  {Languages.Call}
                </Text>
              </TouchableOpacity>
            )}
            {(this.props.userData == null ||
              (this.props.userData &&
                this.props.userData.ID != this.state.Owner?.ID)) && (
              <TouchableOpacity
                style={[
                  styles.bottomBox,
                  {
                    backgroundColor: isOnline ? 'green' : '#fff',
                    borderWidth: 1,
                    borderColor: '#2B9531',
                    borderRadius: 5,
                  },
                ]}
                onPress={() => {
                  if (this.props.userData) {
                    delete Listing.Views;
                    KS.AddEntitySession({
                      userID: this.props.userData.ID,
                      targetID: this.state.Owner?.ID,
                      relatedEntity: JSON.stringify(Listing),
                    }).then(data => {
                      this.props.navigation.navigate('ChatScreen', {
                        targetID: this.state.Owner?.ID,
                        ownerName: this.state.Owner.Name,
                        description: Listing.Name,
                        entityID: Listing.ID,
                        sessionID: data.SessionID,
                      });
                    });
                  } else {
                    this.props.navigation.navigate('LoginScreen');
                  }
                }}>
                {isOnline ? (
                  <IconIon name="chatbubbles" size={20} color="#fff" />
                ) : (
                  <IconIon
                    name="chatbubbles-outline"
                    size={20}
                    color={'green'}
                  />
                )}
                <Text
                  style={{
                    color: isOnline ? '#fff' : 'green',
                    fontSize: 16,
                    marginHorizontal: 4,
                  }}>
                  {isOnline ? Languages.Online : Languages.Chat}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
        {Listing && (
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{
              backgroundColor: '#F3F3F3',
              paddingBottom: 60,
            }}
            onScroll={this.onScrollHandler}>
            {this.renderImages()}
            <View
              style={{
                paddingHorizontal: 10,

                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderColor: '#eee',
                backgroundColor: '#fff',
              }}>
              {(notOtpConfirmed || notEmailConfirmed) && (
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.setState({OtpOpen: true});
                  }}>
                  <Text style={{color: '#000', textAlign: 'left'}}>
                    {Languages.UnpublishedOffer}
                    <Text style={{color: Color.primary, textAlign: 'left'}}>
                      {Languages.VerifyNow}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                {Listing.Name && (
                  <Text
                    style={{
                      color: Color.secondary,
                      fontSize: 20,
                      textAlign: 'left',
                    }}>
                    {Listing.Name.replace(/\n/g, ' ')}
                    {Listing.IsSpecial && (
                      <View style={styles.specialSVG}>
                        <SpecialSVG />
                      </View>
                    )}
                  </Text>
                )}
              </View>

              <View
                style={{
                  flexDirection:
                    `${Listing.CityName}`.length >= 10 ? 'column' : 'row',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                <View
                  style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {Listing && Listing.SellType != 4 && (
                    <Text
                      style={{
                        color: Color.error,
                        fontSize: 18,
                        fontFamily: 'Cairo-Bold',
                        fontSize: 16,
                        marginRight: 15,
                      }}>
                      {Listing.FormatedPrice
                        ? Listing.FormatedPrice
                        : Languages.CallForPrice}
                    </Text>
                  )}

                  {!!Listing.PaymentMethod && (
                    <Text
                      style={{
                        color: 'green',
                        fontFamily: 'Cairo-Bold',
                        fontSize: 18,
                        fontSize: 16,
                      }}>
                      {this.renderPaymentMethod(Listing.PaymentMethod)}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}>
                  <IconFa name="map-marker" size={16} color="gray" />
                  <Text
                    style={{color: 'gray', marginHorizontal: 10, fontSize: 16}}>
                    {`${Listing.CountryName} / ${
                      Listing?.CityName ? Listing.CityName : ''
                    }`}
                  </Text>
                </View>
              </View>
            </View>

            {(Listing.TypeID == 1 ||
              Listing.TypeID == 2 ||
              Listing.TypeID == 4 ||
              Listing.TypeID == 8) &&
              Listing.SellType == 1 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    backgroundColor: '#fff',
                    shadowColor: '#eee',
                    shadowOffset: {
                      width: 0,
                      height: 7,
                    },
                    shadowOpacity: 0.41,
                    shadowRadius: 9.11,
                    elevation: 14,
                  }}>
                  {!!Listing.Year && (
                    <View style={styles.box}>
                      <Image
                        style={{
                          width: 24,
                          height: 24,
                        }}
                        resizeMode="contain"
                        source={require('../images/year.png')}
                      />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 14,
                          textAlign: 'center',
                        }}>
                        {Listing.Year}
                      </Text>
                    </View>
                  )}
                  {!!Listing.FuelType && (
                    <View style={styles.box}>
                      <Image
                        style={{
                          width: 24,
                          height: 24,
                        }}
                        resizeMode="contain"
                        source={require('../images/fuelType.png')}
                      />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 14,
                          textAlign: 'center',
                        }}>
                        {this.renderFuelType(Listing.FuelType)}
                      </Text>
                    </View>
                  )}
                  {!!Listing.Consumption && (
                    <View style={styles.box}>
                      <Image
                        style={{
                          width: 24,
                          height: 24,
                        }}
                        resizeMode="contain"
                        source={require('../images/km.png')}
                      />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 14,
                          textAlign: 'center',
                        }}>
                        {Listing.TypeID == 4
                          ? Listing.Consumption + Languages.Hrs
                          : Listing.Consumption + Languages.KM}
                      </Text>
                    </View>
                  )}

                  {!!Listing.GearBox && (
                    <View style={[styles.box, {borderRightWidth: 0}]}>
                      <Image
                        style={{
                          width: 24,
                          height: 24,
                        }}
                        resizeMode="contain"
                        source={require('../images/gearbox.png')}
                      />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 14,
                          textAlign: 'center',
                        }}>
                        {this.renderGearBox(Listing.GearBox)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

            {Listing.IsSpecial &&
            !!this.props.userData?.ID &&
            this.state.Owner?.ID === this.props.userData?.ID ? (
              <View style={[styles.SellFast, {backgroundColor: 'red'}]}>
                <View style={styles.SellFastBox}>
                  <Text style={styles.SellFastTile}>
                    {Languages.FeaturedUntil}
                    {new Date(Listing.SpecialExpiryDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ) : (
              // Omar khattab
              <TouchableOpacity
                onPress={() => {
                  if (this.state.Owner?.ID === this.props.userData?.ID) {
                    if (notOtpConfirmed || notEmailConfirmed) {
                      this.setState({OtpOpen: true});
                    } else {
                      this.props.navigation.navigate('SpecialPlans', {
                        Offer: Listing,
                        User: !!this.props.userData
                          ? {...this.props.userData}
                          : null,
                        Currency:
                          global.ViewingCurrency || this.props.ViewingCurrency,
                        ISOCode: this.props.ViewingCountry?.cca2,
                      });
                    }
                  } else if (!!!this.props.userData?.ID) {
                    this.props.navigation.navigate('PostOfferScreen');
                  } else {
                    this.props.navigation.navigate('ActiveOffers');
                  }
                }}>
                <View style={styles.SellFast}>
                  <View style={styles.SellFastBox}>
                    <Text style={styles.SellFastTile}>
                      {Languages.SpecialYourOfferAction}
                    </Text>
                    <View>
                      <SpecialSVG color={'#e5e82c'} />
                    </View>
                  </View>
                  <View style={styles.sellFastBTN}>
                    <IconEn name={'rocket'} size={20} color={Color.primary} />
                    <Text style={styles.sellFastBTNText}>
                      {Languages.SpecialYourOfferTitle}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            <View
              style={[
                styles.boxContainer,
                styles.BoxShadow,
                {flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center'},
                styles.marginBottom,
              ]}>
              <Text
                style={[
                  styles.blackHeader,
                  {
                    paddingHorizontal: 10,
                    width: '100%',
                    paddingTop: 12,
                    paddingBottom: 6,
                  },
                  styles.titleStyle,
                ]}>
                {Languages.Information}
              </Text>
              {!!Listing.SellType && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.SellType}</Text>

                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Text style={[styles.sectionValue]}>
                      {Listing.TypeName + ' '}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: this.sellTypes.find(
                          val => val.ID == Listing.SellType,
                        ).backgroundColor,
                      }}>
                      {
                        this.sellTypes.find(val => val.ID == Listing.SellType)
                          .Name
                      }
                    </Text>
                  </View>
                </View>
              )}

              {!!Listing.Section && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Section}</Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {this.renderSection(Listing)}
                  </Text>
                </View>
              )}

              {!!Listing.PartNumber && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>
                    {Languages.PartNumber}
                  </Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {Listing.PartNumber}
                  </Text>
                </View>
              )}
              {!!Listing.CategoryName && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Category}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text numberOfLines={1} style={styles.sectionValue}>
                      {Listing.CategoryName}
                    </Text>
                    <Image
                      style={{width: 40, height: 40}}
                      source={{
                        uri:
                          'https://autobeeb.com/' +
                          'content/newlistingcategories/' +
                          Listing.TypeID +
                          '' +
                          Listing.CategoryID +
                          '/' +
                          Listing.CategoryID +
                          '_50x50.jpg',
                      }}
                    />
                  </View>
                </View>
              )}
              {}
              {!!Listing.MakeName && (
                <View style={[styles.sectionHalf]}>
                  <Text style={styles.sectionTitle}>{Languages.Make}</Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {Listing.MakeName}
                  </Text>
                </View>
              )}
              {!!Listing.ModelName && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Model}</Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {Listing.ModelName}
                  </Text>
                </View>
              )}
              {!!Listing.Condition && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Status}</Text>
                  <Text style={styles.sectionValue}>
                    {
                      this.offerCondition.find(
                        val => val.ID == Listing.Condition,
                      ).Name
                    }
                  </Text>
                </View>
              )}

              {!!Listing.Year && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Year}</Text>
                  <Text style={styles.sectionValue}>{Listing.Year}</Text>
                </View>
              )}

              {!!Listing.RentPeriod && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>
                    {Languages.RentPeriod}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {
                      this.rentPeriod.find(val => val.ID == Listing.RentPeriod)
                        .Name
                    }
                  </Text>
                </View>
              )}

              {!!Listing.GearBox && (
                <View style={styles.sectionHalf}>
                  <Text numberOfLines={1} style={styles.sectionTitle}>
                    {Languages.GearBox}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {this.renderGearBox(Listing.GearBox)}
                  </Text>
                </View>
              )}

              {!!Listing.FuelType && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.FuelType}</Text>
                  <Text style={styles.sectionValue}>
                    {this.renderFuelType(Listing.FuelType)}
                  </Text>
                </View>
              )}
              {!!Listing.CityName &&
                Listing.CityName != 'null' &&
                Listing.CityName != null && (
                  <View style={styles.sectionHalf}>
                    <Text style={styles.sectionTitle}>{Languages.City}</Text>
                    <Text numberOfLines={1} style={styles.sectionValue}>
                      {Listing.CityName}
                    </Text>
                  </View>
                )}

              {!!Listing.Consumption && (
                <View style={styles.sectionHalf}>
                  <Text numberOfLines={1} style={styles.sectionTitle}>
                    {Listing.TypeID == 4
                      ? Languages.WorkingHours
                      : Languages.Mileage}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {Listing.TypeID == 4
                      ? Listing.Consumption + Languages.Hrs
                      : Listing.Consumption}
                  </Text>
                </View>
              )}

              {!!Listing.ColorLabel && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Color}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        elevation: 2,
                        borderRadius: 10,
                        backgroundColor: Listing.Color,
                      }}
                    />
                    <Text style={styles.sectionValue}>
                      {' ' + Listing.ColorLabel}
                    </Text>
                  </View>
                </View>
              )}
              {!!Listing.ID && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.OfferID}</Text>
                  <Text style={styles.sectionValue}>{Listing.ID}</Text>
                </View>
              )}
              {!!Listing.DateAdded && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>
                    {Languages.PublishedDate}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {Moment(Listing.DateAdded).format('YYYY-MM-DD')}
                  </Text>
                </View>
              )}
            </View>

            {this.state.Features && this.state.Features.length > 0 && (
              <View style={{}}>
                <Text
                  style={[
                    styles.blackHeader,
                    {
                      marginTop: 10,
                      paddingHorizontal: 10,
                    },
                  ]}>
                  {Languages.Features}
                </Text>

                {this.state.Features && (
                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={[styles.boxContainer]}
                    numColumns={2}
                    data={this.state.Features.filter(x => x.Type == 1)}
                    renderItem={({item, index}) => {
                      if (item.Type == 1)
                        return (
                          <View
                            style={[
                              styles.featuresHalf,
                              Math.ceil((index + 1) / 2) % 2 == 0 && {
                                backgroundColor: '#FBFBFB',
                              },
                            ]}>
                            <Image
                              style={{
                                width: 25,
                                height: 25,
                                marginRight: 5,
                              }}
                              resizeMode={'contain'}
                              tintColor={'#bbb'}
                              source={{
                                uri:
                                  'https://autobeeb.com/' +
                                  item.FullImagePath +
                                  '.png',
                              }}
                            />
                            <Text numberOfLines={1} style={styles.featuresText}>
                              {item.Name}
                            </Text>
                          </View>
                        );
                    }}
                  />
                )}
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={[
                    styles.boxContainer,
                    {borderTopWidth: 0},
                  ]}
                  data={this.state.Features.filter(x => x.Type == 2)}
                  renderItem={({item, index}) => {
                    return (
                      <View
                        style={[
                          styles.featuresHalf,
                          index % 2 == 0 && {
                            backgroundColor: '#FBFBFB',
                          },
                        ]}>
                        {false && (
                          <Image
                            style={{width: 25, height: 25, marginRight: 5}}
                            resizeMode={'contain'}
                            tintColor={'#bbb'}
                            source={{
                              uri:
                                'https://autobeeb.com/' +
                                item.FullImagePath +
                                '.png',
                            }}
                          />
                        )}

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text numberOfLines={1} style={[styles.featuresText]}>
                            {item.Name}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[styles.featuresText, {marginLeft: 5}]}>
                            {item.OptionName}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            )}
            {!!Listing.Description && (
              <View
                style={[
                  styles.boxContainer,
                  styles.BoxShadow,
                  styles.marginBottom,
                ]}>
                <Text
                  style={[
                    styles.blackHeader,
                    {paddingHorizontal: 10, marginTop: 10},
                    styles.titleStyle,
                  ]}>
                  {Languages.Description}
                </Text>

                <View style={[{padding: 15}]}>
                  <Text
                    style={{color: 'gray', fontSize: 18, textAlign: 'left'}}
                    numberOfLines={this.state.DescriptionHidden ? 10 : 100}>
                    {Listing.Description}
                  </Text>
                </View>
                {Listing.Description && Listing.Description.length > 100 && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'white',
                      borderTopWidth: 1,
                      borderTopColor: '#eee',
                      paddingVertical: 10,
                    }}
                    onPress={() => {
                      this.setState({
                        DescriptionHidden: !this.state.DescriptionHidden,
                      });
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{color: Color.primary}}>
                        {this.state.DescriptionHidden
                          ? Languages.ShowMore
                          : Languages.ShowLess}
                      </Text>
                      <IconEn
                        name={
                          this.state.DescriptionHidden
                            ? 'chevron-down'
                            : 'chevron-up'
                        }
                        size={20}
                        color={Color.primary}
                        style={{marginLeft: 7}}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View
              style={[
                {
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  gap: 8,
                  paddingVertical: 16,
                  marginBottom: 2,
                },
                styles.BoxShadow,
              ]}>
              <TouchableOpacity
                style={[
                  styles.bottomBox,
                  {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: Color.secondary,
                    borderRadius: 5,
                    shadowColor: Color.secondary,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                  },
                ]}
                onPress={() => {
                  if (this.props.userData) {
                    KS.WatchlistAdd({
                      listingID: this.state.Listing.ID,
                      userid: this.props.userData.ID,
                      type: 1,
                    }).then(data => {
                      if (data && data.Success) {
                        this.setState({Favorite: data.Favorite});
                      }
                    });
                  } else {
                    this.props.navigation.navigate('LoginScreen');
                  }
                }}>
                <IconIon
                  name={this.state.Favorite ? 'heart' : 'heart-outline'}
                  size={25}
                  color={Color.primary}
                />
                <Text
                  style={{
                    color: '#000',
                    fontSize: 15,
                    fontWeight: '600',
                    marginHorizontal: 4,
                  }}>
                  {Languages.AddToFavourites}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.bottomBox,
                  {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: Color.secondary,
                    borderRadius: 5,
                    shadowColor: Color.secondary,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                  },
                ]}
                onPress={() => {
                  if (this.props.userData) {
                    this.reportPopup.open();
                  } else {
                    Alert.alert('', Languages.YouNeedToLoginFirst, [
                      {
                        text: Languages.Ok,
                        onPress: () =>
                          this.props.navigation.navigate('LoginScreen'),
                      },
                      {text: Languages.Cancel},
                    ]);
                  }
                }}>
                <Octicons name="alert" size={20} color="#e44e44" />
                <Text
                  style={{
                    color: '#000',
                    fontSize: 15,
                    fontWeight: '600',
                    marginHorizontal: 4,
                  }}>
                  {Languages.Report}
                </Text>
              </TouchableOpacity>
            </View>
            {Languages.langID == 2 && (
              <AskListingOwner
                Listing={Listing}
                OwnerId={this.state.Owner?.ID}
                UserId={this.props.userData?.ID}
                IsDealer={this.state.Owner?.IsDealer}
                navigateToLogin={() => {
                  this.props.navigation.navigate('LoginScreen');
                }}
              />
            )}
            <View
              style={[
                styles.BoxShadow,
                styles.boxContainer,
                {backgroundColor: '#fff'},
                styles.marginBottom,
              ]}>
              <Text
                style={[
                  styles.blackHeader,
                  {
                    paddingHorizontal: 10,
                    marginTop: 12,
                    marginBottom: 6,
                  },
                  styles.titleStyle,
                ]}>
                {Languages.ShareOffer}
              </Text>

              <TouchableOpacity
                activeOpacity={0.6}
                style={[{padding: 15, flexDirection: 'row'}]}
                onPress={() => {
                  this.onShare();
                }}>
                <View style={styles.socialBox}>
                  <IconEn name={'facebook'} size={28} color={'#3b5998'} />
                </View>
                <View style={styles.socialBox}>
                  <IconFa name={'whatsapp'} size={28} color={'#25d366'} />
                </View>

                <View style={styles.socialBox}>
                  <IconFa name={'twitter-square'} size={28} color={'#1da1f2'} />
                </View>

                <View style={styles.socialBox}>
                  <IconSLI
                    name={'envelope-letter'}
                    size={28}
                    color={Color.primary}
                  />
                </View>

                <View style={styles.socialBox}>
                  <IconMa name={'sms'} size={28} color={'#34b7f1'} />
                </View>
              </TouchableOpacity>
            </View>
            <AutobeebModal
              ref={instance => (this.reportPopup = instance)}
              backButtonClose
              swipeToClose={false}
              animationDuration={350}
              fullScreen={true}
              style={{
                backgroundColor: '#fff',
                width: '100%',
                flex: 1,
              }}
              useNativeDriver={true}
              coverScreen>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={{
                  width: '100%',
                  flex: 1,
                  height: Dimensions.get('screen').height,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop:
                    Platform.OS === 'android'
                      ? StatusBar.currentHeight + 10
                      : isIphoneX()
                      ? 40
                      : 25,
                }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 50}}
                  style={{width: '100%', flex: 1}}>
                  <IconMa
                    name="close"
                    size={32}
                    color="#000"
                    style={{
                      padding: 7,
                      marginHorizontal: 10,
                      alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
                    }}
                    onPress={() => this.reportPopup.close()}
                  />

                  <Text
                    style={{
                      alignSelf: 'center',
                      fontSize: 18,
                      color: '#000',
                      marginBottom: 20,
                      textAlign: 'center',
                    }}>
                    {Languages.WhyReportThisListing}
                  </Text>

                  <View style={{paddingHorizontal: 20, marginVertical: 10}}>
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                      }}>
                      {reportOptions.map((d, i) => (
                        <TouchableOpacity
                          key={i}
                          activeOpacity={0.5}
                          style={{
                            alignItems: 'center',
                            marginVertical: 10,
                            width: Dimensions.get('screen').width / 3.8,
                            height: Dimensions.get('screen').width / 3.8,
                            borderWidth: 2,
                            borderRadius: 5,
                            padding: 5,
                            justifyContent: 'space-evenly',
                            borderColor:
                              reportData.typeId === d.type
                                ? Color.primary
                                : '#555',
                          }}
                          onPress={() => {
                            reportData.typeId = d.type;
                            this.forceUpdate();
                          }}>
                          {d.icon(
                            reportData.typeId === d.type
                              ? Color.primary
                              : '#555',
                          )}
                          <Text
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            style={{
                              color:
                                reportData.typeId === d.type
                                  ? Color.primary
                                  : '#555',
                              fontSize: 14,
                              lineHeight: 20,
                              textAlign: 'center',
                            }}>
                            {Languages[d.title]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: 16,
                        marginTop: 20,
                        marginBottom: 5,
                      }}>
                      {Languages.Comment}
                    </Text>
                    <TextInput
                      placeholder={Languages.WhatToReportThisAd}
                      onChangeText={txt => {
                        reportData.message = txt;
                        this.forceUpdate();
                      }}
                      value={reportData.message}
                      multiline
                      textAlign="left"
                      textAlignVertical="top"
                      style={{
                        width: '100%',
                        borderWidth: this.state.reportDetailError ? 2 : 1,
                        borderColor: this.state.reportDetailError
                          ? '#e22e22'
                          : '#bbb',
                        height: 100,
                        paddingVertical: 0,
                        paddingHorizontal: 7,
                        color: '#000',
                      }}
                    />

                    <ButtonIndex
                      containerStyle={styles.submitButton}
                      onPress={() => {
                        if (
                          reportData.email.trim().length < 6 ||
                          !reportData.email.includes('.') ||
                          !reportData.email.includes('@')
                        ) {
                          reportData.email = 'unknowemail@us.com';
                        }

                        if (reportData.typeId === '') {
                          Alert.alert('', Languages.selectType);
                          return true;
                        } else if (
                          reportData.typeId === 6 &&
                          reportData.message.trim().length < 3
                        ) {
                          this.setState({reportDetailError: true});
                          return true;
                        } else {
                          this.setState({loadingReport: true});
                          reportData.userId = this.props.userData.ID;
                          reportData.listingId = this.state.Listing.ID;

                          KS.ReportListing(reportData).then(data => {
                            if (data && data?.Success == 1) {
                              this.reportPopup?.close?.();
                              Alert.alert('', Languages.ReportedSuccessfully);
                              reportData.typeId = '';
                              reportData.message = '';
                              reportData.email = '';

                              this.setState({reportDetailError: false});
                            }
                            this.setState({loadingReport: false});
                          });
                        }
                      }}
                      text={Languages.Send}
                    />
                  </View>
                </ScrollView>

                {this.state.loadingReport && (
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}>
                    <ActivityIndicator size="large" color={Color.primary} />
                  </View>
                )}
              </KeyboardAvoidingView>
            </AutobeebModal>
            {!!this.props.userData &&
              !!this.state.userCountry &&
              this.state.userCountry.WithFee && (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('PaymentDetailsAutobeeb', {
                        userCountry: this.state.userCountry,
                        user: this.props.userData,
                      });
                    }}>
                    <View style={styles.DetailsPayBox}>
                      <Text style={styles.DetailsPayTitle}>
                        {Languages.DetailsPayToAutobeeb}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            <View
              style={[
                styles.boxContainer,
                styles.BoxShadow,
                {paddingBottom: 8},
                styles.marginBottom,
              ]}>
              <Text
                style={[
                  styles.blackHeader,
                  {
                    paddingHorizontal: 10,
                    marginTop: 10,
                  },
                  styles.titleStyle,
                ]}>
                {Languages.Advices}
              </Text>

              <View
                style={[
                  styles.boxContainer,
                  {
                    flexDirection: 'column',
                    backgroundColor: '#eebc37',
                    padding: 15,
                    marginHorizontal: 10,
                    borderRadius: 5,
                    ...styles.BoxShadow,
                    shadowColor: '#eebc37',
                    maxWidth: '94%',
                  },
                  styles.marginBottom,
                ]}>
                <Text style={{fontSize: 16, fontWeight: '700'}}>
                  - {Languages.Advices1}
                </Text>
                <Text style={{fontSize: 16, fontWeight: '700'}}>
                  - {Languages.Advices2}
                </Text>
                <Text style={{fontSize: 16, fontWeight: '700'}}>
                  - {Languages.Advices3}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.boxContainer,
                styles.BoxShadow,
                styles.marginBottom,
              ]}>
              <Text
                style={[
                  styles.blackHeader,
                  {
                    paddingHorizontal: 10,
                    marginTop: 10,
                  },
                  styles.titleStyle,
                ]}>
                {this.state.Owner && this.state.Owner.IsDealer
                  ? Languages.DealerDetails
                  : Languages.SelllerDetails}
              </Text>

              {this.state.Owner && this.state.Owner.IsDealer ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxWidth: '96%',
                  }}>
                  <DealersBanner
                    item={this.state.Dealer}
                    detailsScreen
                    full
                    navigation={this.props.navigation}
                    mobile={Listing.Phone}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={[{maxWidth: '96%'}]}
                  onPress={() => {
                    this.props.navigation.navigate('UserProfileScreen', {
                      userid: this.state.Owner?.ID,
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      alignItems: 'center',
                      padding: 15,
                    }}>
                    <View style={{position: 'relative'}}>
                      {this.state.Owner && this.state.Owner.ThumbImage ? (
                        <Image
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            marginRight: 5,
                          }}
                          resizeMode={'contain'}
                          source={{
                            uri:
                              'https://autobeeb.com/' +
                              this.state.Owner.FullImagePath +
                              '_400x400.jpg' +
                              '?time=' +
                              this.state.date,
                          }}
                        />
                      ) : (
                        <Image
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            marginRight: 5,
                          }}
                          resizeMode={'contain'}
                          source={require('../images/seller.png')}
                        />
                      )}

                      {isOnline && (
                        <View
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 50,
                            backgroundColor: 'green',
                            position: 'absolute',
                            bottom: -5,
                            end: 0,
                          }}
                        />
                      )}
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <Text
                        numberOfLines={1}
                        style={[
                          {
                            textAlign: 'center',
                            fontSize: 17,
                            color: '#000',
                            lineHeight: 24,
                          },
                          styles.titleStyle,
                        ]}>
                        {Listing.OwnerName}
                      </Text>
                      {this.state.Owner && (
                        <Text
                          style={{
                            lineHeight: 24,
                            fontSize: 14,
                            fontWeight: '600',
                          }}>
                          {Languages.MemberSince +
                            Moment(this.state.Owner.RegistrationDate).format(
                              'YYYY-MM-DD',
                            )}
                        </Text>
                      )}

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <TouchableOpacity
                          style={styles.CallPayer}
                          onPress={() => {
                            if (this.state.ShowPhone) {
                              Linking.openURL(`tel:${Listing.Phone}`);
                            } else {
                              this.setState({ShowPhone: true});
                              KS.UpdateMobileClick({
                                UserId: Listing.OwnerID,
                                ListingId: Listing.ID,
                              });
                            }
                          }}>
                          <IconFa
                            name="phone"
                            size={20}
                            color={Color.secondary}
                          />
                          <Text
                            numberOfLines={1}
                            style={{
                              color: Color.secondary,
                              fontSize: 16,
                              marginHorizontal: 4,
                              overflow: 'hidden',
                            }}>
                            {this.state.ShowPhone
                              ? `\u200E${Listing.Phone}`
                              : `${Listing.Phone}`.replace(/.{4}$/, 'xxxx')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {this.state.Dealer?.LatLng && (
              <View>
                <Text
                  style={[
                    styles.blackHeader,
                    {
                      paddingHorizontal: 10,
                      marginTop: 10,
                    },
                  ]}>
                  {Languages.Address}
                </Text>

                <MapView
                  ref={instance => (this.map = instance)}
                  liteMode
                  region={{
                    latitude: parseFloat(
                      this.state.Dealer?.LatLng.split(',')[0],
                    ),
                    longitude: parseFloat(
                      this.state.Dealer?.LatLng.split(',')[1],
                    ),
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                  }}
                  onPress={() => {
                    this.handleGetDirections({
                      latitude: parseFloat(
                        this.state.Dealer?.LatLng.split(',')[0],
                      ),
                      longitude: parseFloat(
                        this.state.Dealer?.LatLng.split(',')[1],
                      ),
                    });
                  }}
                  // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                  style={{
                    width: '100%',
                    height: 80,
                    backgroundColor: '#fff',
                  }}>
                  {
                    <Marker
                      onPress={() => {
                        this.handleGetDirections({
                          latitude: parseFloat(
                            this.state.Dealer?.LatLng.split(',')[0],
                          ),
                          longitude: parseFloat(
                            this.state.Dealer?.LatLng.split(',')[1],
                          ),
                        });
                      }}
                      coordinate={{
                        latitude: parseFloat(
                          this.state.Dealer?.LatLng.split(',')[0],
                        ),
                        longitude: parseFloat(
                          this.state.Dealer?.LatLng.split(',')[1],
                        ),
                      }}
                    />
                  }
                </MapView>
              </View>
            )}
            <View
              style={{
                marginVertical: 5,
                alignItems: 'center',
                minHeight: 10,

                justifyContent: 'center',
              }}>
              {this.state.AutobeebBanner ? (
                <TouchableOpacity
                  disabled={!this.state.AutobeebBanner.Link}
                  style={{}}
                  onPress={async () => {
                    let url = this.state.AutobeebBanner.Link;
                    if (!url) return;

                    KS.BannerClick({
                      bannerID: this.state.AutobeebBanner.ID,
                    });

                    const {screen, params} = await ExtractScreenObjFromUrl(url);
                    if (!!screen) {
                      this.props.navigation.navigate(
                        screen,
                        !!params && params,
                      );
                    } else {
                      Linking.openURL(url);
                    }
                  }}>
                  <Image
                    resizeMode="contain"
                    source={{
                      uri: `https://autobeeb.com/${this.state.AutobeebBanner.FullImagePath}.png`,
                    }}
                    style={{
                      //  marginVertical: 10,
                      alignSelf: 'center',
                      width: Dimensions.get('window').width * 0.8,
                      height: (Dimensions.get('window').width * 0.8) / 1.8,
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <></>
              )}
            </View>

            {this.state.userCountry &&
              this.state.userCountry.WithFee &&
              !!this.props.user && (
                <View
                  style={[
                    styles.boxContainer,
                    styles.BoxShadow,
                    styles.marginBottom,
                    {
                      paddingVertical: 20,
                    },
                  ]}>
                  <TouchableOpacity
                    //hide
                    style={[
                      styles.bottomBox,
                      {
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: Color.secondary,
                        borderRadius: 5,
                        maxWidth: '90%',
                        alignSelf: 'center',
                        paddingHorizontal: 8,
                      },
                    ]}
                    onPress={() => {
                      this.props.navigation.navigate('PaymentDetailsAutobeeb', {
                        userCountry: this.state.userCountry,
                        user: this.props.user,
                      });
                    }}>
                    <IconMC
                      name="credit-card"
                      size={20}
                      color={Color.secondary}
                    />

                    <Text
                      style={{
                        color: Color.secondary,
                        fontSize: 16,
                        marginHorizontal: 4,
                      }}>
                      {Languages.DetailsPayToAutobeeb}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {this.state.RelatedListings &&
              this.state.RelatedListings.filter(x => x.ThumbURL).length > 0 && (
                <View
                  style={[
                    styles.boxContainer,
                    styles.BoxShadow,
                    styles.marginBottom,
                  ]}>
                  <Text
                    style={[
                      styles.blackHeader,
                      {
                        paddingHorizontal: 10,
                        marginTop: 10,
                      },
                      styles.titleStyle,
                    ]}>
                    {this.state.Owner && this.state.Owner.IsDealer
                      ? //      ? Languages.DealerOffers
                        Languages.RelatedOffers //was dealer offers, i kept the logic in case he want to switch it back again
                      : Languages.RelatedOffers}
                  </Text>

                  <View style={[{paddingVertical: 15}]}>
                    <FlatList
                      numColumns={3}
                      style={{width: '100%'}}
                      keyExtractor={(item, index) => index.toString()}
                      contentContainerStyle={{alignItems: 'center'}}
                      data={this.state.RelatedListings}
                      renderItem={({item, index}) => {
                        return (
                          <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => {
                              this.props.navigation.push('CarDetails', {
                                key: item.ID,
                                item: item,
                              });
                            }}
                            style={{
                              //   flex: 1,
                              width: Dimensions.get('screen').width * 0.32,
                              alignItems: 'center',
                              marginBottom: 2,
                              justifyContent: 'center',
                              marginHorizontal: 2,
                            }}>
                            <View style={{}}>
                              <FastImage
                                style={{
                                  width: Dimensions.get('screen').width * 0.32,
                                  aspectRatio: 1,
                                  borderWidth: 0,
                                  borderRadius: 5,
                                }}
                                resizeMode={'contain'}
                                source={{
                                  uri:
                                    'https://autobeeb.com/' +
                                    item.FullImagePath +
                                    '_400x400.jpg',
                                }}
                              />

                              {!!item.FormatedPrice && false && (
                                <View
                                  style={[
                                    {
                                      backgroundColor: 'rgba(0,0,0,0.4)',
                                      position: 'absolute',
                                      bottom: 0,
                                      borderTopRightRadius: I18nManager.isRTL
                                        ? 0
                                        : 10,
                                      borderBottomLeftRadius: I18nManager.isRTL
                                        ? 0
                                        : 10,
                                      borderTopLeftRadius: I18nManager.isRTL
                                        ? 10
                                        : 0,
                                      borderBottomRightRadius: I18nManager.isRTL
                                        ? 10
                                        : 0,
                                      overflow: 'hidden',
                                    },
                                    I18nManager.isRTL ? {right: 0} : {left: 0},
                                  ]}>
                                  <Text
                                    style={[
                                      {
                                        color: '#fff',
                                        paddingHorizontal: 5,
                                      },
                                    ]}>
                                    {item.FormatedPrice}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                </View>
              )}
            <View
              style={[
                styles.boxContainer,
                styles.BoxShadow,
                {
                  marginBottom: 60,
                },
              ]}>
              <TouchableOpacity
                style={{
                  width: Dimensions.get('screen').width * 0.9,
                  marginVertical: 8,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  elevation: 1,
                  borderRadius: 5,
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
                      fontSize: 22,
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
                      fontSize: 22,
                      fontFamily: 'Cairo-Regular',
                    }}>
                    {Languages.FREE}
                  </Animatable.Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <AutobeebModal
          ref={instance => (this.IsSharePopup = instance)}
          backButtonClose
          swipeToClose={true}
          animationDuration={350}
          style={{
            backgroundColor: '#fffff00',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
          useNativeDriver={true}
          coverScreen>
          <View
            style={{
              backgroundColor: '#fff',
              height: 'auto',
              width: '95%',
              paddingTop: 15,
            }}>
            <TouchableOpacity
              style={{
                alignSelf: 'flex-end',
                marginTop: 10,
                marginHorizontal: 10,
                position: 'absolute',
                end: 1,
                top: -5,
              }}
              onPress={() => {
                this.IsSharePopup.close();
              }}>
              <IconEV name="close" size={25} color={Color.primary} />
            </TouchableOpacity>
            <Text
              style={[
                styles.blackHeader,
                {
                  paddingHorizontal: 10,
                  marginTop: 12,
                  marginBottom: 6,
                  textAlign: 'center',
                },
                styles.titleStyle,
              ]}>
              {countryMessage1.includes(`${this.state.Listing?.CountryID}`)
                ? Languages.DidUNeedShareYourOffer
                : Languages.DidUNeedShareYourOffer2}
            </Text>
            {countryMessage1.includes(`${this.state.Listing?.CountryID}`) ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingVertical: 15,
                }}>
                <Pressable
                  style={{
                    backgroundColor: Color.primary,
                    width: '90%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 5,
                  }}
                  onPress={() => {
                    this.shareOnSocial('facebook');
                    this.IsSharePopup.close();
                  }}>
                  <Text style={{color: '#fff'}}>{Languages.Ok}</Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingVertical: 15,
                  gap: 100,
                }}>
                <Pressable
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 5,
                  }}
                  onPress={() => {
                    this.shareOnSocial('facebook');
                    this.IsSharePopup.close();
                  }}>
                  <IconEn name={'facebook'} size={28} color={'#3b5998'} />
                </Pressable>
                <Pressable
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 5,
                  }}
                  onPress={() => {
                    this.shareOnSocial('twitter');
                    this.IsSharePopup.close();
                  }}>
                  {this.XIconSVG({size: 24, color: 'black'})}
                </Pressable>
              </View>
            )}
          </View>

          {this.state.displyCopyNotify && (
            <View
              style={{
                backgroundColor: 'gray',
                borderRadius: 3,
                paddingHorizontal: 5,
                paddingVertical: 2,
                height: 'auto',
                width: 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{width: '100%', textAlign: 'center', color: '#fff'}}>
                {'Copyed!'}
              </Text>
            </View>
          )}
        </AutobeebModal>

        <Animated.View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 60,
            transform: [{translateY: this.ContactBoxSpace}],
            minHeight: 'auto',
            minWidth: 'auto',
            zIndex: 2000,
          }}>
          <AddAdvButtonSquare navigation={this.props.navigation} />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            transform: [{translateY: this.BottomBarSpace}],
            right: 0,
            bottom: 0,
            zIndex: 2000,
            minHeight: 'auto',
            minWidth: '100%',
          }}>
          <BottomNavigationBar />
        </Animated.View>
      </View>
    );
  }
}

const FacebookIcon = ({size = 24}) => (
  <View
    style={{
      backgroundColor: '#1877F2',
      borderRadius: 2,
      width: 26,
      height: 26,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.66 8.33H15V6.14c-.25-.03-1.11-.11-2.12-.11-2.1 0-3.53 1.28-3.53 3.63v2.02H7.5v2.53h1.85V20h2.53v-5.79h2.08l.33-2.53h-2.41V9.89c0-.73.2-1.22 1.28-1.22Z"
        fill="#FFFFFF"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  CallPayer: {
    borderWidth: 1,
    borderColor: Color.secondary,
    borderRadius: 5,
    flexDirection: 'row',
    borderRightColor: '#fff',
    borderRightWidth: 1,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 10,
    width: '90%',
  },
  marginBottom: {
    marginBottom: 2,
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: '700',
  },
  BoxShadow: {
    shadowColor: Color.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    width: Dimensions.get('screen').width - 10,
    alignSelf: 'center',
    marginHorizontal: 'auto',
  },
  modalBoxWrap: {
    position: 'absolute',
    flex: 1,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  iconZoom: {
    position: 'absolute',
    right: 0,
    top: 100,
    backgroundColor: 'rgba(255,255,255,.9)',
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    zIndex: 9999,
  },
  textClose: {
    color: Color.primary,
    // fontWeight: "600",
    fontFamily: 'Cairo-Bold',
    fontSize: 17,
    margin: 10,
    zIndex: 9999,
  },
  bottomBox: {
    flexDirection: 'row',
    borderRightColor: '#fff',
    borderRightWidth: 1,
    flex: 1,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackHeader: {
    color: '#000',
    fontSize: 18,
    marginBottom: 5,
    fontFamily: 'Cairo-Regular',
    textAlign: 'left',
  },
  boxContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    flex: 1,
    marginVertical: 6,
    borderRightColor: '#eee',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHalf: {
    //  flex: 1
    width: Dimensions.get('screen').width / 2 - 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#eeeeee80',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'left',
    color: '#000',
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'left',
    color: '#283B77',
  },
  featuresRow: {
    borderBottomWidth: 1,
    paddingVertical: 15,
    borderBottomColor: '#eee',
    flexDirection: 'row',
  },

  featuresHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    flex: 1,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    //   paddingBottom: 5,
    //   marginBottom: 5
  },
  featuresText: {
    fontSize: 16,
    color: '#61667B',
  },
  modelModal: {
    zIndex: 550,
    flex: 1,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: Dimensions.get('screen').height,
  },
  modelContainer: {
    borderRadius: 10,
    alignSelf: 'center',
    width: Dimensions.get('screen').width * 0.8,
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 10,
    height: Dimensions.get('screen').height,
  },
  socialBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: Color.primary,
    marginTop: 15,
    borderRadius: 5,
    fontFamily: Constants.fontFamily,
    elevation: 1,
  },
  specialSVG: {
    height: 20,
    textAlignVertical: 'center',
    alignContent: 'center',
  },
  specialSiganlOtherLang: {
    backgroundColor: '#e5e82c',
  },
  specialSiganl: {
    top: 30,
    right: -85,
    position: 'absolute',
    transform: I18nManager.isRTL ? [{rotate: '315deg'}] : [{rotate: '45deg'}],
    textTransform: 'uppercase',
    paddingVertical: 3,
    paddingHorizontal: 0,
    zIndex: 1,
    width: 275,
    backgroundColor: '#ff1c1a',
    letterSpacing: 1,
    backgroundImage: 'radial-gradient(circle, #ff1c1a, #bf0b00)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 0,
  },
  specialSiganlText: {
    color: '#e9ea7b',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#e5e82c',
    paddingVertical: 5,
  },
  specialSiganlTextOtherLang: {
    borderColor: '#ff1c1a',
    gap: 15,
    flexDirection: 'row',
  },
  SellFastTile: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  sellFastBTN: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
    height: 35,
    width: '92%',
    alignSelf: 'center',
  },
  sellFastBTNText: {
    color: Color.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  SellFast: {
    backgroundColor: Color.primary,
    padding: 10,
    gap: 5,
  },
  SellFastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  DetailsPayBox: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    borderRadius: 10,
    width: '95%',
    marginVertical: 5,
    alignSelf: 'center',
  },
  DetailsPayTitle: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  QuestionPoup: {
    borderRadius: 5,
    width: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#7CB9E8',
    color: '#fff',
  },
  Qbox: {flexDirection: 'row', flexWrap: 'wrap', gap: 5},
  AskBox: {
    marginVertical: 10,
  },
  AskListingOwner: {
    color: 'black',
    fontSize: 18,
    marginBottom: 6,
  },
  rowStyle: {},
});

const mapStateToProps = ({user, menu, chat}) => ({
  chat: chat,
  userData: user.user,
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = dispatch => {
  const UserActions = require('../redux/UserRedux');
  const {actions} = require('../redux/RecentListingsRedux');

  return {
    storeUserData: (user, callback) =>
      UserActions.actions.storeUserData(dispatch, user, callback),
    updateRecentlySeenListings: (listing, callback) => {
      actions.updateRecentlySeenListings(dispatch, listing, callback);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CarDetails);
