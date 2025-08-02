import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  Platform,
  Button,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
} from 'react-native';
import {connect, useDispatch, useSelector} from 'react-redux';
import {Languages, Color, Constants} from '../common';
import {AutobeebModal, LogoSpinner} from '../components';
import HTML, {IGNORED_TAGS} from 'react-native-render-html';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {WebView} from 'react-native-webview';
import ks from '../services/KSAPI';
import SpecialSVG from '../components/SpecialSVG';
import IconFa from 'react-native-vector-icons/FontAwesome';
// import RNIap, {purchaseErrorListener} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {actions} from '../redux/MenuRedux';
import {isIOS} from '../autobeeb/constants/Layout';

const screenWidth = Dimensions.get('screen').width;
const DurationType = {
  0: 'Day',
  1: 'Month',
  2: 'Week',
};
const colors = [
  Color.primary,
  Color.secondary,
  '#932F6D',
  '#FFD400',
  '#C20037',
  '#018404',
  '#9D4E01',
  '#636363',
  Color.primary,
  Color.secondary,
  '#932F6D',
  '#FFD400',
  '#C20037',
  '#018404',
  '#9D4E01',
  '#636363',
];
const NonPayssionCountries = [
  '979',
  '1088',
  '973',
  '1063',
  '989',
  '1044',
  '1077',
  '1034',
  '1024',
  '907',
  '985',
  '1004',
  '932',
  '942',
  '1053',
  '1058',
  '1055',
  '897',
  '1071',
  '1008',
  '992',
  '946',
];
const NonCardCountries = [
  '1079',
  '984',
  '1006',
  '925',
  '1066',
  '970',
  '1090',
  '920',
  '1025',
  '1035',
  '1046',
  '1051',
  '918',
  '968',
  '1076',
  '972',
  '1084',
  '1049',
  '940',
  '983',
  '950',
  '1031',
  '1036',
  '896',
  '902',
  '935',
  '910',
  '915',
  '924',
  '929',
  '986',
  '981',
  '959',
  '1081',
  '1057',
  '1089',
  '1064',
  '1009',
  '1015',
  '1020',
  '994',
  '1030',
  '901',
  '905',
  '938',
  '908',
  '914',
  '923',
  '928',
  '980',
  '947',
  '1080',
  '1002',
  '1029',
  '1033',
  '1045',
  '1050',
  '899',
  '937',
  '913',
  '917',
  '990',
  '988',
  '957',
  '962',
  '967',
  '1086',
  '1054',
  '1022',
  '996',
  '1028',
  '1037',
  '931',
  '936',
  '945',
  '987',
  '977',
  '956',
  '1083',
  '1073',
  '1065',
  '1011',
  '1027',
  '1048',
];
const UnionPayCountries = [
  '930',
  '903',
  '925',
  '1092',
  '999',
  '1019',
  '1049',
  '1078',
  '1062',
  '1079',
  '911',
  '920',
  '939',
  '940',
  '941',
  '950',
  '953',
  '954',
  '958',
  '960',
  '968',
  '974',
  '976',
  '988',
  '994',
  '995',
  '1002',
  '1018',
  '1032',
  '1033',
  '1035',
  '1050',
  '1051',
  '1056',
  '1061',
];
const aliPaymentCountries = [
  '1092',
  '1049',
  '978',
  '908',
  '1079',
  '925',
  '930',
];
const BankCountries = ['979'];

