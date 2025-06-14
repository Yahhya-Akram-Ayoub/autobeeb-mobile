import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  StyleSheet,
  NativeModules,
  Keyboard,
  I18nManager,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import {Color, Constants, Languages} from '../common';
import {toast} from '../Omni';
import IconEn from 'react-native-vector-icons/Entypo';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from 'react-native-popup-menu';
import IconFa from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import DialogBox from 'react-native-dialogbox';
import {requestCameraPermission} from '../ultils/Permission';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {SwearModal} from '../components/Modals';
import KS from '../services/KSAPI';
import {LogoSpinner} from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';
import {screenWidth} from '../autobeeb/constants/Layout';

var ImagePicker = NativeModules.ImageCropPicker;

class ListingReview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currency: global.ViewingCurrency || this.props.ViewingCurrency,
      imagePendingDelete: false,
      images: props.images ?? [],
      imageBasePath: props.imageBasePath ?? null,
      openSwearModal: false,
      swearCountry: '',
      withSwear: false,
      withCommission: false,
      description:
        (props?.route?.params?.Listing || {Description: ''}).Description || '',
      price: (props?.route?.params?.Listing || {Price: ''}).Price
        ? (props?.route?.params?.Listing || {Price: ''}).Price.toString()
        : '',
      title: (props?.route?.params?.Listing || {Name: ''}).Name || '',
      boardNumber: (props?.route?.params?.Listing || {Name: ''}).Name || '',
      paddingBottom: 0,
      mainImageFromGallery: false, // when editing we want to know if the user uploaded any new pics
      hideEmail: false,
    };

    this.imagesEditListRef = React.createRef();
    this.imagesListRef = React.createRef();
    this.scrollviewRef = React.createRef();
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShow = Keyboard.addListener(
        'keyboardWillShow',
        this._keyboardDidShow.bind(this),
      );
      this.keyboardWillHide = Keyboard.addListener(
        'keyboardWillHide',
        this._keyboardDidHide.bind(this),
      );
    } else {
      this.keyboardDidShow = Keyboard.addListener(
        'keyboardDidShow',
        this._keyboardDidShow.bind(this),
      );
      this.keyboardDidHide = Keyboard.addListener(
        'keyboardDidHide',
        this._keyboardDidHide.bind(this),
      );
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.keyboardWillShow?.remove();
      this.keyboardWillHide?.remove();
    } else {
      this.keyboardDidShow?.remove();
      this.keyboardDidHide?.remove();
    }
  }

  _keyboardDidShow() {
    if (Platform.OS == 'ios') {
      setTimeout(() => {
        this.scrollviewRef.scrollToEnd();
      }, 100);
    }
    this.setState({paddingBottom: Platform.select({ios: 0, android: 50})});
  }

  _keyboardDidHide() {
    this.setState({paddingBottom: 0});
  }

  componentDidMount() {
    this.props.FindStep();

    if (!!this.props?.route?.params?.Listing) {
      this.setState({
        editListing: this.props?.route?.params?.Listing,
        //  images: this.props?.route?.params?.Listing?.Images,
      });
    } else if (!!this.props.Listing) {
      this.setState({
        editListing: this.props.Listing,
        // images: this.props.Listing.Images,
      });
    }
    setTimeout(() => {
      this.scrollviewRef.current?.scrollToEnd();
    }, 500);

    let _CountriesData = this.props.CountriesData;
    if (!this.props.CountriesData) {
      KS.CountriesGet({langid: Languages.langID}).then(CountriesData => {
        if (CountriesData && CountriesData.Success == '1') {
          _CountriesData = CountriesData.Countries;
          this.checkSwearCountry(_CountriesData);
        }
      });
    } else {
      this.checkSwearCountry(_CountriesData);
    }

    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: !!this.props?.route?.params?.Listing
        ? this.props?.route?.params?.Listing?.EntryCur
        : global.ViewingCurrency
        ? global.ViewingCurrency.ID
        : '2',
      isocode: !!this.props?.route?.params?.Listing
        ? this.props?.route?.params?.Listing?.ISOCode
        : this.props?.CountryCode ||
          (this.props?.userData && this.props?.userData?.ISOCode),
    })
      .then(result => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));

          this.setState({PrimaryCurrencies: result.Currencies});

          result.Currencies &&
            result.Currencies.forEach(cur => {
              if (cur.ID == global.ViewingCurrency?.ID) {
                this.setState({currency: cur});
              }
            });
          if (!!this.props?.route?.params?.Listing) {
            this.setState({
              currency: result.Currencies.find(
                cur => cur.ID == this.props?.route?.params?.Listing?.EntryCur,
              ),
            });
          }
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
  }

  navigateToOfferScreen(id, isNewUser) {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'App', // this is your bottom tab navigator
            state: {
              routes: [
                {
                  name: 'ActiveOffers', // tab name
                  state: {
                    routes: [
                      {
                        name: 'ActiveOffers',
                        params: {
                          userid: this.props?.userData?.ID,
                          active: !isNewUser,
                        },
                      },
                      {
                        name: 'CarDetails',
                        params: {
                          id: id,
                          showFeatures: true,
                          isNewUser: isNewUser,
                          isNeedRefresh: true,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
    );
  }

  checkSwearCountry(_CountriesData) {
    if (
      !!this.props.userData &&
      !!this.props.userData.Country &&
      !!_CountriesData &&
      !!_CountriesData.length
    ) {
      const _userCountry = _CountriesData.find(
        x => x.ID === this.props.userData.Country,
      );

      if (_userCountry && _userCountry.WithSwear) {
        this.setState({withSwear: _userCountry.WithSwear});
      }
      if (_userCountry && _userCountry.WithFee) {
        this.setState({withCommission: _userCountry.WithFee});
      }
    }

    if (_CountriesData && this.props.CountryCode) {
      let selectedCountry =
        _CountriesData &&
        _CountriesData.find(
          x => x.ISOCode.toLowerCase() == this.props.CountryCode,
        )
          ? _CountriesData.find(
              x => x.ISOCode.toLowerCase() == this.props.CountryCode,
            )
          : null;
      if (!selectedCountry.EmailRegister) {
        this.setState({hideEmail: true});
      }

      if (!!selectedCountry && !!selectedCountry?.WithSwear) {
        this.setState({withSwear: selectedCountry.WithSwear});
      }
      if (!!selectedCountry && !!selectedCountry?.withCommission) {
        this.setState({withCommission: selectedCountry.withCommission});
      }
    }
  }
  showImageOptions() {
    const _this = this;
    this.dialogbox.pop({
      title: Languages.ImageSource,
      btns: [
        {
          text: Languages.camera,

          callback: () => {
            _this.dialogbox.close();
            setTimeout(() => {
              _this.pickSingleWithCamera();
            }, 500);
          },
        },
        {
          text: Languages.Gallery,

          callback: () => {
            _this.dialogbox.close();
            setTimeout(() => {
              _this.pickMultiple();
            }, 500);
          },
        },
      ],
    });
  }

  pickMultiple() {
    let _maxFiles = 15 - (this.state.imagesEdit?.length ?? 0); // add validation for edit
    _maxFiles = _maxFiles < 0 ? 0 : _maxFiles;
    // console.log({_maxFiles});
    const options = {
      mediaType: 'photo',
      multiple: true,
      selectionLimit: _maxFiles,
      maxFiles: _maxFiles,
      includeBase64: true,
      compressImageQuality: 0.7,
    };

    launchImageLibrary(options, res => {
      if (!res || res?.didCancel) return;
      this.setState({image: null});
      var myImages = this.state.images;
      if (!myImages) myImages = [];
      res.assets.map((image, index) => {
        if (
          this.props?.route?.params?.EditOffer &&
          this.state.imagesEdit &&
          this.state.imagesEdit.length > 0
        ) {
          if (myImages.length < _maxFiles) {
            myImages.push({
              uri: image.uri,
              width: image.width,
              height: image.height,
              mime: image.type,
              data: image.base64,
            });
          }
        } else {
          if (myImages.length < _maxFiles) {
            myImages.push({
              uri: image.uri,
              width: image.width,
              height: image.height,
              mime: image.type,
              data: image.base64,
            });
          }
        }
      });

      this.setState({images: myImages}, () => {
        this.setState(prevState => ({
          index: prevState.index + 1,
          isMaxImagesUploaded: myImages.length == _maxFiles,
        }));
      });
    });
  }

  async pickSingleWithCamera() {
    try {
      const IsPermission = await requestCameraPermission();
      if (!IsPermission) {
        return;
      }

      const options = {
        mediaType: 'photo',
        cropping: false,
        width: 500,
        height: 500,
        includeExif: true,
        includeBase64: true,
        compressImageQuality: 0.7,
      };

      launchCamera(options, res => {
        if (!res || res?.didCancel) return;
        const image = res.assets[0];
        this.setState({image: null});
        var myImages = this.state.images;
        if (!myImages) myImages = [];

        if (
          this.props?.route?.params?.EditOffer &&
          this.state.imagesEdit &&
          this.state.imagesEdit.length > 0
        ) {
          if (myImages.length <= 14 - this.state.imagesEdit.length) {
            myImages.push({
              uri: image.uri,
              width: image.width,
              height: image.height,
              mime: image.type,
              data: image.base64,
            });
          }
        } else {
          if (myImages.length <= 14) {
            myImages.push({
              uri: image.uri,
              width: image.width,
              height: image.height,
              mime: image.type,
              data: image.base64,
            });
          }
        }

        this.setState({images: myImages});
      });
    } catch (errorr) {
      console.log({errorr});
    }
  }

  renderImage(image, index) {
    return (
      <View>
        <Image
          style={styles.imageBox}
          source={
            typeof image === 'string'
              ? {
                  uri: `https://autobeeb.com/${this.props.imageBasePath}${image}_400x400.jpg`,
                }
              : image
          }
        />
        {index === 0 && (
          <IconFa
            name="home"
            size={20}
            color={Color.primary}
            style={styles.mainImageIcon}
          />
        )}
      </View>
    );
  }

  renderRow = (value, step, singleEdit) => {
    return (
      <View style={[styles.rowContainer]}>
        <TouchableOpacity
          style={[styles.ValueButton]}
          onPress={() => {
            // if (isSubCat) {
            //   this.props.isSubCat(true);
            // } else {
            //   this.props.isSubCat(false);
            // }
            if (step == 6 && !this.props.data.makeID) {
              Alert.alert('', Languages.ChooseMakeFirst);
            } else if (step == 2) {
              this.props.goToStep(1);
            } else if (!value || step == 16 || singleEdit) {
              this.props.goToStep(step, true);
            } else {
              this.props.goToStep(step);
            }
          }}
          disabled={
            this.props.userData &&
            this.props.userData?.EmailRegister &&
            this.props.userData?.EmailConfirmed &&
            this.props.userData?.EmailApproved &&
            step == 16
          }>
          <Text
            style={[
              styles.headerText,
              step == 16 && {
                color: Color.secondary,
              },
            ]}>
            {step == 15 &&
            this.props.data.sellType == 1 &&
            this.props.data.listingType == 4
              ? Languages.WorkingHours
              : Languages.stepHeader[step]}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={styles.ValueText}>{value}</Text>
            {step != 16 && (
              <IconEn
                name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
                size={18}
                color={Color.secondary}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderPrice = () => {
    return (
      <View style={[styles.rowContainer, {marginTop: 10}]}>
        <Text style={{textAlign: 'left', color: '#383737'}}>
          {Languages.Price}
        </Text>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}>
          <TextInput
            placeholderTextColor={'#38373770'}
            style={[
              {
                // flex: 4,
                fontSize: Constants.smallFont,
                fontFamily: 'Cairo-Regular',
                textAlign: I18nManager.isRTL ? 'right' : 'left',
                color: '#383737',
                width: 'auto',
                minWidth: '25%',
              },
            ]}
            placeholder={Languages.EnterPrice}
            maxLength={8}
            onChangeText={this.props.onChangePrice}
            value={this.props.price}
            keyboardType="numeric"
          />
          {
            <Menu
              onSelect={value => this.setState({currency: value})}
              customStyles={{
                paddingHorizontal: 5,
                borderLeftWidth: 1,
              }}>
              <MenuTrigger customStyles={{}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{fontSize: 14, color: 'blue'}}>
                    {this.state.currency?.Name}
                  </Text>
                  <IconEn
                    name="triangle-down"
                    size={15}
                    color={'#000'}
                    style={{}}
                  />
                </View>
              </MenuTrigger>

              <MenuOptions customStyles={{}}>
                {this.state.PrimaryCurrencies &&
                  this.state.PrimaryCurrencies.map(currency => {
                    return (
                      <MenuOption value={currency} customStyles={{}}>
                        <Text
                          style={[
                            {
                              fontSize: 15,
                              color:
                                this.state.currency.ID == currency.ID
                                  ? 'blue'
                                  : '#383737',
                            },
                          ]}>
                          {currency.Name}
                        </Text>
                      </MenuOption>
                    );
                  })}
              </MenuOptions>
            </Menu>
          }
        </View>
      </View>
    );
  };

  renderTitle = () => {
    return (
      <View
        style={[
          styles.rowContainer,
          {
            marginTop: 3,
          },
        ]}>
        <Text
          style={{
            textAlign: 'left',
            color:
              this.props.title && this.props.title.length > 0
                ? 'green'
                : 'crimson',
            fontFamily:
              this.props.title && this.props.title.length > 0
                ? 'Cairo-Regular'
                : 'Cairo-Bold',
          }}>
          {Languages.Title}
        </Text>
        <View>
          <TextInput
            style={{
              //  height: 50,
              flex: 1,
              fontSize: Constants.smallFont,
              fontFamily: 'Cairo-Regular',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
              color: '#383737',
            }}
            maxLength={70}
            placeholder={Languages.EnterTitle}
            placeholderTextColor={'#38373770'}
            onChangeText={this.props.onChangeTitle}
            value={this.props.title}
          />
        </View>
      </View>
    );
  };
  renderPartNumber = () => {
    const {data} = this.props;

    return (
      <View
        style={[
          styles.rowContainer,
          {
            marginTop: 3,
          },
        ]}>
        <Text
          style={{
            textAlign: 'left',
            color:
              (data.sellType && data.sellType == 4) ||
              (data.condition && data.condition.ID != 1)
                ? 'black'
                : this.props.partNumber && this.props.partNumber.length >= 3
                ? 'green'
                : 'crimson',
            fontFamily:
              (data.sellType && data.sellType == 4) ||
              (data.condition && data.condition.ID != 1)
                ? 'Cairo-Regular'
                : this.props.partNumber && this.props.partNumber.length >= 3
                ? 'Cairo-Regular'
                : 'Cairo-Bold',
          }}>
          {Languages.PartNumber}
        </Text>
        <View>
          <TextInput
            style={{
              //  height: 50,
              width: Dimensions.get('screen').width,
              fontSize: Constants.smallFont,
              fontFamily: 'Cairo-Regular',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
              color: '#383737',
            }}
            maxLength={20}
            placeholder={Languages.EnterPartNumber}
            placeholderTextColor={'#38373770'}
            onChangeText={this.props.onChangePartNumber}
            value={this.props.partNumber}
          />
        </View>
      </View>
    );
  };

  renderBoardNumber = () => {
    return (
      <View
        style={[
          styles.rowContainer,
          {
            marginTop: 3,
          },
        ]}>
        <Text
          style={{
            textAlign: 'left',
            color:
              this.props.boardNumber && this.props.boardNumber.length > 0
                ? 'green'
                : 'crimson',
            fontFamily:
              this.props.boardNumber && this.props.boardNumber.length > 0
                ? 'Cairo-Regular'
                : 'Cairo-Bold',
          }}>
          {Languages.BoardNumber}
        </Text>
        <TextInput
          style={{
            //  height: 50,
            width: Dimensions.get('screen').width,
            fontSize: Constants.smallFont,

            fontFamily: 'Cairo-Regular',
            textAlign: I18nManager.isRTL ? 'right' : 'left',
          }}
          placeholder={Languages.EnterBoardNumber}
          onChangeText={this.props.onChangeBoard}
          value={this.props.boardNumber}
        />
      </View>
    );
  };

  renderDescription = () => {
    return (
      <View
        style={[styles.rowContainer, {marginTop: 3}]}
        // pointerEvents="none"
      >
        <Text style={{textAlign: 'left'}}>{Languages.Description}</Text>
        <TextInput
          nestedScrollEnabled
          contextMenuHidden={false}
          style={{
            //  height: 50,
            width: Dimensions.get('screen').width * 0.85,
            backgroundColor: '#f2f2f2',
            elevation: 1,
            borderWidth: 0,
            borderRadius: 10,
            alignSelf: 'center',
            marginTop: 10,
            padding: 5,
            //   flex: 1,
            fontSize: Constants.smallFont,
            fontFamily: 'Cairo-Regular',
            textAlign: I18nManager.isRTL ? 'right' : 'left',
            height: 120,
          }}
          numberOfLines={5}
          multiline
          placeholder={Languages.EnterDescription}
          placeholderTextColor={'#383737'}
          onChangeText={text => {
            this.scrollviewRef.current?.scrollToEnd({animated: true});
            this.props.onChangeDesc(text);
          }}
          value={this.props.description}
        />
      </View>

      //   <TouchableOpacity
      //     style={{}}
      //     onPress={() => {
      //       if (this.refs.description) {

      //         this.refs.description.focus();
      //       }
      //     }}
      //   >
      // </TouchableOpacity>
    );
  };

  renderImagePicker = () => {
    return (
      <View
        style={{
          backgroundColor: 'white',
          paddingTop: 10,
          paddingLeft: 10,
          marginTop: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            this.props.goToStep(Steps.Images, true);
          }}>
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              fontSize: 18,
              paddingHorizontal: 2,
              color: '#383737',
            }}>
            {Languages.addPhotos}
          </Text>
        </TouchableOpacity>
        {this.state.images?.length > 0 ? (
          <FlatList
            ref={ins => (this.imagesListRef = ins)}
            keyExtractor={(item, index) => index.toString()}
            extraData={this.state.images}
            data={this.state.images}
            horizontal
            inverted={Platform.OS == 'ios' && I18nManager.isRTL}
            contentContainerStyle={{
              flexGrow: 1,
            }}
            renderItem={({item, index}) => {
              return (
                <View
                  key={index}
                  style={{
                    marginHorizontal: 3,
                    overflow: 'visible',
                    paddingVertical: 18,
                    paddingHorizontal: 5,
                  }}>
                  {this.renderImage(item, index)}
                </View>
              );
            }}
          />
        ) : (
          <TouchableOpacity
            onPress={() => {
              this.props.goToStep(Steps.Images, true);
            }}
            style={styles.addBox}>
            <IconFa
              name="file-image-o"
              size={40}
              color={Color.primary}
              style={{marginVertical: 5}}
            />
            <IconFa
              name="plus"
              size={20}
              color={Color.primary}
              style={styles.AbsulatePlus}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  cleanupImage(image) {
    this.setState({images: this.state.images.filter(x => x !== image)});
    ImagePicker.cleanSingle(image ? image.uri : null);
  }

  convertToNumber(number) {
    if (number) {
      if (!number) return '';

      const arabicToEnglishMap = {
        '٠': '0',
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
        '٫': '.',
        '،': '.',
        ',': '.',
      };

      const result = number
        .toString()
        .split('')
        .map(char => arabicToEnglishMap[char] ?? char)
        .join('');

      console.log({number, result});

      return result;
    } else return '';
  }

  PublishOffer() {
    const {
      listingType,
      sellType,
      makeID,
      modelID,
      selectedYear,
      categoryID,
      condition,
      gearBox,
      fuelType,
      colorID,
      paymentMethod,
      phone,
      userName,
      mileage,
      cityID,
      price,
      sectionID,
      rentPeriod,
      description,
      subCategoryID,
      email,
    } = this.props.data;
    Keyboard.dismiss();

    let deviceID = DeviceInfo.getUniqueId();
    this.setState({disablePublish: true, openSwearModal: false});
    this.props.DoAddListing(
      {
        ownerID: (this.props.userData && this.props.userData?.ID) || undefined,
        TypeID: listingType,
        sellType,
        makeID,
        modelID,
        year: selectedYear,
        categoryID: subCategoryID ? subCategoryID : categoryID,
        rentPeriod: rentPeriod?.ID,
        phone,
        userName,
        cityID,
        description: this.props.description,
        title: this.convertToNumber(this.props.title),
        price: this.props.price,
        condition: condition?.ID,
        gearBox: gearBox?.ID,
        fuelType: fuelType?.ID,
        colorID,
        paymentMethod: paymentMethod?.ID,
        consumption: this.convertToNumber(mileage),
        sectionID,
        boardNumber: this.convertToNumber(this.props.boardNumber),
        partNumber: this.convertToNumber(this.props.partNumber),
        otpconfirmed:
          (this.props.userData && this.props.userData?.OTPConfirmed) || false,
        langID: Languages.langID,
        deviceID: deviceID,
        isoCode:
          this.props.CountryCode ||
          (this.props.userData && this.props.userData?.ISOCode),
        currency: this.state.currency ? this.state.currency.ID : '2',
        ID: this.props.data.ID || '',
        email: this.state.hideEmail ? '' : email,
        mainimage: this.props.data.ID ? this.state.images[0] : '',
      },
      this.state.images,
      data => {
        if (!this.props.data.ID) {
          AsyncStorage.getItem('ItemNeedSharePoup', async (error, _item) => {
            AsyncStorage.setItem(
              'ItemNeedSharePoup',
              `${_item ?? ''}${data.ID},`,
            );
          });
        }

        this.setState({disablePublish: false});
        if (data.Success === 1) {
          KS.ListingInitInfo({listingID: data.ID, langid: Languages.langID});
          if (data.User) {
            this.props.storeUserData(data.User);
          }
          if (!data.IsUserActive) {
            this.props.navigation.navigate('HomeScreen');
            toast(Languages.AccountBlocked, 3500);
          } else {
            const isNewUser =
              !(this.props.userData && this.props.userData?.ID) ||
              (data.EmailRegister && !data.EmailConfirmed) ||
              (data.OTPConfirmed === false && !data.EmailRegister);

              if (isNewUser) {
              this.props.storeUserData({ID: data.UserID}, () => {
                setTimeout(() => {
                  this.navigateToOfferScreen(data.ID, isNewUser);
                }, 500);
              });
            } else {
              toast(Languages.PublishSuccess, 3500);
              this.navigateToOfferScreen(data.ID, false);
            }
          }
        } else {
          toast(data.Message);
        }
        this.setState({isLoading: false});
      },
    );
  }

  openSwearModal() {
    this.setState({openSwearModal: true}, () => {
      setTimeout(() => {
        this.setState({openSwearModal: false});
      }, 1000);
    });
  }

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

  render() {
    const {data} = this.props;
    const {stepArray} = this.props.data.navObject;
    if (this.props.EditOfferLoading) {
      return <Text style={{}}>{'Something went wrong while editing '}</Text>;
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', android: ''})}
        style={{flex: 1}}>
        <MenuProvider>
          <View style={{flex: 1}}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="never"
              ref={this.scrollviewRef}
              style={{backgroundColor: '#eee'}}
              contentContainerStyle={{
                // flex: 1,
                paddingBottom: this.state.paddingBottom,
              }}>
              {this.renderRow(
                data.listingTypeLabel + ' ' + data.sellTypeLabel,
                2,
              )}
              {stepArray.includes(3) && this.renderRow(data.sectionLabel, 3)}
              {stepArray.includes(4) &&
                this.renderRow(
                  data.subCategoryLabel
                    ? data.categoryLabel + ', ' + data.subCategoryLabel
                    : data.categoryLabel,
                  4,
                  //      data.subCategoryLabel ? false : true
                  true,
                  //      data.subCategoryLabel ? true : false
                )}
              {stepArray.includes(5) && this.renderRow(data.makeLabel, 5, true)}
              {stepArray.includes(6) &&
                this.renderRow(data.modelLabel, 6, true)}
              {stepArray.includes(7) &&
                this.renderRow(data.selectedYear, 7, true)}
              {stepArray.includes(9) &&
                this.renderRow(data.fuelType.Name, 9, true)}
              {stepArray.includes(10) &&
                this.renderRow(data.condition && data.condition.Name, 10, true)}
              {stepArray.includes(11) &&
                this.renderRow(data.gearBox.Name, 11, true)}
              {stepArray.includes(12) &&
                this.renderRow(data.paymentMethod.Name, 12, true)}
              {stepArray.includes(13) &&
                this.renderRow(data.rentPeriod.Name, 13, true)}
              {stepArray.includes(14) &&
                this.renderRow(data.colorLabel, 14, true)}
              {stepArray.includes(15) && this.renderRow(data.mileage, 15, true)}
              {
                stepArray.includes(16) &&
                  !!data.userName &&
                  this.renderRow(data.userName, 17, true) //16 and 17 on purpose because it's switched at the last step
              }
              {stepArray.includes(8) && this.renderRow(data.cityLabel, 8, true)}
              {!this.state.hideEmail &&
                !!data.email &&
                !this.props.userData?.EmailConfirmed &&
                stepArray.includes(20) &&
                this.renderRow(data.email, 20, true)}
              {this.renderRow(data.phone, 16)}
              {/* {this.props.EditOffer && this.renderEditImages()} */}
              {this.renderImagePicker()}
              {this.renderPrice()}
              {data.listingType == 32 &&
                !(data.listingType == 32 && data.sectionID == 4096) &&
                this.renderTitle()}
              {data.listingType == 32 &&
                data.sectionID < 2048 &&
                this.renderPartNumber()}
              {data.listingType == 32 &&
                data.sectionID == 4096 &&
                this.renderBoardNumber()}
              {this.renderDescription()}
              {!this.props.userData && (
                <TouchableOpacity
                  style={{backgroundColor: 'white', paddingVertical: 5}}
                  onPress={() => {
                    this.props.navigation.navigate('PrivacyPolicy');
                    // this.setModalVisible(true);
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Cairo-Regular',
                      textAlign: 'center',
                      fontSize: 12,
                      paddingHorizontal: 30,
                      color: '#383737',
                    }}>
                    {Languages.ByPostingAd}
                    <Text style={{color: Color.primary, fontSize: 12}}>
                      {Languages.Terms}
                    </Text>
                    {Languages.AndPrivacy}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            {this.state.isLoading && <LogoSpinner fullStretch={true} />}

            <TouchableOpacity
              disabled={this.state.disablePublish}
              style={[
                {
                  width: Dimensions.get('screen').width,
                  backgroundColor:
                    (data.listingType == 32 &&
                      data.sectionID != 4096 &&
                      !this.props.title) ||
                    (data.listingType == 32 &&
                      data.sectionID == 4096 &&
                      !this.props.boardNumber) ||
                    (data.condition &&
                      data.condition.ID == 1 &&
                      data.sellType &&
                      data.sellType != 4 &&
                      data.listingType == 32 &&
                      data.sectionID < 2048 &&
                      (!this.props.partNumber ||
                        this.props.partNumber.length < 3))
                      ? 'crimson'
                      : 'green',
                  paddingVertical: 12,
                },
                this.state.disablePublish && {backgroundColor: 'gray'},
              ]}
              onPress={() => {
                if (
                  data.listingType == 32 &&
                  data.sectionID != 4096 &&
                  !this.props.title
                ) {
                  Alert.alert('', Languages.PleaseEnterTitle);
                } else if (
                  data.listingType == 32 &&
                  data.sectionID == 4096 &&
                  !this.props.boardNumber
                ) {
                  Alert.alert('', Languages.PleaseEnterBoardNumber);
                } else if (
                  data.condition &&
                  data.condition.ID == 1 &&
                  data.sellType &&
                  data.sellType != 4 &&
                  data.listingType == 32 &&
                  data.sectionID < 2048 &&
                  (!this.props.partNumber || this.props.partNumber.length < 3)
                ) {
                  Alert.alert('', Languages.EnterPartNumber);
                } else {
                  if (this.state.withSwear || this.state.withCommission) {
                    this.openSwearModal();
                  } else {
                    this.setState({isLoading: true}, () => {
                      this.PublishOffer();
                    });
                  }
                }
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: Constants.mediumFont,
                }}>
                {Languages.PublishOffer}
              </Text>
            </TouchableOpacity>
          </View>

          <DialogBox
            ref={dialogbox => {
              this.dialogbox = dialogbox;
            }}
          />
        </MenuProvider>

        <SwearModal
          ApproveFunc={() => {
            this.setState({isLoading: true}, () => {
              this.PublishOffer();
            });
          }}
          Open={this.state.openSwearModal}
          IsSwear={this.state.withSwear}
          IsCommission={this.state.withCommission}
          Lang={Languages.langID}
          Curr={this.state.currency.ID}
          Country={
            !!this.props?.route?.params?.Listing
              ? this.props?.route?.params?.Listing?.ISOCode
              : this.props?.CountryCode ||
                (this.props?.userData && this.props?.userData?.ISOCode)
          }
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: Constants.smallFont,
    color: 'black',
  },
  rowContainer: {
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 7,
  },
  ValueButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderWidth: 1,
    //  borderRadius: 5,
    //  borderColor: "green",
    //  paddingVertical: 5,
    //   paddingHorizontal: 10,
    marginVertical: 3,
  },
  ValueText: {
    fontSize: Constants.smallFont,
    color: '#aaa',
  },
  addBox: {
    width: screenWidth / 4,
    height: screenWidth / 4,
    borderWidth: 1,
    borderColor: Color.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 8,
  },
  AbsulatePlus: {
    position: 'absolute',
    top: 12,
    right: 5,
  },
  mainImageIcon: {position: 'absolute', top: 3, start: 3},
});

const mapStateToProps = ({user, menu}) => ({
  userData: user.user,
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/AddRedux');
  const UserActions = require('../redux/UserRedux');

  return {
    DoAddListing: (data, images, callback) => {
      actions.DoAddListing(dispatch, data, images, callback);
    },
    storeUserData: (user, callback) =>
      UserActions.actions.storeUserData(dispatch, user, callback),
  };
};
const Steps = Object.freeze({
  Type: 1,
  SellType: 2,
  Section: 3,
  Category: 4,
  Make: 5,
  Model: 6,
  Year: 7,
  City: 8,
  FuelType: 9,
  Condition: 10,
  GearBox: 11,
  PaymentMethod: 12,
  RentPeriod: 13,
  Color: 14,
  Mileage: 15,
  Phone: 16,
  UserName: 17,
  Review: 18,
  SubCategory: 19,
  Email: 20,
  Images: 21,
});

export default connect(mapStateToProps, mapDispatchToProps)(ListingReview);
