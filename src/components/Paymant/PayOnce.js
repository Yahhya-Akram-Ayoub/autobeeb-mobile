import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import {Languages, Color, Constants} from '../../common';
import HTML, {IGNORED_TAGS} from 'react-native-render-html';
import {
  NavigationActions,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {WebView} from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AutobeebModal from '../Modals/AutobeebModal';

const screenWidth = Dimensions.get('screen').width;

const PayOnce = ({
  plans,
  OpenModal,
  User,
  Offer,
  selectedPlan,
  clearSelectedPlan,
  isModal,
  setOpenModal,
  countryId,
}) => {
  const [PaymentMethods, setPaymentMethods] = useState([
    {
      ID: 1,
      Name: 'PayPal',
      localImage: true,
      Image: require('../../images/paypal.png'),
    },
    {
      ID: 2,
      Name: 'Visa',
      Image: 'https://1000logos.net/wp-content/uploads/2017/06/VISA-logo.png',
      localImage: true,
      Image: require('../../images/visa.png'),
    },
    {
      ID: 3,
      Name: 'Mastercard',
      localImage: true,
      Image: require('../../images/mastercard.png'),
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
  const [selectedGateway, setSelectedGateway] = useState(null);

  const PaymentMethodModalRef = useRef(null);
  const PaymentModal = useRef(null);
  const plansListRef = useRef(null);
  const navigation = useNavigation();
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
    var tempPaymentMethods = [...PaymentMethods];

    if (NonPayssionCountries.includes(countryId)) {
      tempPaymentMethods = [
        ...tempPaymentMethods.filter(
          x => x.Name !== 'Unionpay' && x.Name !== 'alipay',
        ),
      ];
    }
    if (NonCardCountries.includes(countryId)) {
      tempPaymentMethods = [
        ...tempPaymentMethods.filter(
          x => x.Name !== 'Visa' && x.Name !== 'Mastercard',
        ),
      ];
    }
    if (!UnionPayCountries.includes(countryId)) {
      tempPaymentMethods = [
        ...tempPaymentMethods.filter(x => x.Name !== 'Unionpay'),
      ];
    }
    if (aliPaymentCountries.includes(countryId)) {
      tempPaymentMethods = [
        ...tempPaymentMethods.filter(x => x.Name !== 'alipay'),
      ];
    }
    if (!BankCountries.includes(countryId) || Languages.prefix != 'ar') {
      tempPaymentMethods = [
        ...tempPaymentMethods.filter(x => x.Name !== 'Cash'),
      ];
    }
    setPaymentMethods([...tempPaymentMethods]);
  }, []);

  useEffect(() => {
    if (OpenModal) PaymentMethodModalRef.current?.open();
  }, [OpenModal, PaymentMethodModalRef]);

  const lang = Languages.getLanguage();

  function handlePaymentMethod(PaymentMethod) {
    const GatewayType = Object.freeze({
      Payssion: 9,
      Paypal: 11,
      IAPApple: 12,
      IAPAndroid: 13,
      BankTransfer: 15,
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
    // to save record open card in admin
    fetch(
      `https://autobeeb.com/${lang}/special-do-pay/${!!Offer ? Offer.ID : ''}/${
        selectedPlan?.Id
      }/${'15'}?userID=${User?.ID}&id=${User?.ID}`,
    ).then(res => {});

    // navigation.goBack();
    navigation.navigate('CliQScreen', {
      Price: selectedPlan.Price,
      PlanName: selectedPlan.Name,
    });
  }

  async function handleHyperPay(gateway) {
    setSelectedGateway(gateway);
    PaymentModal.current.open();
  }

  const htmlStyle =
    `<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Cairo"><style> *{direction:` +
    (Languages.langID == '2' ? 'rtl' : 'ltr') +
    `; font-family:'cairo'}li{ font-size:35px; text-align:` +
    (Languages.langID == '2' ? 'right' : 'left') +
    `;padding:5px}</style>`;
  const webViewScript = `setTimeout(function() {     window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);   }, 500);  true; `;

  return (
    <View>
      {isModal ? (
        <AutobeebModal
          ref={PaymentMethodModalRef}
          coverScreen
          statusBarTranslucent
          backdropPressToClose
          useNativeDriver={false}
          backButtonClose
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
                  clearSelectedPlan();
                  PaymentMethodModalRef.current.close();
                  setOpenModal(false);
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
                            Math.round(
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
                            textAlign:
                              Languages.langID == '2' ? 'right' : 'left',
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
        </AutobeebModal>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#F8F8F8',
          }}>
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

      <AutobeebModal
        ref={PaymentModal}
        coverScreen
        statusBarTranslucent
        backdropPressToClose
        backButtonClose
        swipeToClose={false}
        style={styles.modalStyle}>
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
            }}>
            <TouchableOpacity
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              style={{
                paddingLeft: 15,
              }}
              onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={25} color={'black'} />
            </TouchableOpacity>
          </View>
        </View>
        <WebView
          thirdPartyCookiesEnabled={true}
          originWhitelist={['*']}
          mixedContentMode={'always'}
          domStorageEnabled={true}
          allowUniversalAccessFromFileURLs={true}
          javaScriptEnabled={true}
          style={{flex: 1}}
          onMessage={event => {
            PaymentMethodModalRef.current.close();
            PaymentModal.current.close();
            navigation.navigate('HomeScreen');
          }}
          source={{
            uri: `https://autobeeb.com/${lang}/special-do-pay/${
              !!Offer ? Offer.ID : ''
            }/${selectedPlan?.Id}/${selectedGateway}?userID=${User?.ID}&id=${
              User?.ID
            }`,
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

const styles = StyleSheet.create({
  planPrice: {
    fontSize: 24,
    color: Color.primary,
  },
});

const mapStateToProps = ({user, menu}) => ({
  userData: user.user,
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = dispatch => {
  const UserActions = require('../../redux/UserRedux');
  const {actions} = require('../../redux/RecentListingsRedux');

  return {
    storeUserData: (user, callback) =>
      UserActions.actions.storeUserData(dispatch, user, callback),
    updateRecentlySeenListings: (listing, callback) => {
      actions.updateRecentlySeenListings(dispatch, listing, callback);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PayOnce);