const SpecialPlans = ({route, pOffer, pOnClose}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const Currency = useSelector(state => state.menu.ViewingCurrency);
  const User = useSelector(x => x.user.user ?? x.user.tempUser);
  const [plans, setPlans] = useState([]);
  const itemSkus = Platform.select({
    ios: [
      'one_year_subscription_01',
      'one_year_subscription_02',
      'one_year_subscription_03',
      'one_year_subscription_04',
      'one_year_subscription_05',
    ],
    android: [
      'one_year_subscription_01',
      'one_year_subscription_02',
      'one_year_subscription_03',
      'one_year_subscription_04',
      'one_year_subscription_05',
    ],
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [PaymentMethods, setPaymentMethods] = useState([
    {
      ID: 2,
      Name: 'Visa',
      localImage: true,
      Image: require('../images/visa.png'),
    },
    {
      ID: 3,
      Name: 'Mastercard',
      localImage: true,
      Image: require('../images/mastercard.png'),
    },
    {
      ID: 1,
      Name: 'PayPal',
      localImage: true,
      Image: require('../images/paypal.png'),
    },
    {
      ID: 5,
      Name: 'alipay',
      Image: 'https://autobeeb.com/wsImages/alipay.png',
    },
    {
      ID: 6,
      Name: 'Cash',
      Image: 'https://autobeeb.com/wsImages/bank-transfer.png',
    },
    {
      ID: 8,
      Name: 'Unionpay',
      Image: 'https://autobeeb.com/wsImages/unionpay.png',
    },
  ]);
  const [Refresh, setRefresh] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [loader, setLoader] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const PaymentModal = useRef(null);
  const plansListRef = useRef(null);
  const Offer = !pOffer ? route?.params?.Offer : pOffer;
  const listingId = route?.params?.listingId ?? Offer.ID;
  const isNeedRefresh = !!route?.params?.isNeedRefresh;
  const lang = Languages.getLanguage();
  const [InAppPurchases, setInAppPurchases] = useState([]);
  const [approvedEmail, setApprovedEmail] = useState('');

  useEffect(() => {
    ks.GetSpecialPlans({
      UserId: User.ID,
      Lang: lang,
      cur: Currency.ID,
    })
      .then(res => {
        dispatch(actions.setAllowFeature(res?.Plans && res?.Plans?.length));
        let _plans = res.Plans.map(plan => {
          return {
            ...plan,
            FormatedPrice: Currency.Format.replace(
              '{0}',
              `${Math.ceil(plan.Price * Currency.Ratio).toFixed(0)}`,
            ),
          };
        });

        if (!_plans.length) navigation.goBack();
        setPlans([..._plans]);
      })
      .catch(err => {
        console.log({err});
      })
      .finally(() => {
        setLoader(false);
      });
    getApprvedEmailForNumber();
    // if (false) {
    //   // stop in app payment
    //   RNIap?.getProducts?.(itemSkus)
    //     .then(data => {
    //       setInAppPurchases(data);
    //     })
    //     .catch(err => {
    //       alert(JSON.stringify(err));
    //     });

    //   RNIap?.initConnection?.().then(() => {
    //     // we make sure that "ghost" pending payment are removed
    //     // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
    //     RNIap.flushFailedPurchasesCachedAsPendingAndroid()
    //       .catch(() => {
    //         // exception can happen here if:
    //         // - there are pending purchases that are still pending (we can't consume a pending purchase)
    //         // in any case, you might not want to do anything special with the error
    //       })
    //       .then(() => {
    //         purchaseErrorSubscription = purchaseErrorListener(error => {
    //           console.warn('purchaseErrorListener', error);
    //         });
    //       });
    //   });
    // }
    var tempPaymentMethods = [...PaymentMethods];

    ks.CountryGet({
      langID: Languages.langID,
      isocode: route?.params?.ISOCode || 'JO',
    }).then(data => {
      if (data && data.Success) {
        const country = data.Country;
        if (NonPayssionCountries.includes(country.ID)) {
          tempPaymentMethods = [
            ...tempPaymentMethods.filter(
              x => x.Name !== 'Unionpay' && x.Name !== 'alipay',
            ),
          ];
        }
        if (NonCardCountries.includes(country.ID)) {
          tempPaymentMethods = [
            ...tempPaymentMethods.filter(
              x => x.Name !== 'Visa' && x.Name !== 'Mastercard',
            ),
          ];
        }
        if (!UnionPayCountries.includes(country.ID)) {
          tempPaymentMethods = [
            ...tempPaymentMethods.filter(x => x.Name !== 'Unionpay'),
          ];
        }
        if (aliPaymentCountries.includes(country.ID)) {
          tempPaymentMethods = [
            ...tempPaymentMethods.filter(x => x.Name !== 'alipay'),
          ];
        }
        if (!BankCountries.includes(country.ID) || Languages.prefix != 'ar') {
          tempPaymentMethods = [
            ...tempPaymentMethods.filter(x => x.Name !== 'Cash'),
          ];
        }
        setPaymentMethods([...tempPaymentMethods]);
      }
    });
  }, []);

  function handlePaymentMethod(PaymentMethod) {
    const GatewayType = Object.freeze({
      Payssion: 9,
      Paypal: 11,
      IAPApple: 12,
      IAPAndroid: 13,
      BankTransfer: 15, // BankTransfer changeed to CliQ
      Unionpay: 17,
      Tap: 18,
    });

    switch (PaymentMethod.ID) {
      case 1:
        return handleHyperPay(GatewayType.Paypal);
      case 2:
        return handleHyperPay(GatewayType.Tap);
      case 3:
        return handleHyperPay(GatewayType.Tap);
      case 4:
        return handleIAP();
      case 5:
        return handleHyperPay(`ps2${GatewayType.Payssion}`);
      case 6:
        return OpenCliQScreen();
      case 7:
        return handleHyperPay(GatewayType.Tap);
      case 8:
        return handleHyperPay(`ps1${GatewayType.Payssion}`);
    }
  }

  function OpenCliQScreen() {
    fetch(
      `https://autobeeb.com/${lang}/special-do-pay/${listingId}/${
        selectedPlan?.Id
      }/${'15'}?userID=${User.ID}&id=${User.ID}`,
    ).then(res => {});

    // navigation.goBack();
    navigation.navigate('CliQScreen', {
      Price: selectedPlan.Price,
      PlanName: selectedPlan.Name,
    });
  }

  async function handleIAP() {
    let inAppPurch = __DEV__
      ? {productId: 'one_year_subscription_01'}
      : InAppPurchases.find(
          IAP =>
            IAP.productId ==
            Platform.select({
              ios: selectedPlan.AppStoreProductId,
              android: selectedPlan.GoogleProductId,
            }),
        );

    if (inAppPurch) {
      await ks
        .AddPendingTransaction({
          userid: (route.params?.User || {ID: ''}).ID,
          planid: selectedPlan.Id,
          gatewaytype: Platform.select({
            ios: 12,
            android: 13,
          }),
        })
        .then(async data => {
          if (data && data.Success == 1) {
            await AsyncStorage.setItem(
              'pendingTransactionID',
              JSON.stringify(data.TransactionID),
            );

            try {
              // let res = await RNIap.requestSubscription(inAppPurch.productId);
              // console.log({res});
            } catch (error) {
              console.log({error});
            }
          }
        });
    }
  }

  const navigateToDrawerScreen = (screen, params) => {
    if (!screen) return;

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'App',
            state: {
              routes: [
                {
                  name: 'DrawerStack',
                  state: {
                    routes: [
                      {
                        name: screen,
                        params,
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
  };

  const getApprvedEmailForNumber = () => {
    if (User?.EmailRegister && User?.EmailApproved === false) {
      ks.GetApprovedAccountByPhone({
        phone: User?.Phone?.replace('+', ''),
        email: User?.Email,
      }).then(res => {
        setApprovedEmail(res?.Email);
      });
    }
  };

  async function handleHyperPay(gateway, cardType, payssionpmid) {
    setSelectedGateway(gateway);
    PaymentModal.current.open();
  }

  const htmlStyle =
    `<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Cairo"><style> *{direction:` +
    (Languages.langID == '2' ? 'rtl' : 'ltr') +
    `; font-family:'cairo'}li{ font-size:35px; text-align:` +
    (Languages.langID == '2' ? 'right' : 'left') +
    `;padding:5px}</style>`;
  const webViewScript = `setTimeout(function() {     window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);   }, 500);  true; `; // note: this is required, or you'll sometimes get silent failures

  if (loader) return <LogoSpinner fullStretch={true} />;
  if (User.EmailRegister && !User.EmailApproved) {
    return (
      <View style={styles.containerMessage}>
        <Text style={styles.messageText}>
          {Languages.EmailPendingApproval + (approvedEmail ?? '')}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.okButtonText}>{Languages.Ok}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              navigateToDrawerScreen('EditProfile', {
                ChangePhone:
                  User?.EmailRegister && !User?.EmailConfirmed ? false : true,
                ChangeEmail: User?.EmailRegister && !User?.EmailConfirmed,
              });
            }}>
            <Text style={styles.editButtonText}>
              {User.EmailRegister && !User.EmailConfirmed
                ? Languages.ChangeEmail
                : Languages.ChangeNumber}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingBottom: isIOS ? 0 : insets.bottom,
      }}>
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={styles.mainContainer}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: Platform.select({
              ios: 40,
              android: 25,
            }),
            left: 15,
            zIndex: 150,
            paddingHorizontal: 20,
            paddingVertical: 5,
            backgroundColor: '#000',
            borderRadius: 20,
          }}
          onPress={() => {
            if (!pOnClose) {
              navigation.goBack();
            } else {
              pOnClose();
            }
          }}>
          <Text
            style={{
              fontSize: 16,
              color: '#fff',
              fontFamily: Constants.fontFamily,
            }}>
            {Languages.Close}
          </Text>
        </TouchableOpacity>
        <Text style={styles.PageTitle}>{Languages.SpecialYourOfferTitle}</Text>
        <Text style={styles.PageDesc}> {Languages.SpecalOnSiteAndSocial} </Text>
        <Text style={styles.PageChoose}> {Languages.ChoosePlan} : </Text>
        <FlatList
          contentContainerStyle={{paddingHorizontal: 16}}
          style={styles.FList}
          data={[...plans]}
          renderItem={({item, index}) => (
            <RenderPlan2
              key={index}
              index={index}
              item={item}
              setSelectedPlan={setSelectedPlan}
              setOpenPaymentModal={flag => {
                setOpenPaymentModal(flag);
              }}
              onSelectPlan={() => {
                if (false) {
                  // stop in app payment
                  let IAP = {
                    ID: 4,
                    Name: 'iap',
                    localImage: true,
                    Image:
                      Platform.OS === 'ios'
                        ? require('../images/iap.png')
                        : require('../images/googleIAP.png'),
                  };
                  if (
                    InAppPurchases.some(
                      x =>
                        x.productId == item.GoogleProductId ||
                        x.productId == item.AppStoreProductId,
                    ) &&
                    PaymentMethods.filter(PM => PM.ID == 4).length == 0
                  ) {
                    setPaymentMethods([...PaymentMethods, IAP]);
                  } else if (
                    PaymentMethods.filter(PM => PM.ID == 4).length > 0 &&
                    !InAppPurchases.some(
                      x =>
                        x.productId == item.GoogleProductId ||
                        x.productId == item.AppStoreProductId,
                    )
                  ) {
                    let tempPaymentMethods = [...PaymentMethods];
                    tempPaymentMethods.pop();
                    setPaymentMethods(tempPaymentMethods);
                  }
                }
              }}
            />
          )}
          keyExtractor={item => item.ID}
          scrollEnabled={false}
        />
      </ScrollView>

      <Modal
        coverScreen
        visible={openPaymentModal}
        statusBarTranslucent
        swipeToClose={false}
        style={styles.modalStyle}>
        {!!selectedPlan && (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F8F8F8',
            }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: Platform.select({
                  ios: 50,
                  android: 35,
                }),
                left: 15,
                zIndex: 150,
                paddingHorizontal: 20,
                paddingVertical: 5,
                backgroundColor: '#000',
                borderRadius: 20,
              }}
              onPress={() => {
                setSelectedPlan(null);
                setOpenPaymentModal(false);
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#fff',
                  fontFamily: Constants.fontFamily,
                }}>
                {Languages.Close}
              </Text>
            </TouchableOpacity>

            <ScrollView ref={plansListRef} nestedScrollEnabled={true}>
              <View>
                <View
                  style={{
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: '#FFF',
                    width: screenWidth,
                    paddingTop: 60,
                    paddingBottom: 20,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={[
                        styles.planName,
                        {color: '#000', marginVertical: 15, fontSize: 22},
                      ]}>
                      {selectedPlan.Name}
                    </Text>
                    <View>
                      <Text style={[styles.planPrice, {flex: 0}]}>
                        {`${global.ViewingCurrency.Format}`.replace(
                          '{0}',
                          Math.ceil(
                            selectedPlan.Price * global.ViewingCurrency.Ratio,
                          ),
                        )}
                      </Text>
                    </View>
                    <HTML
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      width={screenWidth - screenWidth * 0.04 - 15}
                      originWhitelist={['*']}
                      onLoadEnd={() => setRefresh(!Refresh)}
                      source={{html: htmlStyle + selectedPlan.Description}}
                      injectedJavaScript={webViewScript}
                      javaScriptEnabled={true}
                      tagsStyles={{
                        li: {
                          textAlign: Languages.langID == '2' ? 'right' : 'left',
                          width: '100%',
                          marginVertical: 5,
                        },
                        br: {height: 0},
                      }}
                      ignoredTags={
                        !!IGNORED_TAGS ? [...IGNORED_TAGS, 'br'] : ['br']
                      }
                    />
                  </View>
                </View>

                <View style={{}}>
                  <Text
                    style={{
                      fontFamily: Constants.fontFamilyBold,
                      fontSize: 18,
                      color: '#000',
                      textAlign: 'center',
                      marginVertical: 15,
                    }}>
                    {Languages.SelectPaymentMethod}
                  </Text>
                </View>
                <FlatList
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  scrollEnabled
                  keyExtractor={(item, index) => index.toString()}
                  data={PaymentMethods}
                  numColumns={2}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          {
                            backgroundColor: '#fff',
                            padding: 15,
                            borderRadius: 15,
                            marginBottom: 20,
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: 'row',
                            elevation: 1,
                            marginHorizontal: 10,
                          },
                        ]}
                        onPress={() => {
                          //console.log('===============');
                          handlePaymentMethod(item);
                        }}>
                        <Image
                          style={{width: 120, height: 60}}
                          resizeMode="contain"
                          source={
                            item.localImage ? item.Image : {uri: item.Image}
                          }
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    paddingHorizontal: 10,
                  }}>
                  {Languages.AmountWillDeducted}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <AutobeebModal
        ref={PaymentModal}
        style={[styles.modelModal]}
        position="center"
        backButtonClose
        entry="bottom"
        fullScreen={true}
        swipeToClose={true}
        backdropPressToClose
        coverScreen={Platform.OS == 'android'}
        backdropOpacity={0.9}>
        <View
          style={{
            zIndex: 200,
            minHeight: 50,
            paddingTop: isIphoneX() ? 20 : 10,
            paddingBottom: 10,
            width: screenWidth,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 20,
              justifyContent: 'space-between',
            }}></View>
        </View>
        <WebView
          thirdPartyCookiesEnabled={true}
          originWhitelist={['*']}
          mixedContentMode={'always'}
          domStorageEnabled={true}
          allowUniversalAccessFromFileURLs={true}
          onLoadStart={() => {
            console.log(
              `https://autobeeb.com/${lang}/special-do-pay/${listingId}/${selectedPlan?.Id}/${selectedGateway}?userID=${User.ID}&id=${User.ID}`,
            );
          }}
          javaScriptEnabled={true}
          style={{flex: 1, height: Dimensions.get('screen').height}}
          onMessage={event => {
            setOpenPaymentModal(false);
            PaymentModal.current.close();
            navigation.navigate('HomeScreen');
          }}
          source={{
            uri: `https://autobeeb.com/${lang}/special-do-pay/${listingId}/${selectedPlan?.Id}/${selectedGateway}?userID=${User.ID}&id=${User.ID}`,
          }}
          renderLoading={() => (
            <ActivityIndicator
              color={Color.primary}
              size="large"
              style={{
                alignSelf: 'center',
                position: 'absolute',
                zIndex: 99,
                top: '50%',
              }}
            />
          )}
          startInLoadingState={true}
        />
      </AutobeebModal>
    </View>
  );
};

