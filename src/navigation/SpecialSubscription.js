import React, {createRef, useState, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  I18nManager,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {AppIcon, Color} from '../common';
import Constants from '../common/Constants';
import Languages from '../common/Languages';
import {NewHeader} from '../containers';
import IconEn from 'react-native-vector-icons/Feather';
import KS from '../services/KSAPI';

import HTML, {IGNORED_TAGS} from 'react-native-render-html';
// import RNIap, {
//   purchaseErrorListener,
//   purchaseUpdatedListener,
// } from 'react-native-iap';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {NavigationActions, StackActions} from '@react-navigation/native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

/*
const ActivityIndicatorElement = () => {
  return (
    <ActivityIndicator
      color="#009688"
      size="large"
      style={{
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 99,
        top: '50%',
      }}
    />
  );
};

const SpecialSubscription = ({navigation, storeUserData}) => {
  const route = useRoute();
  const Offer = route.params?.Offer;
  const User = route.params?.User;
  const Plan = route.params?.Plan;

  const PaymentMethodModalRef = createRef();
  const PaymentModal = createRef();
  const plansListRef = createRef();

  let htmlStyle =
    `<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Cairo"><style>
  *{direction:` +
    (Languages.langID == '2' ? 'rtl' : 'ltr') +
    `; font-family:'cairo'}
  li{ font-size:35px; text-align:` +
    (Languages.langID == '2' ? 'right' : 'left') +
    `;padding:5px}
</style>`;

  const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight); 
  }, 500);
  true; // note: this is required, or you'll sometimes get silent failures
`;

  const [selectedType, setselectedType] = useState({
    ID: 2,
    Name: 'عادي',
    MonthPrice: 18,
    ThreeMonthsPrice: 50,
    SixMonthsPrice: 90,
    NineMonthsPrice: 120,
    YearPrice: 150,
    AdsNumber: 25,
  });

  const [Plans, setPlans] = useState(route.params?.Plans || []);
  const [selectedGateway, setselectedGateway] = useState();
  const [Card, setCard] = useState();
  const [Loading, setLoading] = useState(false);
  const [Refresh, setRefresh] = useState(false);
  //const [PendingTransactionID, setPendingTransactionID] = useState();
  const [InAppPurchases, setInAppPurchases] = useState([]);
  const [pmid, setpmid] = useState();
  const [webViewHeight, setWebViewHeight] = useState(0);
  const [PaymentMethods, setPaymentMethods] = useState([
    {
      ID: 2,
      Name: 'Visa',
      Image: 'https://1000logos.net/wp-content/uploads/2017/06/VISA-logo.png',
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

  const colors = [
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

  useEffect(() => {
    if (!Plans || Plans == [] || Plans.length == 0) {
      KS.PlansGet({
        langid: Languages.langID,
        isocode: route.params?.ISOCode || 'US',
      }).then(data => {
        if (data?.Plans?.length > 0) {
          setPlans(data.Plans);
        } else {
          navigation.goBack();
        }
      });
    }

    RNIap?.getProducts?.(itemSkus)
      .then(data => {
        setInAppPurchases(data);
      })
      .catch(err => {
        alert(JSON.stringify(err));
      });

    RNIap?.initConnection?.().then(() => {
      // we make sure that "ghost" pending payment are removed
      // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
      RNIap.flushFailedPurchasesCachedAsPendingAndroid()
        .catch(() => {
          // exception can happen here if:
          // - there are pending purchases that are still pending (we can't consume a pending purchase)
          // in any case, you might not want to do anything special with the error
        })
        .then(() => {
          purchaseErrorSubscription = purchaseErrorListener(error => {
            console.warn('purchaseErrorListener', error);
          });
        });
    });

    var tempPaymentMethods = [...PaymentMethods];

    KS.CountryGet({
      langID: Languages.langID,
      isocode: route.params?.ISOCode || 'JO',
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
        if (!BankCountries.includes(country.ID)) {
          tempPaymentMethods = [
            ...tempPaymentMethods.filter(x => x.Name !== 'Cash'),
          ];
        }
        setPaymentMethods([...tempPaymentMethods]);
      }
    });
  }, []);

  function PlanPeriodType(period) {
    switch (period) {
      case 1:
        return I18nManager.isRTL ? 'سنة' : Languages.Year;
      case 2:
        return Languages.Month;
      case 3:
        return Languages.Day;
    }
  }

  function handlePaymentMethod(PaymentMethod) {
    switch (PaymentMethod.ID) {
      case 1:
        return handleHyperPay('A');
      case 2:
        return handleHyperPay('E', 'VISA');
      case 3:
        return handleHyperPay('E', 'MASTER');
      case 4:
        return handleIAP();
      case 5:
        return handleHyperPay('P', null, 'alipay_cn');
      case 6:
        return handleHyperPay('C');
      case 7:
        return handleHyperPay('E');
      case 8:
        return handleHyperPay('U');
    }
  }

  async function handleIAP() {
    let inAppPurch = InAppPurchases.find(
      IAP =>
        IAP.productId ==
        Platform.select({
          ios: selectedType.AppStoreProductId,
          android: selectedType.GoogleProductId,
        }),
    );

    if (inAppPurch) {
      await KS.AddPendingTransaction({
        userid: ('User', {ID: ''}).ID,
        planid: selectedType.ID,
        gatewaytype: Platform.select({
          ios: 12,
          android: 13,
        }),
      }).then(async data => {
        if (data && data.Success == 1) {
          await AsyncStorage.setItem(
            'pendingTransactionID',
            JSON.stringify(data.TransactionID),
          );
          await RNIap.requestSubscription(inAppPurch.productId);
        }
      });
    }
  }

  async function handleHyperPay(gateway, cardType, payssionpmid) {
    setselectedGateway(gateway);
    if (cardType) {
      setCard(cardType);
    }
    if (payssionpmid) {
      setpmid(payssionpmid);
    }

    PaymentModal.current.open();
  }

  return (
    <View style={styles.container}>
      {Loading && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: '100%',
            height: '100%',
            elevation: 2,
            zIndex: 100,
          }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <NewHeader navigation={navigation} back></NewHeader>

      <Modal
        ref={PaymentMethodModalRef}
        coverScreen
        statusBarTranslucent
        backdropPressToClose
        useNativeDriver={false}
        backButtonClose
        swipeToClose={false}
        style={styles.modalStyle}>
        {selectedType.ID != null && (
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
                setselectedType({ID: null});
                PaymentMethodModalRef.current.close();
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

            <ScrollView ref={plansListRef}>
              <View style={{}}>
                <View
                  style={{
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: '#FFF',
                    width: Dimensions.get('screen').width,
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
                      {selectedType.Name}
                    </Text>
                    <HTML
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      width={
                        Dimensions.get('screen').width -
                        Dimensions.get('screen').width * 0.04 -
                        15
                      }
                      originWhitelist={['*']}
                      onLoadEnd={() => setRefresh(!Refresh)}
                      source={{html: htmlStyle + selectedType.Description}}
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
                  <View style={{}}>
                    <Text style={[styles.planPrice, {flex: 0}]}>
                      {`${global.ViewingCurrency.Format}`.replace(
                        '{0}',
                        Math.round(
                          selectedType.Price * global.ViewingCurrency.Ratio,
                        ),
                      )}
                    </Text>
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
                  keyExtractor={(item, index) => index.toString()}
                  data={PaymentMethods}
                  numColumns={2}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity
                        style={[
                          {
                            backgroundColor: '#fff',
                            padding: 15,
                            borderRadius: 15,
                            marginBottom: 20,
                            //    width: "90%",
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: 'row',
                            elevation: 1,
                            marginHorizontal: 10,
                          },
                        ]}
                        onPress={() => {
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
                    // else
                    // return(<View/>)
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
        <Modal
          ref={PaymentModal}
          coverScreen
          //isOpen
          statusBarTranslucent
          backdropPressToClose
          backButtonClose
          swipeToClose={false}
          style={styles.modalStyle}>
          <View
            style={{
              zIndex: 200,
              //elevation:10,
              minHeight: 50,
              paddingTop: isIphoneX() ? 20 : 10,
              paddingBottom: 10,
              width: Dimensions.get('screen').width,
              //backgroundColor: "red",
              //elevation: 1,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 20,
                justifyContent: 'space-between',
              }}>
        
            </View>
          </View>
          <WebView
            thirdPartyCookiesEnabled={true}
            originWhitelist={['*']}
            mixedContentMode={'always'}
            domStorageEnabled={true}
            allowUniversalAccessFromFileURLs={true}
            onLoadStart={() => {
              console.log(
                `https://autobeeb.com/MobileCreditCardPayment?uid=${
                  (route.params?.User || {ID: ''}).ID
                }&packageID=${
                  selectedType.ID
                }&gateway=${selectedGateway}&card=${Card}&langid=${
                  Languages.langID
                }&pmid=${pmid}`,
              );
            }}
            javaScriptEnabled={true}
            style={{flex: 1}}
            onMessage={event => {
              let data = JSON.parse(event.nativeEvent.data);
              setLoading(true);
              if (
                data &&
                data?.type === 'cash-payment' &&
                data.success == '1'
              ) {
                navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({routeName: 'App'})],
                  }),
                );
              } else if (data && data.success == '1') {
                KS.UserGet({
                  userID: data.userID,
                  langid: Languages.langID,
                }).then(data2 => {
                  storeUserData(data2.User, () => {
                    navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        key: null,
                        actions: [
                          NavigationActions.navigate({routeName: 'App'}),
                        ],
                      }),
                    );
                  });
                });
              } else if (data && data.success == '0') {
                navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({routeName: 'App'})],
                  }),
                );
              }
            }}
            source={{
              uri: `https://autobeeb.com/MobileCreditCardPayment?uid=${
                (route.params?.User || {ID: ''}).ID
              }&packageID=${
                selectedType.ID
              }&gateway=${selectedGateway}&card=${Card}&langid=${
                Languages.langID
              }&pmid=${pmid}`,
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
        </Modal>
      </Modal>

      <FlatList
        ListHeaderComponent={() => {
          return (
            <Text style={styles.headerText}>{Languages.SelectPlanType}</Text>
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: 15,
          flexGrow: 1,
          paddingBottom: 15,
        }}
        keyExtractor={(item, index) => index.toString()}
        data={Plans?.sort((a, b) => a.ExtraOffers - b.ExtraOffers)}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={{
                backgroundColor: '#FFF',
                marginTop: 15,
                borderRadius: 5,
                overflow: 'hidden',
                elevation: 5,
              }}
              activeOpacity={0.9}
              onPress={() => {
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
                setselectedType(item);
                PaymentMethodModalRef.current.open();
              }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 25,
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
                      style={[
                        styles.planName,
                        {fontFamily: Constants.fontFamilyBold},
                      ]}>
                      {item.PeriodInterval}
                    </Text>
                    <Text style={[styles.planName, {fontSize: 14}]}>
                      {PlanPeriodType(item.PeriodType)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.planName, {flex: 1, textAlign: 'center'}]}>
                  {item.Name + '\n'}
                  <Text
                    style={[
                      styles.planPrice,
                      {
                        color: colors[index],
                        textAlign: 'center',
                      },
                    ]}>
                    {item.Price == 0 ? Languages.Free : '$' + item.Price}
                  </Text>
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
                    <Text style={[styles.planName, {fontSize: 14}]}>
                      {Languages.Ad}
                    </Text>
                    <Text
                      style={[
                        styles.planName,
                        {fontFamily: Constants.fontFamilyBold},
                      ]}>
                      {item.ExtraOffers}
                    </Text>
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
        }}
      />
    </View>
  );
};

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

export default connect(undefined, mapDispatchToProps)(SpecialSubscription);

const styles = StyleSheet.create({
  modalStyle: {
    flex: 1,
  },
  planPrice: {
    flex: 1,
    fontSize: 20,
    fontFamily: Constants.fontFamilyBold,
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
});

*/
