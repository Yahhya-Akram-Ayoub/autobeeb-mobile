import React, {Component} from 'react';
import ReactNative, {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  I18nManager,
  Dimensions,
  Alert,
  Platform,
  KeyboardAvoidingView,
  UIManager,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import {Color, Languages} from '../common';
import {LogoSpinner, OTPModal, ImagePopUp, LocationSelect} from '../components';
import {getAllCountries} from 'react-native-country-picker-modal-kensoftware';
import CountryPicker from 'react-native-country-picker-modal-kensoftware';
import {NewHeader} from '../containers';
import KS from '../services/KSAPI';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import PhoneInput from 'react-native-phone-input';
import DeviceInfo from 'react-native-device-info';
import {toast} from '../Omni';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';
import MapView, {Marker} from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageCropPicker from 'react-native-image-crop-picker';

class DealerSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      countryPickerVisible: false,
      currency: this.props.ViewingCountry && this.props.ViewingCountry.currency,
      ClassificationsLoading: true,
      CompetencesLoading: true,
      selectedCompetence: [],
      selectedCountry: null,
      hideMobile: false,
      passwordHidden: true,
      email: (this.props.user && this.props.user?.Email) || '',
      mobile: (this.props.user && this.props.user?.Phone) || '',
      cca2: (this.props.user && this.props.user?.ISOCode) || '',
      phoneNotEdited: true,
      CompanyName: (this.props.user && this.props.user?.Name) || '',
      PostalCode: 'dummy',
      StreetName: 'dummy',
      BillingFirstName: 'dummy',
      BillingLastName: 'dummy',
      paidPlans: false,
      HasImage: true,
      HasBanner: true,
      addTime: true,
      profilePic:
        this.props.user && this.props.user?.ID
          ? 'http://autobeeb.com' +
            '/content/users/' +
            props.user.ID +
            '/' +
            props.user.ID +
            '_400x400.jpg'
          : undefined,

      imageRefreshCount: 5,
      date: new Date(),
      bannerPic:
        this.props.user && this.props.user?.ID
          ? 'http://autobeeb.com' +
            '/content/dealers/' +
            props.user.ID +
            '/' +
            props.user.ID +
            '_1024x653.jpg'
          : undefined,
    };
  }

  fetchAndSelectCountry = async () => {
    try {
      const allCountries = await getAllCountries();
      const userCountry = allCountries.find(
        country => country.cca2 === this.props.user?.ISOCode,
      );
      this.selectCountry(userCountry);
    } catch (error) {
      console.error('Error fetching countries or selecting country:', error);
    }
  };
  extractLocalNumber = inputNumber => {
    if (!inputNumber) return inputNumber;
    const {selectedCountry} = this.state;
    const callingCodes = selectedCountry.callingCode || [];
    const mainCallingCode = callingCodes[0]; // take the first one (usually only one)

    // Clean input (remove all non-digits)
    let cleanedNumber = inputNumber.replace(/[^\d]/g, '');

    // Remove any existing calling code from the number
    for (let code of callingCodes) {
      if (cleanedNumber.startsWith(`00${code}`)) {
        cleanedNumber = cleanedNumber.slice(`00${code}`.length);
        break;
      } else if (cleanedNumber.startsWith(code)) {
        cleanedNumber = cleanedNumber.slice(code.length);
        break;
      }
    }

    // Remove leading 0 if exists (e.g., 0799914777 → 799914777)
    if (cleanedNumber.startsWith('0')) {
      cleanedNumber = cleanedNumber.slice(1);
    }

    // Return the final formatted number
    return `+${mainCallingCode}${cleanedNumber}`;
  };

  componentDidMount() {
    if (this.props.user && this.props.user?.ISOCode) {
      this.fetchAndSelectCountry();
    }

    KS.CountriesGet({langid: Languages.langID}).then(CountriesData => {
      if (CountriesData && CountriesData.Success == '1') {
        this.setState({CountriesData: CountriesData.Countries}, () => {
          if (this.props.user && this.props.user?.ISOCode) {
            this.checkEmailCountry({cca2: this.props.user?.ISOCode});
          }
        });
      }
    });

    this.fetchDearData();

    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 6,
    }).then(data => {
      if (data?.Banners && data?.Banners.length > 0) {
        this.setState(
          {BannerImage: data.Banners[data.Banners.length - 1]},
          () => {
            setTimeout(() => {
              this.setState({openImagePopUp: true});
            }, 1000);
          },
        );
      }
    });

    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        this.setState({cca2: data});
      }
    });
    KS.CompetencesGet({
      langid: Languages.langID,
    }).then(data => {
      if (data && data.Success == 1) {
        let newArr = data.Competences.filter(x => x.ID != 32 && x.ID <= 2048);
        this.setState({
          Competences: newArr,
          CompetencesLoading: false,
        });
      }
    });
    KS.ClassificationsGet({
      langid: Languages.langID,
    }).then(data => {
      if (data && data.Success == 1) {
        // var newArr = data.Classifications.map(function(val, index) {
        //   return { label: val.Name, value: val.ID };
        // });

        this.setState({
          Classifications: data.Classifications,
          ClassificationsLoading: false,
        });
      }
    });
  }

  fetchDearData() {
    if (this.props.user && this.props.user?.IsDealer) {
      KS.DealerGet({
        userID: this.props.user?.ID,
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success) {
          this.setState(
            {
              selectedClassification: [data.Dealer.ClassificationID],
              selectedCompetence: data.Dealer.Competence.split(',').map(val =>
                parseInt(val),
              ),
              selectedMakes: data.Dealer.Makes
                ? data.Dealer.Makes.split(',').map(val => parseInt(val))
                : undefined,
              selectedCity: this.props.user?.City.split(',').map(val =>
                parseInt(val),
              ),
              vat: data.Dealer.Vat,
              Phone: this.extractLocalNumber(data.Dealer.Phone),
              PhoneRenderKey: data.Dealer.Phone,
              aboutCo: data.Dealer.About,
              Address: data.Dealer.Address,
              hideMobile: data.Dealer.HideMobile,
              userLocation:
                data.Dealer?.LatLng && data.Dealer?.LatLng != null
                  ? {
                      latitude:
                        data.Dealer?.LatLng && data.Dealer?.LatLng != null
                          ? parseFloat(data.Dealer.LatLng.split(',')[0])
                          : '',
                      longitude:
                        data.Dealer?.LatLng && data.Dealer?.LatLng != null
                          ? parseFloat(data.Dealer.LatLng.split(',')[1])
                          : '',
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.0121,
                    }
                  : null,
            },
            () => {
              KS.MakesMulitpleTypesGet({
                langid: Languages.langID,
                sumIDs: this.state.selectedCompetence.reduce(
                  (a, b) => a + b,
                  0,
                ),
              }).then(data => {
                if (data && data.Success) {
                  this.setState({Makes: data.Makes});
                }
              });
            },
          );
        }
      });
    }
  }

  convertToNumber(number) {
    if (number) {
      number = number + '';
      return number
        .replace(/٠/g, '0')
        .replace(/،/g, '.')
        .replace(/٫/g, '.')
        .replace(/,/g, '.')
        .replace(/١/g, '1')
        .replace(/٢/g, '2')
        .replace(/٣/g, '3')
        .replace(/٤/g, '4')
        .replace(/٥/g, '5')
        .replace(/٦/g, '6')
        .replace(/٧/g, '7')
        .replace(/٨/g, '8')
        .replace(/٩/g, '9');
    } else return '';
  }
  validateEmail(email) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }
  checkEmailCountry(country) {
    let countries = this.state.CountriesData;
    let iso2 = country.cca2;
    if (!countries) {
      return;
    }

    let selectedCountry =
      countries &&
      countries?.find(x => x?.ISOCode?.toLowerCase() == iso2?.toLowerCase())
        ? countries.find(x => x?.ISOCode?.toLowerCase() == iso2?.toLowerCase())
        : null;

    if (selectedCountry?.EmailRegister) {
      this.setState({isEmailRegisterCountry: true});
    } else {
      this.setState({isEmailRegisterCountry: false});
    }
  }

  selectCountry(country) {
    this.setState({
      selectedCountry: country,
      selectedCity: undefined,
      paidPlans: this.state.CountriesData
        ? this.state.CountriesData.find(
            x => x.ISOCode.toLowerCase() == country.cca2.toLowerCase(),
          ).PaidPlans
        : false,
    });

    if (!this.state.CountriesData) {
      setTimeout(() => {
        this.setState({
          paidPlans: this.state.CountriesData
            ? this.state.CountriesData.find(
                x => x?.ISOCode.toLowerCase() == country?.cca2?.toLowerCase(),
              )?.PaidPlans
            : false,
        });
      }, 500);
    }
    if (this.refs.phone) {
      this.refs.phone.selectCountry(country.cca2.toLowerCase(), () => {
        this.forceUpdate();
      });
    }
    if (this.refs.TellPhone) {
      this.refs.TellPhone.selectCountry(country.cca2.toLowerCase(), () => {
        this.forceUpdate();
      });
    }
    this.checkEmailCountry(country);

    KS.CitiesGet({
      langID: Languages.langID,
      isoCode: country.cca2,
    }).then(data => {
      if (data) {
        this.setState({
          cities: data,
        });
      }
    });
  }

  checkOTP() {
    const _this = this;
    const otp = this.state.otp;
    if (this.state.dealerData.ConfirmAndUpdate) {
      KS.ConfirmOTPAndUpdate({
        otpcode: otp,
        isocode: this.refs.phone && this.refs.phone.getISOCode(),
        userid: this.props.user?.ID,
        username:
          (this.state.dealerData.NewPhone || !this.props.user?.OTPConfirmed) &&
          !this.props.user.EmailRegister
            ? (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone
            : (this.state.dealerData && this.state.dealerData.NewEmail) ||
              !this.props.user?.EmailConfirmed
            ? this.state.email
            : (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone,
      }).then(data => {
        if (data.OTPVerify) {
          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              _this.props.navigation.goBack();
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
    } else {
      KS.UserVerifyOTP({
        otpcode: otp,
        userid: this.props.user?.ID,
        username:
          (this.state.dealerData.NewPhone || !this.props.user?.OTPConfirmed) &&
          !this.props.user.EmailRegister
            ? (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone
            : (this.state.dealerData && this.state.dealerData.NewEmail) ||
              !this.props.user?.EmailConfirmed
            ? this.state.email
            : (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone,
      }).then(data => {
        // console.log(data);
        //   alert(JSON.stringify(data));
        if (data.OTPVerified == true || data.EmailConfirmed == true) {
          // if (data.User) {
          //   _this.props.storeUserData(data.User, () => {
          //     _this.props.navigation.goBack();
          //   });
          // }

          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              KS.PlansGet({
                langid: Languages.langID,
                isocode: this.state.selectedCountry.cca2,
              }).then(PlansData => {
                if (PlansData?.Plans?.length > 0) {
                  // khattab
                  // _this.props.navigation.replace('SubscriptionsScreen', {
                  //   ISOCode: data.User.ISOCode,
                  //   User: data.User,
                  //   Plans: PlansData.Plans,
                  // });
                } else {
                  _this.props.navigation.goBack();
                }
              });
            });

            //
          }
        } else {
          toast(Languages.WrongOTP);

          setTimeout(() => {
            this.setState({otp: ''});
          }, 1800);
        }
      });
    }
  }
  resendCode() {
    this.setState({otp: ''});
    KS.ResendOTP({
      userID: this.props.user?.ID,
      username:
        (this.state.dealerData.NewPhone || !this.props.user?.OTPConfirmed) &&
        !this.props.user.EmailRegister
          ? (this.refs.phone && this.refs.phone.getValue()) ||
            this.props.user?.Phone
          : (this.state.dealerData && this.state.dealerData.NewEmail) ||
            !this.props.user?.EmailConfirmed
          ? this.state.email
          : (this.refs.phone && this.refs.phone.getValue()) ||
            this.props.user?.Phone,
    }).then(data => {
      if (data.Success == 1) {
        //     alert(JSON.stringify(data));
      } else {
        alert('something went wrong');
      }
      //
    });
  }

  checkEmailOTP() {
    const _this = this;
    const otp = this.state.otp;
    {
      KS.UserVerifyOTP({
        otpcode: otp,
        userid: this.props.user?.ID,
        username: this.state.email,
      }).then(data => {
        if (data.EmailConfirmed == true) {
          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              this.setState({otp: '', openEmailVerifyModal: false});
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
  }
  resendEmailCode() {
    this.setState({otp: ''});
    KS.ResendOTP({
      otpType: 2, //email

      userID: this.props.user?.ID,
      username: this.state.email,
    }).then(data => {
      if (data.Success == 1) {
        //     alert(JSON.stringify(data));
      } else {
        alert('something went wrong');
      }
      //
    });
  }

  pickSingleBase64(mode, banner) {
    // console.log("pickingimageyz " + banner);
    if (mode === 'camera') {
      ImageCropPicker.openCamera({
        mediaType: 'photo',
        multiple: false,
        waitAnimationEnd: false,
        cropping: !banner,
        includeExif: true,
        includeBase64: true,
        width: 300,
        height: 300,
      })
        .then(image => {
          this.setState(
            {
              HasImage: banner ? this.state.HasImage : true,
              HasBanner: banner ? true : this.state.HasBanner,
              profilePic: !banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.profilePic,
              bannerPic: banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.bannerPic,
              addTime: false,
            },
            () => {
              KS.UploadImage({
                userid: this.props.user?.ID,
                fileextension: image.mime.split('/')[1],
                banner: banner,
                base64: image.data,
              }).then(data => {
                if (data && data.Success) {
                  this.setState({date: new Date()});
                  this.props.storeUserData(data.User);
                } else {
                  alert(Languages.SomethingWentWrong);
                }
              });
            },
          );
        })
        .catch(e => {
          if (e.code === 'E_PERMISSION_MISSING') {
            alert(e);
          }
        });
    } else {
      ImageCropPicker.openPicker({
        mediaType: 'photo',
        width: 300,
        height: 300,
        cropping: !banner,
        includeBase64: true,
        includeExif: true,
      })
        .then(image => {
          this.setState(
            {
              HasImage: banner ? this.state.HasImage : true,
              HasBanner: banner ? true : this.state.HasBanner,
              profilePic: !banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.profilePic,
              bannerPic: banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.bannerPic,
              addTime: false,
            },
            () => {
              KS.UploadImage({
                userid: this.props.user?.ID,
                fileextension: image.mime.split('/')[1],
                banner: banner,
                base64: image.data,
              }).then(data => {
                if (data && data.Success) {
                  this.setState({date: new Date()});

                  this.props.storeUserData(data.User);
                } else {
                  alert(Languages.SomethingWentWrong);
                }
              });
            },
          );
        })
        .catch(e => {
          if (e.code === 'E_PERMISSION_MISSING') {
            alert(e);
          }
        });
    }
  }
  validateInputs() {
    if (!this.state.CompanyName || this.state.CompanyName.length < 3) {
      toast(Languages.EnterCompanyName);
    } else if (
      !this.state.selectedClassification ||
      !this.state.selectedClassification?.length
    ) {
      toast(Languages.SelectWorkClassifications);
    } else if (
      !this.state.selectedCompetence ||
      !this.state.selectedCompetence?.length
    ) {
      toast(Languages.PleaseSelectWorkType);
    } else if (!this.state.selectedMakes || !this.state.selectedMakes?.length) {
      toast(Languages.SelectMakesYoureWorkingWith);
    } else if (!this.state.selectedCountry) {
      toast(Languages.SelectYourCountry);
    } else if (!this.state.selectedCity) {
      toast(Languages.SelectCity);
    } else if (
      (this.state.email &&
        this.state.email.length > 0 &&
        !this.state.isEmailRegisterCountry &&
        !this.validateEmail(this.state.email)) ||
      (this.state.isEmailRegisterCountry &&
        !this.validateEmail(this.state.email))
    ) {
      toast(Languages.InvalidEmail);
    } else if (!(this.refs.phone && this.refs.phone.isValidNumber())) {
      toast(Languages.InvalidNumber);
    } else if (this.state.password && this.state.password.length < 6) {
      toast(Languages.passwordTooShort);
    } else {
      toast(Languages.FillRedBoxes);
    }
  }
  render() {
    const _this = this;
    if (this.state.ClassificationsLoading || this.state.CompetencesLoading) {
      return (
        <View style={{flex: 1}}>
          <LogoSpinner fullStretch={true} />
        </View>
      );
    }
    return (
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', android: ''})}
        contentContainerStyle={{flex: 1}}
        style={{flex: 1}}>
        <ImagePopUp
          Banner={this.state.BannerImage}
          isOpen={this.state.openImagePopUp}
        />

        <NewHeader navigation={this.props.navigation} back />
        <Modal
          ref={instance => (this.locationModal = instance)}
          //  isOpen
          backButtonClose
          coverScreen={Platform.OS == 'android'}
          swipeToClose={false}
          style={{
            backgroundColor: 'transparent',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.8,
              width: Dimensions.get('screen').width * 0.95,
              // height: Dimensions.get('screen').height,
              // width: Dimensions.get('screen').width,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <LocationSelect
              onLocationConfirm={data => {
                this.setState({
                  userLocation: data,
                  Latitude: data.latitude,
                  Longitude: data.longitude,
                });
              }}
              onClose={data => {
                this.photoModal.close();
              }}
              initialRegion={{
                latitude: 40.697,
                longitude: -74.259,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            />
          </View>
        </Modal>
        <Modal
          style={[styles.modalbox]}
          ref={instance => (this.PasswordModal = instance)}
          swipeToClose={true}
          backButtonClose>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{Languages.ChangePassword}</Text>
            <TextInput
              placeholder={Languages.newPassword}
              style={styles.modalTextinput}
              onChangeText={newPassword => this.setState({newPassword})}
              value={this.state.newPassword}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
                justifyContent: 'space-between',
                alignSelf: 'flex-end',
              }}>
              <TouchableOpacity
                style={styles.CancelButton}
                onPress={() => {
                  this.setState({
                    newPassword: '',
                  });
                  this.PasswordModal.close();
                }}>
                <Text style={{color: 'grey', textAlign: 'center'}}>
                  {Languages.Cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ChangeButton]}
                onPress={() => {
                  const _this = this;
                  if (this.state.newPassword.length >= 6) {
                    KS.ChangePassword({
                      userid: this.props.user?.ID,
                      langid: Languages.langID,

                      password: this.state.newPassword,
                    }).then(data => {
                      if (data.Success == 1) {
                        this.PasswordModal.close();
                      } else {
                        toast(Languages.SomethingWentWrong, 2500);
                      }
                    });
                  } else {
                    toast(Languages.invalidInfo, 2500);
                  }
                }}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  {Languages.Change}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <OTPModal
          isOpen={this.state.openOTPModal}
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterToVerifyAccount}
          Username={
            (this.state.dealerData &&
              this.state.dealerData.NewPhone &&
              !this.props.user?.EmailRegister) ||
            (this.props.user &&
              !this.props.user?.OTPConfirmed &&
              !this.props.user?.EmailRegister)
              ? (this.refs.phone && this.refs.phone.getValue()) ||
                this.props.user?.Phone
              : (this.state.dealerData && this.state.dealerData.NewEmail) ||
                (this.props.user && !this.props.user?.EmailConfirmed)
              ? this.state.email
              : (this.refs.phone && this.refs.phone.getValue()) ||
                (this.props.user && this.props.user?.Phone)
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
          // onClosed={() => {
          //   this.props.navigation.dispatch(
          //     StackActions.reset({
          //       index: 0,
          //       key: null,
          //       actions: [NavigationActions.navigate({routeName: 'App'})],
          //     }),
          //   );
          //   //     this.props.navigation.replace("HomeScreen");
          // }}
          resendCode={() => {
            this.resendCode();
          }}
        />

        <OTPModal
          isOpen={this.state.openEmailVerifyModal}
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterToVerifyAccount}
          Username={this.state.email}
          ignoreResend
          otp={this.state.otp}
          onChange={otp => {
            this.setState({otp});
          }}
          checkOTP={() => {
            this.checkEmailOTP();
          }}
          toast={msg => {
            toast(msg);
          }}
          resendCode={() => {
            this.resendEmailCode();
          }}
        />

        <Modal
          ref={instance => (this.photoModal = instance)}
          position="top"
          //   coverScreen
          style={{
            backgroundColor: 'transparent',
            //flex: 1,
            justifyContent: 'center',
          }}
          backButtonClose={true}
          backdropPressToClose={true}
          swipeToClose={true}>
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: '#FFF',
              padding: 0,
              borderRadius: 5,
              width: Dimensions.get('screen').width * 0.5,
            }}>
            <TouchableOpacity
              style={{position: 'absolute', top: 5, right: 5, zIndex: 15}}
              onPress={() => {
                this.photoModal.close();
              }}>
              <IconMC name="close" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                margin: 10,
              }}
              onPress={() => {
                this.pickSingleBase64('camera', this.state.bannerUploading);
                this.photoModal.close();
              }}>
              <Text style={styles.modalTextStyle}>{Languages.camera}</Text>
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: 'rgba(0,0,0,0.2)',
                borderBottomWidth: 1,
              }}
            />
            <TouchableOpacity
              style={{margin: 10}}
              onPress={() => {
                this.pickSingleBase64('gallery', this.state.bannerUploading);
                this.photoModal.close();
              }}>
              <Text style={styles.modalTextStyle}>{Languages.Gallery}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <ScrollView
          // ref={instance => (this.scrollViewRef = instance)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={[{flex: 1, backgroundColor: '#F3F3F3'}]}
          contentContainerStyle={{paddingBottom: 40}}>
          <View
            style={{
              alignItems: 'flex-start',
              paddingHorizontal: 10,
              position: 'absolute',
              top: -100,
            }}>
            {this.state.cca2 && (
              <CountryPicker
                visible={this.state.countryPickerVisible}
                filterPlaceholder={Languages.Search}
                hideAlphabetFilter
                ref={ref => {
                  this.countryPicker = ref;
                }}
                onChange={value => {
                  this.selectCountry(value);
                  this.setState({
                    countryPickerVisible: false,
                  });
                }}
                filterable
                autoFocusFilter={false}
                closeable
                transparent
                translation={Languages.translation}
                cca2={this.state.cca2}
              />
            )}
          </View>
          {!!this.props.route.params?.Edit && (
            <TouchableOpacity
              onPress={() => {
                this.setState({bannerUploading: true});
                this.photoModal.open();
              }}
              style={{
                //   width: Dimensions.get("screen").width,
                backgroundColor: 'white',
                justifyContent: 'flex-end',
                marginBottom: 20,
                // height: Dimensions.get("screen").width / 1.77
                //       justifyContent: "center",
                // paddingVertical: 15
                //      alignItems: "center"
              }}>
              <View style={{}}>
                {!this.state.HasBanner && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      position: 'absolute',
                      top: 10,
                      right: 5,
                      justifyContent: 'flex-end',
                    }}>
                    <Text style={{zIndex: 50, textAlign: 'left'}}>
                      {Languages.facilityPhoto}
                    </Text>
                    <Image
                      style={{
                        resizeMode: 'contain',
                        width: 26,
                        height: 26,
                        zIndex: 50,
                      }}
                      source={require('../images/icons/profileCamera.png')}
                    />
                  </View>
                )}

                {this.state.HasBanner ? (
                  <Image
                    style={{
                      width: Dimensions.get('screen').width,
                      height: Dimensions.get('screen').width / 1.77,
                      resizeMode: 'cover',
                    }}
                    source={{
                      uri:
                        this.state.bannerPic +
                        (this.state.addTime ? '?time=' + this.state.date : ''),
                      cache: 'force-cache',
                      priority: 'low',
                    }}
                    onError={e => {
                      this.setState({
                        HasBanner: false,
                        addTime: false,
                      });
                    }}
                  />
                ) : (
                  <Image
                    style={{
                      height: Dimensions.get('screen').width / 1.77,
                      alignSelf: 'center',
                    }}
                    resizeMode="contain"
                    source={require('../images/Oldplaceholder.png')}
                  />
                )}
              </View>

              <View
                style={{
                  alignSelf: 'flex-start',
                  position: 'absolute',
                  bottom: 0,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({bannerUploading: false});
                    this.photoModal.open();
                  }}
                  style={{
                    position: 'relative',
                    top: 15,
                    left: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {!this.state.HasImage && (
                    <Image
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        resizeMode: 'contain',
                        width: 26,
                        height: 26,
                        zIndex: 50,
                      }}
                      source={require('../images/icons/profileCamera.png')}
                    />
                  )}
                  <View
                    style={{
                      backgroundColor: '#D6D6D6',
                      width: 90,
                      height: 90,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 60,
                    }}>
                    {this.state.HasImage ? (
                      <Image
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 60,
                        }}
                        source={{
                          uri:
                            this.state.profilePic +
                            (this.state.addTime
                              ? '?time=' + this.state.date
                              : ''),
                          cache: 'force-cache',
                          priority: 'low',
                        }}
                        onError={e => {
                          this.setState({
                            HasImage: false,
                            addTime: false,
                          });
                        }}
                      />
                    ) : (
                      <Icon style={{}} size={70} name="user" color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.inputWrap}>
            {this.props.route.params?.Edit == 0 && (
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  color: '#f00',
                  textAlign: 'center',
                }}>
                {Languages.EnterDealerInfo}
              </Text>
            )}

            <Text style={styles.header}>{Languages.CompanyName}</Text>
            <TextInput
              placeholder={Languages.EnterCompanyName}
              placeholderTextColor={'#38373770'}
              style={[
                styles.Textinput,
                this.state.CompanyName && this.state.CompanyName.length >= 3
                  ? {
                      borderBottomColor: 'green',
                      borderBottomWidth: 1,
                    }
                  : {
                      borderBottomColor: 'red',
                      borderBottomWidth: 1,
                    },
              ]}
              onChangeText={CompanyName => this.setState({CompanyName})}
              value={this.state.CompanyName}
            />
          </View>

          {this.state.Classifications &&
            this.state.Classifications.length > 0 && (
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.Classification}</Text>
                <SectionedMultiSelect
                  items={this.state.Classifications}
                  single
                  selectedText={Languages.Selected}
                  uniqueKey="ID"
                  colors={{
                    primary: Color.primary,
                  }}
                  displayKey="Name"
                  searchPlaceholderText={Languages.Search}
                  styles={{
                    selectToggle: {
                      borderBottomWidth: 1,
                      marginBottom: 5,
                      borderBottomColor:
                        this.state.selectedClassification &&
                        this.state.selectedClassification.length > 0
                          ? 'green'
                          : 'red',
                    },
                    selectToggleText: {
                      color:
                        this.state.selectedClassification &&
                        this.state.selectedClassification.length > 0
                          ? '#000'
                          : '#C7C7CD',
                      textAlign: 'left',

                      paddingVertical: 5,
                    },
                    item: {
                      height: 60,
                      borderBottomWidth: 1,
                      //   backgroundColor: "red",
                      borderBottomColor: '#eee',
                    },
                    searchTextInput: {
                      fontFamily: 'Cairo-Regular',
                    },
                  }}
                  itemFontFamily="Cairo-Regular"
                  confirmFontFamily="Cairo-Regular"
                  selectText={Languages.SelectWorkClassifications}
                  onSelectedItemsChange={selectedClassification => {
                    console.log({dd: this.state.selectedClassification});
                    this.setState({selectedClassification});
                  }}
                  modalWithSafeAreaView
                  confirmText={Languages.Confirm}
                  selectedItems={this.state.selectedClassification}
                  hideConfirm
                />
              </View>
            )}

          {this.state.Competences && (
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.CompetenceOfCompany}</Text>
              <View>
                <SectionedMultiSelect
                  ref={instance => (this.CompetenceMultiSelect = instance)}
                  selectedText={Languages.Selected}
                  items={this.state.Competences}
                  uniqueKey="ID"
                  colors={{
                    primary: Color.primary,
                  }}
                  displayKey="Name"
                  // alwaysShowSelectText={true}
                  //   showCancelButton
                  styles={{
                    selectToggle: {
                      borderBottomWidth: 1,
                      marginBottom: 5,
                      borderBottomColor:
                        this.state.selectedCompetence &&
                        this.state.selectedCompetence.length > 0
                          ? 'green'
                          : 'red',
                    },
                    selectToggleText: {
                      paddingVertical: 5,
                      textAlign: 'left',
                    },
                    item: {
                      borderBottomWidth: 1,
                      //   backgroundColor: "red",
                      borderBottomColor: '#eee',
                    },
                  }}
                  hideSearch
                  itemFontFamily="Cairo-Regular"
                  confirmFontFamily="Cairo-Regular"
                  //   showRemoveAll={true}
                  selectText={Languages.PleaseSelectWorkType}
                  //  showDropDowns={true}
                  //   readOnlyHeadings={true}
                  onSelectedItemsChange={selectedCompetence => {
                    //    let arrSum = arr => arr.reduce((a, b) => a + b, 0);
                    if (selectedCompetence.length <= 2) {
                      KS.MakesMulitpleTypesGet({
                        langid: Languages.langID,
                        sumIDs: selectedCompetence.reduce((a, b) => a + b, 0),
                      }).then(data => {
                        if (data && data.Success) {
                          this.setState({Makes: data.Makes});
                        }
                      });
                      this.setState({selectedCompetence, selectedMakes: ''});
                    } else {
                      Alert.alert('', Languages.max2Selections);
                    }
                  }}
                  modalWithSafeAreaView
                  confirmText={Languages.Confirm}
                  selectedItems={this.state.selectedCompetence}
                  hideConfirm
                  stickyFooterComponent={() => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'flex-end',
                          alignItems: 'center',
                          borderTopColor: '#ccc',
                          borderTopWidth: 1,
                          borderBottomLeftRadius: 5,
                          borderBottomRightRadius: 5,

                          justifyContent: 'center',
                          backgroundColor: '#fff',
                        }}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: Color.secondary,
                          }}
                          onPress={() => {
                            this.CompetenceMultiSelect._submitSelection();
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              paddingVertical: 10,
                              fontSize: 15,
                            }}>
                            {Languages.Confirm}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              </View>
            </View>
          )}
          {this.state.selectedCompetence &&
            this.state.selectedCompetence.length > 0 && (
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.Makes}</Text>
                <SectionedMultiSelect
                  ref={instance => (this.MakesMultiSelect = instance)}
                  selectedText={Languages.Selected}
                  items={this.state.Makes}
                  uniqueKey="ID"
                  colors={{
                    primary: Color.primary,
                  }}
                  displayKey="Name"
                  searchPlaceholderText={Languages.SearchMakes}
                  styles={{
                    selectToggle: {
                      borderBottomWidth: 1,
                      marginBottom: 5,
                      borderBottomColor:
                        this.state.selectedMakes &&
                        this.state.selectedMakes.length > 0
                          ? 'green'
                          : 'red',
                    },
                    selectToggleText: {
                      paddingVertical: 5,
                      textAlign: 'left',
                    },
                    item: {
                      borderBottomWidth: 1,
                      //   backgroundColor: "red",
                      borderBottomColor: '#eee',
                    },
                    searchTextInput: {
                      fontFamily: 'Cairo-Regular',
                    },
                  }}
                  itemFontFamily="Cairo-Regular"
                  confirmFontFamily="Cairo-Regular"
                  selectText={Languages.SelectMakesYoureWorkingWith}
                  onSelectedItemsChange={selectedMakes => {
                    if (selectedMakes.length <= 20) {
                      this.setState({selectedMakes});
                    } else {
                      Alert.alert('', Languages.max20Selection);
                    }
                  }}
                  modalWithSafeAreaView
                  confirmText={Languages.Confirm}
                  selectedItems={this.state.selectedMakes}
                  hideConfirm
                  stickyFooterComponent={() => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'flex-end',
                          alignItems: 'center',
                          borderTopColor: '#ccc',
                          borderTopWidth: 1,
                          //      padding: 8,
                          borderBottomLeftRadius: 5,
                          borderBottomRightRadius: 5,

                          justifyContent: 'center',
                          backgroundColor: '#fff',
                        }}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: Color.secondary,
                            // borderRadius: 5
                          }}
                          onPress={() => {
                            this.MakesMultiSelect._submitSelection();
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              paddingVertical: 10,
                              fontSize: 15,
                            }}>
                            {Languages.Confirm}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              </View>
            )}

          <View style={styles.inputWrap}>
            <Text style={styles.header}>{Languages.Vat}</Text>
            <TextInput
              placeholderTextColor="#C7C7CD"
              placeholder={Languages.EnterVat}
              style={[styles.Textinput]}
              onChangeText={vat =>
                this.setState({vat: this.convertToNumber(vat)})
              }
              value={this.state.vat}
            />
          </View>

          <View
            style={styles.inputWrap}
            ref={ins => (this.descriptionParentRef = ins)}>
            <Text style={styles.header}>{Languages.AboutCompany}</Text>
            <TextInput
              placeholderTextColor="#C7C7CD"
              placeholder={Languages.EnterCompanyDescription}
              numberOfLines={5}
              multiline
              style={[styles.Textinput]}
              onChangeText={aboutCo => this.setState({aboutCo})}
              value={this.state.aboutCo}
              onFocus={() => {
                const handle = ReactNative.findNodeHandle(
                  this.descriptionParentRef,
                );
                UIManager.measureLayoutRelativeToParent(
                  handle,
                  e => {
                    console.error(e);
                  },
                  (x, y, w, h) => {
                    this.scrollViewRef.scrollTo({
                      x: 0,
                      y: y,
                      animated: true,
                    });
                  },
                );
              }}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.header}>{Languages.Country}</Text>

            <TouchableOpacity
              disabled={
                (this.props.user && this.props.user?.OTPConfirmed) ||
                (this.state.isEmailRegisterCountry &&
                  !!this.props.user?.Phone &&
                  !!this.props.user?.EmailConfirmed)
              }
              onPress={() => {
                this.countryPicker.openModal();
                // this.refs.countryPicker.openPicker();
                this.setState({
                  countryPickerVisible: true,
                });
              }}>
              {!!this.state.selectedCountry ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: !!this.state.selectedCountry
                      ? 'green'
                      : 'red',
                  }}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 1,
                        color: 'black',
                        paddingBottom: 5,
                      },
                    ]}>
                    {!!this?.state?.selectedCountry?.name[
                      Languages?.translation
                    ]
                      ? this?.state?.selectedCountry?.name[
                          Languages.translation
                        ]
                      : this.state?.selectedCountry?.name}
                  </Text>
                  <Image
                    style={{width: 50, height: 30, marginHorizontal: 10}}
                    resizeMode={'contain'}
                    source={{
                      uri:
                        'https://autobeeb.com/wsImages/flags/' +
                        this.state.selectedCountry.cca2 +
                        '.png',
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: !!this.state.selectedCountry
                      ? 'green'
                      : 'red',
                  }}>
                  <Text
                    style={[
                      styles.text,
                      {
                        paddingBottom: 5,
                        borderBottomWidth: Platform.OS === 'android' ? 0 : 1,
                        borderBottomColor: !!this.state.selectedCountry
                          ? 'green'
                          : 'red',
                      },
                    ]}>
                    {Languages.SelectYourCountry}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',

                justifyContent: 'space-between',
              }}>
              <Text style={styles.header}>{Languages.Email}</Text>

              {!!(this.props.user && this.props.user?.Email) && (
                <View style={{}}>
                  <Text
                    style={{
                      marginBottom: 2,
                      color:
                        this.props.user?.EmailConfirmed ||
                        !this.props.user?.Email
                          ? 'green'
                          : 'red',
                    }}>
                    {this.props.user?.EmailConfirmed
                      ? Languages.Verified
                      : Languages.Unverified}
                  </Text>
                  {this.props.user?.EmailConfirmed == false && (
                    <TouchableOpacity
                      style={{}}
                      onPress={() => {
                        this.setState({openEmailVerifyModal: true});
                      }}>
                      <Text style={{}}>{Languages.VerifyNow}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <TextInput
              placeholderTextColor="#C7C7CD"
              placeholder={Languages.EnterYourEmailOptional}
              style={[
                styles.Textinput,
                this.state.isEmailRegisterCountry && {
                  borderBottomWidth: 1,
                  borderBottomColor: 'red',
                },
                this.validateEmail(this.state.email) && {
                  borderBottomColor: 'green',
                  borderBottomWidth: 1,
                },
              ]}
              onChangeText={email => this.setState({email: email.trim()})}
              value={this.state.email}
            />
          </View>

          {this.state.selectedCountry && (
            <View style={styles.inputWrap}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.header}>{Languages.Mobile} </Text>
                {this.props.user && !this.state.isEmailRegisterCountry && (
                  <Text
                    style={{
                      marginBottom: 5,
                      color: this.props.user?.OTPConfirmed ? 'green' : 'red',
                    }}>
                    {this.props.user?.OTPConfirmed
                      ? Languages.Verified
                      : Languages.Unverified}
                  </Text>
                )}
              </View>
              <PhoneInput
                ref="phone"
                initialCountry={this.state.selectedCountry?.cca2?.toLowerCase()}
                onPressFlag={() => {
                  // this.countryPicker.openModal();
                }}
                allowZeroAfterCountryCode={false}
                textProps={{maxLength: 16}}
                textStyle={{
                  height: 50,
                  color: '#000',
                }}
                style={{
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                  paddingBottom: 5,
                  height: 50,
                  borderBottomWidth: 1,
                  borderBottomColor:
                    (this.refs.phone && this.refs.phone.isValidNumber()) ||
                    (this.props.route.params?.BecomeADealer &&
                      this.state.mobile &&
                      this.state.mobile.length > 0 &&
                      this.state.phoneNotEdited)
                      ? 'green'
                      : 'red',
                }}
                hitSlop={{top: 40, left: 40, bottom: 40, right: 40}}
                flagStyle={{
                  resizeMode: 'contain',
                  borderRadius: 25,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                }}
                initialValue={this.state.mobile}
                value={this.state.mobile}
                onChangePhoneNumber={mobile => {
                  this.setState({mobile, phoneNotEdited: false});

                  if (
                    this.refs.phone.getISOCode() !=
                    this.state.selectedCountry.cca2.toLowerCase()
                  ) {
                    this.setState({mobile: ''});
                    this.refs.phone.selectCountry(
                      this.state.selectedCountry.cca2.toLowerCase(),
                    );
                  }
                }}
              />
              {!!this.state.Phone?.length &&
                !!this.refs.TellPhone?.isValidNumber() && (
                  <TouchableOpacity
                    disabled={
                      !this.state.Phone ||
                      !this.state.Phone.length ||
                      !this.refs.TellPhone?.isValidNumber()
                    }
                    onPress={() => {
                      this.setState({hideMobile: !this.state.hideMobile});
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <IconMC
                      name={
                        this.state.hideMobile
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'
                      }
                      style={{marginRight: 10}}
                      size={20}
                      color={'#000'}
                    />
                    <Text style={{}}>{Languages.HideMobile}</Text>
                  </TouchableOpacity>
                )}
            </View>
          )}
          {this.state.selectedCountry && (
            <View style={styles.inputWrap}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.header}>{Languages.Phone2}</Text>
                {(!this.state.Phone?.length ||
                  (!!this.state.Phone?.length &&
                    !this.refs.TellPhone?.isValidNumber())) && (
                  <Text style={{fontSize: 10}}>
                    {' ' + Languages.EnterYourPhoneOptional}
                  </Text>
                )}
              </View>
              <PhoneInput
                ref="TellPhone"
                key={`${this.state.selectedCountry?.cca2}-${this.state.PhoneRenderKey}`}
                placeholder={Languages.EnterYourPhoneOptional}
                initialCountry={this.state.selectedCountry?.cca2?.toLowerCase()}
                onPressFlag={() => {
                  // console.log({
                  //   phone: this.state.Phone,
                  // });
                }}
                allowZeroAfterCountryCode={false}
                textProps={{maxLength: 16}}
                textStyle={{
                  height: 50,
                  color: '#000',
                }}
                style={{
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                  paddingBottom: 5,
                  height: 50,
                  borderBottomWidth: 1,
                  // borderBottomColor:
                  //   this.state.Phone !=
                  //     `+${this.state.selectedCountry.callingCode[0] ?? ''}` &&
                  //   !!this.state.Phone?.length &&
                  //   !this.refs.TellPhone?.isValidNumber()
                  //     ? 'red'
                  //     : 'green',
                }}
                hitSlop={{top: 40, left: 40, bottom: 40, right: 40}}
                flagStyle={{
                  resizeMode: 'contain',
                  borderRadius: 25,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                }}
                initialValue={this.state.Phone}
                value={this.state.Phone}
                onChangePhoneNumber={Phone => {
                  this.setState({Phone});

                  if (
                    this.refs.TellPhone.getISOCode() !=
                    this.state.selectedCountry.cca2.toLowerCase()
                  ) {
                    this.setState({Phone: ''});
                    this.refs.TellPhone.selectCountry(
                      this.state.selectedCountry.cca2.toLowerCase(),
                    );
                  }
                }}
              />
            </View>
          )}
          {this.state.cities && this.state.cities.length > 0 && (
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.City}</Text>
              <SectionedMultiSelect
                selectedText={Languages.Selected}
                items={this.state.cities}
                single
                uniqueKey="ID"
                colors={{
                  primary: Color.primary,
                }}
                displayKey="Name"
                searchPlaceholderText={Languages.Search}
                styles={{
                  selectToggle: {
                    borderBottomWidth: 1,
                    marginBottom: 5,
                    borderBottomColor:
                      this.state.selectedCity &&
                      this.state.selectedCity.length > 0
                        ? 'green'
                        : 'red',
                  },
                  selectToggleText: {
                    color:
                      this.state.selectedCity &&
                      this.state.selectedCity.length > 0
                        ? '#000'
                        : '#C7C7CD',
                    textAlign: 'left',
                    paddingVertical: 5,
                  },
                  item: {
                    height: 60,
                    borderBottomWidth: 1,
                    //   backgroundColor: "red",
                    borderBottomColor: '#eee',
                  },
                  searchTextInput: {
                    fontFamily: 'Cairo-Regular',
                  },
                }}
                itemFontFamily="Cairo-Regular"
                confirmFontFamily="Cairo-Regular"
                //   showRemoveAll={true}
                selectText={Languages.SelectCity}
                //  showDropDowns={true}
                //   readOnlyHeadings={true}
                onSelectedItemsChange={selectedCity => {
                  //    let arrSum = arr => arr.reduce((a, b) => a + b, 0);

                  this.setState({selectedCity});
                }}
                modalWithSafeAreaView
                // cancelIconComponent={
                //   <Text style={{ color: "white" }}>Cancel</Text>
                // }

                confirmText={Languages.Confirm}
                selectedItems={this.state.selectedCity}
                hideConfirm
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <Text style={styles.header}>{Languages.Address}</Text>
              {this.state.userLocation && (
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.setState({userLocation: undefined});
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{color: 'crimson'}}>{Languages.Delete}</Text>
                    <IconMC
                      name="close-circle"
                      color={'crimson'}
                      size={20}
                      style={{
                        marginHorizontal: 3,
                      }}></IconMC>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {this.state.userLocation ? (
              <MapView
                ref={instance => (this.map = instance)}
                liteMode
                region={this.state.userLocation}
                // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={{
                  width: '95%',
                  height: 80,
                  marginLeft: 10,
                  backgroundColor: '#fff',
                }}
                onPress={region => {
                  this.photoModal.open();
                  Keyboard.dismiss();
                }}>
                {this.state.userLocation && (
                  <Marker coordinate={this.state.userLocation} />
                )}
              </MapView>
            ) : (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => {
                  this.photoModal.open();
                  Keyboard.dismiss();
                }}>
                <Text style={[styles.Textinput, {paddingHorizontal: 0}]}>
                  {Languages.EnterAddress}
                </Text>
                <IconMC name="map-marker-circle" size={30} />
              </TouchableOpacity>
            )}
          </View>

          {!this.props.route.params?.BecomeADealer &&
            !this.props.route.params?.Edit && (
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.Password}</Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <TextInput
                    placeholderTextColor="#C7C7CD"
                    placeholder={Languages.EnterPassword}
                    onFocus={data => {
                      setTimeout(data => {
                        this.scrollViewRef.scrollToEnd();
                      }, 500);
                    }}
                    style={[
                      styles.Textinput,
                      {
                        flex: 1,
                        textAlign: I18nManager.isRTL ? 'right' : 'left',
                        borderBottomWidth: 1,
                        borderBottomColor:
                          this.state.password && this.state.password.length >= 6
                            ? 'green'
                            : 'red',
                      },
                    ]}
                    secureTextEntry={this.state.passwordHidden}
                    onChangeText={password => this.setState({password})}
                    value={this.state.password}
                  />
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      this.setState({
                        passwordHidden: !this.state.passwordHidden,
                      });
                    }}>
                    <IconMC
                      name={this.state.passwordHidden ? 'eye' : 'eye-off'}
                      //  style={{ marginRight: 10 }}
                      size={20}
                      color={'#000'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {this.props.route.params?.Edit && (
            <TouchableOpacity
              style={{}}
              onPress={() => {
                this.PasswordModal.open();
              }}>
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.ChangePassword}</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{}}
            onPress={() => {
              this.props.navigation.navigate('PrivacyPolicy');
            }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: Dimensions.get('screen').width,
                alignItems: 'center',
                padding: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  fontSize: 16,

                  textAlign: 'justify',
                }}>
                {Languages.dealerTerms}
                <Text
                  style={{
                    color: 'blue',
                    fontSize: 16,
                    fontFamily: 'Cairo-Regular',
                  }}>
                  {Languages.TermsAndCondition}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Cairo-Regular',
                    fontSize: 16,

                    textAlign: 'justify',
                  }}>
                  {Languages.ofAutobeeb}
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={this.state.disableSignUp}
            style={[
              {
                backgroundColor: Color.primary,
                borderRadius: 5,
                paddingVertical: 10,
                marginTop: 10,
                width: Dimensions.get('screen').width * 0.8,
                alignSelf: 'center',
              },
              this.state.CompanyName &&
                this.state.CompanyName.length >= 3 &&
                this.state.selectedClassification &&
                this.state.selectedClassification.length > 0 &&
                this.state.selectedCompetence &&
                this.state.selectedCompetence.length > 0 &&
                this.state.selectedMakes &&
                this.state.selectedMakes.length > 0 &&
                this.state.selectedCountry &&
                ((this.state.email && this.state.email.length > 0) ||
                this.state.isEmailRegisterCountry
                  ? this.validateEmail(this.state.email)
                  : true) &&
                this.refs.phone &&
                this.refs.phone.isValidNumber() &&
                this.state.selectedCity &&
                (!this.props.route.params?.BecomeADealer &&
                !this.props.route.params?.Edit
                  ? this.state.password && this.state.password.length >= 6
                  : true) && {
                  backgroundColor: 'green',
                },
              this.state.disableSignUp && {
                backgroundColor: 'gray',
              },
            ]}
            onPress={() => {
              if (
                // (this.refs.TellPhone?.getValue()?.length < 5 ||
                //   (!!this.refs.TellPhone?.getValue() &&
                //     this.refs.TellPhone?.isValidNumber())) &&
                this.state.CompanyName &&
                this.state.CompanyName.length >= 3 &&
                this.state.selectedClassification &&
                this.state.selectedClassification.length > 0 &&
                this.state.selectedCompetence &&
                this.state.selectedCompetence.length > 0 &&
                this.state.selectedMakes &&
                this.state.selectedMakes.length > 0 &&
                this.state.selectedCountry &&
                ((this.state.email &&
                  this.state.email.length > 0 &&
                  !this.state.isEmailRegisterCountry) ||
                this.state.isEmailRegisterCountry
                  ? this.validateEmail(this.state.email)
                  : true) &&
                this.refs.phone &&
                this.refs.phone.isValidNumber() &&
                this.state.selectedCity &&
                (!this.props.route.params?.BecomeADealer &&
                !this.props.route.params?.Edit
                  ? this.state.password && this.state.password.length >= 6
                  : true)
              ) {
                this.setState({submitLoader: true, disableSignUp: true});
                KS.BecomeADealer({
                  phone2:
                    !!this.state.Phone?.length &&
                    this.refs.TellPhone?.isValidNumber()
                      ? this.refs.TellPhone?.getValue()
                      : '',
                  phone: this.refs.phone.getValue(),
                  name: this.state.CompanyName,
                  billingfirstname: this.state.BillingFirstName,
                  billinglastname: this.state.BillingLastName,
                  streetname: this.state.StreetName,
                  postalcode: this.state.PostalCode,
                  classification: this.state.selectedClassification[0],
                  competence: this.state.selectedCompetence.join(','),
                  makes: this.state.selectedMakes.join(','),
                  vat: this.state.vat || '',
                  description: this.state.aboutCo || '',
                  email: this.state.email || '',
                  city: this.state.selectedCity[0],
                  address: this.state.Address || '',
                  password: this.state.password || '',
                  country: this.state.selectedCountry.cca2,
                  doHide: this.state.hideMobile
                    ? !!this.state.Phone?.length &&
                      !!this.refs.TellPhone?.isValidNumber() &&
                      this.state.hideMobile
                    : this.state.hideMobile,
                  langid: Languages.langID,
                  userid: (this.props.user && this.props.user?.ID) || '',
                  dealerID: this.props.route.params?.Edit
                    ? this.props.user?.ID
                    : '',
                  deviceID: DeviceInfo.getUniqueID(),
                  latLng: this.state.userLocation
                    ? `${this.state.userLocation.latitude},${this.state.userLocation.longitude}`
                    : '',
                })
                  .then(data => {
                    this.setState({disableSignUp: false});
                    if (data && data.Success == 1) {
                      this.setState({dealerData: data});
                      if (data.EmailInUse) {
                        Alert.alert(
                          Languages.EmailAlreadyTaken,
                          Languages.EmailTakenDescription,
                          [
                            {
                              text: Languages.Cancel,
                              onPress: () => {},
                              style: 'cancel',
                            },
                            {
                              text: Languages.Login,
                              onPress: () => {
                                this.props.navigation.navigate('LoginScreen');
                              },
                            },
                          ],
                          {cancelable: true},
                        );
                      } else if (data.PhoneInUse) {
                        Alert.alert(
                          Languages.NumberAlreadyTakenAlert,
                          Languages.LoginToBecomeADealer,
                          [
                            {
                              text: Languages.Cancel,
                              onPress: () => {},
                              style: 'cancel',
                            },
                            {
                              text: Languages.Login,
                              onPress: () => {
                                this.props.navigation.navigate('LoginScreen');
                              },
                            },
                          ],
                          {cancelable: true},
                        );
                        //      toast(Languages.NumberAlreadyTaken);
                      } else if (data.IsDealer == 1) {
                        //    alert(JSON.stringify(data));
                        this.props.storeUserData(data.CurrentUser, () => {
                          if (data.Code == 1)
                            this.setState({openOTPModal: true});
                          else {
                            if (this.props.route.params?.Edit == 0) {
                              KS.PlansGet({
                                langid: Languages.langID,
                                isocode: this.state.selectedCountry.cca2,
                              }).then(data => {
                                if (data?.Plans?.length > 0) {
                                  // Khattab
                                  // this.props.navigation.replace(
                                  //   'SubscriptionsScreen',
                                  //   {
                                  //     ISOCode: this.state.selectedCountry.cca2, //data.CurrentUser.ISOCode,
                                  //     User: this.props.user,
                                  //     Plans: data.Plans,
                                  //   },
                                  // );
                                } else {
                                  toast(Languages.WaitingAdminAprroval, 6000);
                                  this.props.navigation.goBack();
                                }
                              });
                            } else {
                              this.props.navigation.goBack();
                            }
                          }
                        });
                      }
                    } else {
                      alert(data.Message);
                    }
                  })
                  .finally(() => {
                    this.setState({
                      submitLoader: false,
                    });
                  });
              } else {
                this.validateInputs();
              }
            }}>
            {this.state.submitLoader ? (
              <ActivityIndicator size={28} color={Color.main} />
            ) : (
              <Text style={{color: '#fff', textAlign: 'center'}}>
                {this.props.route.params?.BecomeADealer
                  ? Languages.BecomeADealer
                  : this.props.route.params?.Edit
                  ? Languages.Confirm
                  : Languages.SignUp}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  modalTextinput: {
    height: 40,
    borderColor: Color.secondary,
    marginTop: 10,
    borderBottomWidth: 1,
    fontSize: 16,
    color: '#383737',
  },
  CancelButton: {
    backgroundColor: '#EFEFF1',
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  ChangeButton: {
    backgroundColor: Color.secondary,
    flex: 1,
    textAlign: 'center',

    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  modalbox: {
    zIndex: 500,
    elevation: 10,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  modalContent: {
    width: Dimensions.get('screen').width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    // opacity:0.9,
    //  height: 200,
    minHeight: 200,
    elevation: 10,

    padding: 20,
    borderRadius: 1,
    justifyContent: 'center',
    //  alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#000',
  },
  Textinput: {
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    borderBottomColor: Color.blackDivide,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    color: '#383737',
  },
  header: {
    textAlign: 'left',
    color: '#283B77',
    marginBottom: 5,
  },
  inputWrap: {
    //flexDirection: "row",
    //  alignItems: "center",
    //  borderColor: Color.blackDivide,
    //  borderBottomWidth: 1,
    backgroundColor: 'white',
    marginTop: 10,
    padding: 10,
  },
  text: {
    fontFamily: 'Cairo-Regular',
    textAlign: 'left',
    fontSize: 16,
    //   padding: 5,
    // paddingHorizontal: 10,
    color: '#C7C7CD',
  },
});

const mapStateToProps = ({home, user, menu}) => {
  return {
    homePageData: home.homePageData,
    user: user.user,
    ViewingCountry: menu.ViewingCountry,
  };
};

const mapDispatchToProps = dispatch => {
  const MenuRedux = require('../redux/MenuRedux');
  const UserRedux = require('../redux/UserRedux');

  return {
    setViewingCountry: (country, callback) =>
      MenuRedux.actions.setViewingCountry(dispatch, country, callback),
    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),
    storeUserData: (user, callback) =>
      UserRedux.actions.storeUserData(dispatch, user, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DealerSignUp);