const RenderPlan2 = ({
  item,
  index,
  setOpenPaymentModal,
  setSelectedPlan,
  onSelectPlan,
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFF',
        marginTop: 15,
        borderRadius: 5,
        overflow: 'hidden',
        elevation: 5,
        padding: 16,
      }}
      activeOpacity={0.9}
      onPress={() => {
        onSelectPlan();
        setSelectedPlan({...item});
        setOpenPaymentModal(true);
      }}>
      <Text style={[styles.planName, {textAlign: 'center'}]}>{item.Name}</Text>
      {item.WithFacebook && (
        <Text style={[styles.planName, {textAlign: 'center', fontSize: 10}]}>
          {item.FacebookDesc}
        </Text>
      )}
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <View
            style={{
              alignItems: 'center',
              elevation: 5,
              backgroundColor: '#FFF',
              width: 70,
              height: 70,
              borderRadius: 35,
              justifyContent: 'center',
            }}>
            <Text
              style={[styles.planName, {fontFamily: Constants.fontFamilyBold}]}>
              {item.Duration}
            </Text>
            <Text style={[styles.planName, {fontSize: 14}]}>
              {Languages[DurationType[item.DurationType]]}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.planPrice,
            {
              color: colors[index],
              textAlign: 'center',
            },
          ]}>
          {item.Price == 0 ? Languages.Free : item.FormatedPrice}
        </Text>

        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <View
            style={{
              alignItems: 'center',
              elevation: 5,
              backgroundColor: '#FFF',
              width: 70,
              height: 70,
              borderRadius: 35,
              justifyContent: 'center',
            }}>
            {item.WithFacebook ? (
              <View
                style={{
                  position: 'relative',
                  width: '50%',
                  marginStart: 5,
                  marginTop: 5,
                }}>
                <View
                  style={{
                    position: 'absolute',
                    top: -15,
                    right: -5,
                    zIndex: 2,
                  }}>
                  <SpecialSVG height={36} width={30} />
                </View>
                <IconFa
                  name={'facebook-square'}
                  size={30}
                  color={'#1877F2'}
                  style={{
                    marginLeft: 5,
                    position: 'absolute',
                    top: -22,
                    right: 12,
                  }}
                />
              </View>
            ) : (
              <SpecialSVG height={36} width={30} />
            )}
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors[index],
          paddingVertical: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: '#FFF',
            fontFamily: Constants.fontFamilyBold,
            fontSize: 20,
          }}>
          {Languages.Subscribe}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  Card: {
    borderWidth: 1,
    borderColor: Color.primary,
    padding: 10,
    margin: 5,
    width: screenWidth - 20,
    borderRadius: 5,
    justifyContent: 'space-between',
    gap: 5,
  },
  Title: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    minHeight: 65,
  },
  Price: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    color: Color.primary,
  },
  Desc: {
    fontSize: 18,
    fontWeight: 400,
    textAlign: 'center',
  },
  subscriptionBTN: {
    flex: 1,
    justifySelf: 'flex-end',
    borderRadius: 10,
  },
  TextContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 5,
  },
  PageTitle: {
    fontSize: 22,
    textAlign: 'center',
    color: Color.primary,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: Constants.fontFamilyBold,
    maxWidth: '50%',
    alignSelf: 'center',
  },
  imageStyle: {
    width: '50%',
    height: (screenWidth / 100) * 25,
    objectFit: 'conatins',
    borderColor: '#fff',
  },
  line: {
    height: 1,
    backgroundColor: Color.primary,
    marginVertical: 7,
  },
  OfferCard: {
    borderColor: Color.primary,
    flexDirection: 'row',
    borderWidth: 1,
    width: '90%',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  TextSection: {
    justifyContent: 'space-between',
  },
  mainContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    // justifyContent: 'space-between',
    // height: '100%',
    // alignItems: 'center',
    // alignContent: 'center',
    // paddingTop: 30,
    // paddingBottom: 30,
  },
  offerTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    fontFamily: Constants.fontFamilyBold,
  },
  PageDesc: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    fontFamily: Constants.fontFamilySemiBold,
  },
  PageChoose: {
    fontSize: 20,
    color: Color.primary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: Constants.fontFamilyBold,
  },
  planPrice: {
    fontSize: 24,
    color: Color.primary,
    flex: 1,
    fontFamily: Constants.fontFamilyBold,
  },
  modalStyle: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontFamily: Constants.fontFamilyBold,
    color: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerText: {
    fontSize: 20,
    fontFamily: Constants.fontFamilyBold,
    color: '#000',
    marginTop: 20,
    textAlign: 'center',
  },
  activityIndicatorStyle: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  containerMessage: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  messageText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 21,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Dimensions.get('screen').width,
    justifyContent: 'space-around',
  },
  okButton: {
    backgroundColor: 'green',
    paddingVertical: 5,
    borderRadius: 5,
    flexGrow: 0,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: Color.secondary,
    paddingVertical: 5,
    borderRadius: 5,
    flexGrow: 0,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default SpecialPlans;
