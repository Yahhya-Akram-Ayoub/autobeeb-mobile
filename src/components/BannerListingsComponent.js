//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Platform,
  Pressable,
  FlatList,
} from 'react-native';
import {Color, Languages} from '../common';
import {SpecialSVG} from '../components';
import IconFa from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Moment from 'moment';
import IconEn from 'react-native-vector-icons/Entypo';
import IconFa5 from 'react-native-vector-icons/FontAwesome5';
import FastImage from 'react-native-fast-image';
import {toast} from '../Omni';
import KS from '../services/KSAPI';
import Svg, {Path} from 'react-native-svg';
import ShareLib from 'react-native-share';

// create a component
class BannerListings extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageIndex: 0,
      Favorite: true,
    };
  }

  getShareMessage = item => {
    return (
      (I18nManager.isRTL
        ? 'https://autobeeb.com/ar/ads/'
        : 'https://autobeeb.com/ads/') +
      item.Name.replace(/\ /g, '-') +
      '/' +
      item.ID +
      '/' +
      item.TypeID
    );
  };

  shareOnSocial = async item => {
    const options = {
      url: `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`,
      message: `${Languages.CheckOffer}\n${this.getShareMessage(item)}`,
    };
    options.social = ShareLib.Social.FACEBOOK;

    try {
      await ShareLib.shareSingle(options);
    } catch (error) {
      console.log('Error =>', ShareLib);
      console.log('Error =>', error);
    }
  };

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

  render() {
    const item = this.props.item?.item?.m_Item2 || this.props.item;
    this.sellTypes = [
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('../images/SellTypes/WhiteSale.png'),
        linearColors: ['#0F93DD', '#0f93dd96', '#0f93dd47', '#0f93dd38'],
        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('../images/SellTypes/WhiteRent.png'),
        linearColors: ['#F68D00', '#F68D0096', '#F68D0047', '#F68D0038'],
        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require('../images/SellTypes/WhiteWanted.png'),
        linearColors: ['#D31018', '#D3101896', '#D3101847', '#D3101838'],
        backgroundColor: '#D31018',
      },
    ];
    //const item = this.props.item;
    const DifferentCountry =
      (this.props.AppCountryCode != 'ALL' &&
        (this.props.AllCountries ||
          item.ISOCode != this.props.AppCountryCode)) ||
      (this.props.SelectedCities &&
        this.props.SelectedCities[0].ID != '' &&
        !this.props.SelectedCities.find(x => x.ID == item.CityID));
    return (
      <View
        key={item.ID}
        style={[
          {
            marginBottom: 10,
            elevation: 1,
          },
          this.props.isListingsScreen && {
            height: Dimensions.get('screen').height * 0.36,
          },
          DifferentCountry && {
            borderWidth: 2,
            borderColor: Color.primary,
            overflow: 'hidden',
            width: Dimensions.get('window').width * 0.96,
            alignSelf: 'center',
            borderRadius: 5,
          },
        ]}>
        <View>
          {!item.IsSpecial ? (
            <TouchableOpacity
              key={item.ID}
              style={[
                this.props.itemStyle || {
                  elevation: 3,
                  borderTopWidth: DifferentCountry ? 0 : 1,
                  width: Dimensions.get('window').width * 0.95,
                  height: Dimensions.get('window').width / 1.77,
                  borderWidth: 0,
                  borderColor: '#eee',
                  overflow: 'hidden',
                  borderTopColor: '#eee',
                  justifyContent: 'space-between',
                  shadowColor: '#fff',
                  shadowOpacity: 0.2,
                  shadowOffset: {
                    width: 1,
                    height: 2,
                  },
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  alignSelf: 'center',
                },
                !item.PartNumber &&
                  !(item.IsDealer && item.OwnerName) && {
                    borderRadius: 5,
                  },
              ]}
              onPress={() =>
                this.props.navigation.push('CarDetails', {
                  item: item,
                })
              }>
              {item.Images && item.Images.length > 1 && (
                <TouchableOpacity
                  hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                  onPress={() => {
                    this.setState({imageIndex: this.state.imageIndex - 1});
                  }}
                  disabled={this.state.imageIndex === 0}
                  style={{
                    position: 'absolute',
                    top: 80,
                    left: 10,
                    zIndex: 9999,
                    elevation: 9999,
                  }}>
                  <IconEn
                    name={
                      I18nManager.isRTL
                        ? 'chevron-small-right'
                        : 'chevron-small-left'
                    }
                    size={35}
                    color={this.state.imageIndex === 0 ? 'gray' : Color.primary}
                  />
                </TouchableOpacity>
              )}

              {item.Images && item.Images.length > 1 && (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({imageIndex: this.state.imageIndex + 1});
                  }}
                  hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                  disabled={
                    this.state.imageIndex + 1 >= (item.Images?.length ?? 0)
                  }
                  style={{
                    position: 'absolute',
                    top: 80,
                    right: 10,
                    zIndex: 9999,
                    elevation: 9999,
                  }}>
                  <IconEn
                    name={
                      I18nManager.isRTL
                        ? 'chevron-small-left'
                        : 'chevron-small-right'
                    }
                    size={35}
                    color={
                      this.state.imageIndex + 1 >= (item.Images?.length ?? 0)
                        ? 'gray'
                        : Color.primary
                    }
                  />
                </TouchableOpacity>
              )}

              <View style={{}}>
                {!!item.ThumbURL && !this.state.FailOverImage ? (
                  <FastImage
                    style={
                      this.props.imageStyle || {
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').width / 1.77,
                        borderColor: '#fff',
                      }
                    }
                    source={{
                      uri:
                        'https://autobeeb.com/' +
                        item.ImageBasePath +
                        item.Images[this.state.imageIndex] +
                        '_750x420.jpg',
                      cache:
                        Platform.OS === 'ios'
                          ? FastImage.cacheControl.immutable //wasnt working needed to be default before thats why ill leave the check for now
                          : FastImage.cacheControl.immutable,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    onError={() => {
                      this.setState({FailOverImage: true});
                    }}
                  />
                ) : (
                  <View style={{}}>
                    <View
                      style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').width / 1.77,
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        //   zIndex: 5,
                        backgroundColor: 'rgba(28,126,164,0.1)',
                      }}
                    />
                    <FastImage
                      style={{
                        marginTop: 15,
                        width: Dimensions.get('window').width * 0.7,
                        height: Dimensions.get('screen').height * 0.2,
                        alignSelf: 'center',
                      }}
                      source={require('../images/placeholder.png')}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                )}

                {!!item.SellType && (
                  <LinearGradient
                    colors={
                      this.sellTypes.find(ST => ST.ID == item.SellType)
                        ?.linearColors
                    }
                    start={{x: 0.9, y: 0}}
                    style={{
                      width: 'auto',
                      padding: 5,
                      position: 'absolute',
                      zIndex: 10,
                      left: 0,
                      top: 0,
                      borderBottomLeftRadius: 5,
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        padding: 3,
                        fontWeight: '900',
                        minWidth: 45,
                        textAlign: 'center',
                      }}>
                      {item.ThumbURL
                        ? this.sellTypes.find(ST => ST.ID == item.SellType)
                            ?.Name
                        : item.TypeName +
                          ' ' +
                          this.sellTypes.find(ST => ST.ID == item.SellType)
                            ?.Name}
                    </Text>
                  </LinearGradient>
                )}

                {this.props.isFavorites && (
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                      backgroundColor: '#fbfbfb',
                      elevation: 3,
                      position: 'absolute',
                      top: 5,
                      right: 5,
                    }}
                    onPress={() => {
                      KS.WatchlistAdd({
                        listingID: item.ID,
                        userid: this.props.user.ID,
                        type: 1,
                      }).then(data => {
                        if (data && data.Success) {
                          this.setState({Favorite: data.Favorite});
                          if (data.Favorite == false) {
                            this.props.removeFavorite(item.ID);
                          }
                        }
                      });
                    }}>
                    <IconFa
                      name={this.state.Favorite ? 'heart' : 'heart-o'}
                      size={20}
                      color={this.state.Favorite ? Color.primary : 'black'}
                    />
                  </TouchableOpacity>
                )}
                {DifferentCountry && (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      position: 'absolute',
                      zIndex: 999,
                      top: 0,
                      width: '100%',
                      height: Dimensions.get('screen').width * 1.77,
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  width: Dimensions.get('screen').width,
                  bottom: 0,
                }}>
                <LinearGradient
                  colors={[
                    'rgba(0,0,0,0)',
                    // "rgba(0,0,0,0.3)",
                    'rgba(0,0,0,0.5)',
                    'rgba(0,0,0,.7)',
                  ]}
                  style={{
                    width: Dimensions.get('screen').width,
                    padding: 5,
                  }}>
                  {item.Images && item.Images.length > 0 && (
                    <Text
                      style={{color: '#fff', fontSize: 18, textAlign: 'left'}}>
                      {this.state.imageIndex + 1 + '/' + item.Images.length}
                    </Text>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',

                      //     justifyContent: "space-between"
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {!!item.FormatedPrice && (
                        <Text
                          style={{
                            fontSize: 18,
                            color: '#fff',
                            textAlign: 'left',
                          }}>
                          {item.FormatedPrice
                            ? item.FormatedPrice
                            : Languages.CallForPrice}
                        </Text>
                      )}

                      {item.PaymentMethod && item.PaymentMethod == 2 && (
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={{color: '#fff', fontSize: 15}}>
                            {'  / ' + Languages.Installments}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    {
                      <FastImage
                        style={{width: 30, height: 30, marginRight: 5}}
                        resizeMode={FastImage.resizeMode.contain}
                        source={
                          this.props.AllCountries ||
                          item.ISOCode != this.props.AppCountryCode
                            ? {
                                uri:
                                  'https://autobeeb.com/wsImages/flags/' +
                                  item.ISOCode +
                                  '.png',
                              }
                            : item.TitleFullImagePath
                            ? {
                                uri:
                                  'https://autobeeb.com/' +
                                  item.TitleFullImagePath +
                                  '_300x150.png',
                              }
                            : item.TypeID == 16
                            ? {
                                uri:
                                  'https://autobeeb.com/content/newlistingcategories/' +
                                  '16' +
                                  item.CategoryID +
                                  '/' +
                                  +item.CategoryID +
                                  '_300x150.png',
                              }
                            : {
                                uri:
                                  'https://autobeeb.com/content/newlistingmakes/' +
                                  item.MakeID +
                                  '/' +
                                  item.MakeID +
                                  '_240x180.png',
                              }
                        }
                      />
                    }
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#fff',
                        textAlign: 'left',
                        maxWidth: Dimensions.get('screen').width * 0.85,
                      }}>
                      {item.Name}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ) : (
            <Pressable
              onPress={() =>
                this.props.navigation.push('CarDetails', {
                  item: item,
                })
              }
              style={[
                this.props.itemStyle || {
                  elevation: 3,
                  borderTopWidth: DifferentCountry ? 0 : 1,
                  width: Dimensions.get('window').width * 0.95,
                  height: Dimensions.get('window').width / 1.77,
                  borderWidth: 0,
                  borderColor: '#eee',
                  overflow: 'hidden',
                  borderTopColor: '#eee',
                  justifyContent: 'space-between',
                  shadowColor: '#fff',
                  shadowOpacity: 0.2,
                  shadowOffset: {
                    width: 1,
                    height: 2,
                  },
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  alignSelf: 'center',
                },
                !item.PartNumber &&
                  !(item.IsDealer && item.OwnerName) && {
                    borderRadius: 5,
                  },
              ]}>
              <View>
                {!!item.ThumbURL ? (
                  <FlatList
                    contentContainerStyle={{
                      alignSelf: 'flex-start',
                      gap: 15,
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    data={item.Images}
                    directionalLockEnabled={true}
                    alwaysBounceVertical={false}
                    scrollEnabled={true}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={true}
                    renderItem={_item => {
                      return (
                        <Pressable
                          onPress={() =>
                            this.props.navigation.push('CarDetails', {
                              item: item,
                            })
                          }>
                          <FastImage
                            style={{
                              width:
                                Dimensions.get('window').width -
                                (item.Images?.length < 2 ? 0 : 75),
                              height: Dimensions.get('window').width / 1.77,
                              borderColor: '#fff',
                              borderRadius: 10,
                            }}
                            source={{
                              uri: `https://autobeeb.com/${item.ImageBasePath}${_item.item}_750x420.jpg`,
                              cache: FastImage.cacheControl.immutable,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        </Pressable>
                      );
                    }}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.push('CarDetails', {
                        item: item,
                      })
                    }>
                    <View
                      style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').width / 1.77,
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        //   zIndex: 5,
                        backgroundColor: 'rgba(28,126,164,0.1)',
                      }}
                    />
                    <FastImage
                      style={{
                        marginTop: 15,
                        width: Dimensions.get('window').width * 0.7,
                        height: Dimensions.get('screen').height * 0.2,
                        alignSelf: 'center',
                      }}
                      source={require('../images/placeholder.png')}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </TouchableOpacity>
                )}

                {!!item.SellType && (
                  <Text
                    style={{
                      color: '#fff',
                      backgroundColor: this.sellTypes.find(
                        ST => ST.ID == item.SellType
                      )?.backgroundColor,
                      padding: 3,
                      minWidth: 45,
                      textAlign: 'center',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                    }}>
                    {item.ThumbURL
                      ? this.sellTypes.find(ST => ST.ID == item.SellType)?.Name
                      : item.TypeName +
                        ' ' +
                        this.sellTypes.find(ST => ST.ID == item.SellType)?.Name}
                  </Text>
                )}
                {this.props.isFavorites && (
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                      backgroundColor: '#fbfbfb',
                      elevation: 3,
                      position: 'absolute',
                      top: 5,
                      right: 5,
                    }}
                    onPress={() => {
                      KS.WatchlistAdd({
                        listingID: item.ID,
                        userid: this.props.user.ID,
                        type: 1,
                      }).then(data => {
                        if (data && data.Success) {
                          this.setState({Favorite: data.Favorite});
                          if (data.Favorite == false) {
                            this.props.removeFavorite(item.ID);
                          }
                        }
                      });
                    }}>
                    <IconFa
                      name={this.state.Favorite ? 'heart' : 'heart-o'}
                      size={20}
                      color={this.state.Favorite ? Color.primary : 'black'}
                    />
                  </TouchableOpacity>
                )}
                {!item.IsSpecial && DifferentCountry && (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      position: 'absolute',
                      zIndex: 999,
                      top: 0,
                      width: '100%',
                      height: Dimensions.get('screen').width * 1.77,
                    }}
                  />
                )}
              </View>

              <View
                style={{
                  //    backgroundColor: "rgba(0,0,0,0.2)",
                  position: 'absolute',
                  width: Dimensions.get('screen').width,
                  bottom: 0,
                  //   minHeight: 68,
                }}>
                <LinearGradient
                  colors={[
                    'rgba(0,0,0,0)',
                    // "rgba(0,0,0,0.3)",
                    'rgba(0,0,0,0.5)',
                    'rgba(0,0,0,.7)',
                  ]}
                  style={{
                    width: Dimensions.get('screen').width,
                    padding: 5,
                  }}>
                  {item.Images && item.Images.length > 0 && (
                    <Text
                      style={{color: '#fff', fontSize: 18, textAlign: 'left'}}>
                      {this.state.imageIndex + 1 + '/' + item.Images.length}
                    </Text>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',

                      //     justifyContent: "space-between"
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {!!item.FormatedPrice && (
                        <Text
                          style={{
                            fontSize: 18,
                            color: '#fff',
                            textAlign: 'left',
                          }}>
                          {item.FormatedPrice
                            ? item.FormatedPrice
                            : Languages.CallForPrice}
                        </Text>
                      )}

                      {item.PaymentMethod && item.PaymentMethod == 2 && (
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={{color: '#fff', fontSize: 15}}>
                            {'  / ' + Languages.Installments}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    {
                      <FastImage
                        style={{width: 30, height: 30, marginRight: 5}}
                        resizeMode={FastImage.resizeMode.contain}
                        source={
                          this.props.AllCountries ||
                          item.ISOCode != this.props.AppCountryCode
                            ? {
                                uri:
                                  'https://autobeeb.com/wsImages/flags/' +
                                  item.ISOCode +
                                  '.png',
                              }
                            : item.TitleFullImagePath
                            ? {
                                uri:
                                  'https://autobeeb.com/' +
                                  item.TitleFullImagePath +
                                  '_300x150.png',
                              }
                            : item.TypeID == 16
                            ? {
                                uri:
                                  'https://autobeeb.com/content/newlistingcategories/' +
                                  '16' +
                                  item.CategoryID +
                                  '/' +
                                  +item.CategoryID +
                                  '_300x150.png',
                              }
                            : {
                                uri:
                                  'https://autobeeb.com/content/newlistingmakes/' +
                                  item.MakeID +
                                  '/' +
                                  item.MakeID +
                                  '_240x180.png',
                              }
                        }
                      />
                    }
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#fff',
                        textAlign: 'left',
                        maxWidth: Dimensions.get('screen').width * 0.85,
                      }}>
                      {item.Name}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </Pressable>
          )}

          {!!item.Views &&
            !!this.props.user?.IsDealer &&
            item.OwnerID == this.props.user?.ID && (
              <View
                style={{
                  width: 'auto',
                  padding: 5,
                  position: 'absolute',
                  zIndex: 10,
                  right: 5,
                  top: 5,
                  borderRadius: 5,
                  backgroundColor: Color.primary,
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                }}>
                <IconFa5 name={'eye'} size={15} color={'#fff'} />
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: 13,
                    textAlign: 'center',
                  }}>
                  {item.Views}
                </Text>
              </View>
            )}
          <Pressable
            onPress={() => {
              this.shareOnSocial(item);
            }}
            style={{
              width: 'auto',
              padding: 5,
              position: 'absolute',
              zIndex: 10,
              right: item.OwnerID === this.props.user?.ID ? 5 : 15,
              bottom: 5,
              borderRadius: 5,
              backgroundColor: '#fff00',
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}>
            <FacebookIcon size={32} />
          </Pressable>
        </View>

        {this.props.user &&
          !this.props.user.EmailRegister &&
          this.props.user.OTPConfirmed == false &&
          this.props.activeOffers && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: 5,
                width: Dimensions.get('window').width * 0.95,
              }}>
              <View
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  padding: 10,
                }}>
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('EditProfile', {
                      ChangePhone: true,
                    });
                  }}>
                  <Text style={{color: '#000', textAlign: 'center'}}>
                    {Languages.EnterCodeToPublish + this.props.user.Phone}
                    <Text style={{color: '#00f'}}>
                      {' (' + Languages.Change + ')'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'green',
                    alignSelf: 'center',
                    marginVertical: 10,
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    this.props.onVerify();
                  }}>
                  <Text style={{color: '#fff'}}>{Languages.VerifyNow}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {this.props.user &&
          this.props.user.EmailRegister &&
          this.props.user.EmailConfirmed == false &&
          this.props.activeOffers && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: 5,
                width: Dimensions.get('window').width * 0.95,
              }}>
              <View
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  padding: 10,
                }}>
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('EditProfile', {
                      ChangeEmail: true,
                    });
                  }}>
                  <Text style={{color: '#000', textAlign: 'center'}}>
                    {Languages.EnterCodeToPublish + this.props.user.Email}
                    <Text style={{color: '#00f'}}>
                      {' (' + Languages.Change + ')'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'green',
                    alignSelf: 'center',
                    marginVertical: 10,
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    this.props.onVerify();
                  }}>
                  <Text style={{color: '#fff'}}>{Languages.VerifyNow}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {this.props.user &&
          this.props.user.EmailRegister &&
          this.props.user.EmailConfirmed &&
          this.props.user.EmailApproved == false && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: 5,
                width: Dimensions.get('window').width * 0.95,
              }}>
              <View
                style={{
                  padding: 10,
                }}>
                <Text style={{color: '#000', textAlign: 'center'}}>
                  {Languages.EmailPendingApproval}
                </Text>
              </View>
            </View>
          )}

        {this.props.activeOffers &&
          this.props.active &&
          this.props.user &&
          (this.props.user.OTPConfirmed ||
            (this.props.user.EmailConfirmed &&
              this.props.user.EmailRegister &&
              this.props.user.EmailApproved)) && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: this.props.activeOffers ? 0 : 5,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}>
                {this.state.renewed ? (
                  <Text style={{color: '#000'}}>
                    {Languages.publishedIn + Moment().format('YYYY-MM-DD')}
                  </Text>
                ) : item.TypeID >= 32 && this.props.user?.IsDealer ? (
                  <Text style={{color: '#000'}}>
                    {Languages.publishedIn +
                      Moment(item.DateAdded).format('YYYY-MM-DD')}
                  </Text>
                ) : (
                  <Text style={{color: '#000'}}>
                    {Languages.publishedIn +
                      Moment(item.RenewalDate).format('YYYY-MM-DD')}
                  </Text>
                )}

                {this.props.user?.IsDealer ? (
                  <></>
                ) : this.state.renewed ? (
                  <Text style={{color: 'red'}}>
                    {item.TypeID >= 32 && !this.props.user?.IsDealer
                      ? Languages.To +
                        Moment().add(1, 'year').format('YYYY-MM-DD')
                      : Languages.To +
                        Moment().add(6, 'months').format('YYYY-MM-DD')}
                  </Text>
                ) : (
                  <Text style={{color: 'red'}}>
                    {item.TypeID == 32
                      ? Languages.To +
                        Moment(item.RenewalDate)
                          .add(1, 'year')
                          .format('YYYY-MM-DD')
                      : Languages.To +
                        Moment(item.RenewalDate)
                          .add(6, 'months')
                          .format('YYYY-MM-DD')}
                  </Text>
                )}
              </View>
              {item.IsSpecial &&
              !!this.props.user?.ID &&
              item.OwnerID === this.props.user?.ID ? (
                <View
                  style={[
                    styles.SellFast,
                    {
                      paddingVertical: 5,
                      backgroundColor: 'red',
                      borderRadius: 5,
                      marginVertical: 2,
                    },
                  ]}>
                  <View style={styles.SellFastBox}>
                    <Text style={styles.SellFastTile}>
                      {Languages.FeaturedUntil}
                      {new Date(item.SpecialExpiryDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ) : (
                // Omar khattab
                <TouchableOpacity
                  onPress={() => {
                    if (item.OwnerID === this.props.user?.ID) {
                      this.props.navigation.navigate('SpecialPlans', {
                        Offer: item,
                        User: !!this.props.user ? {...this.props.user} : null,
                        Currency:
                          global.ViewingCurrency || this.props.ViewingCurrency,
                        ISOCode: item.ISOCode ?? this.props.AppCountryCode,
                      });
                    } else if (!!!this.props.user?.ID) {
                      this.props.navigation.navigate('PostOfferScreen');
                    } else {
                      this.props.navigation.navigate('ActiveOffers');
                    }
                  }}>
                  <View style={styles.SellFast}>
                    <View style={styles.sellFastBTN}>
                      <IconEn name={'rocket'} size={20} color={'#ffffff'} />
                      <Text style={styles.sellFastBTNText}>
                        {Languages.SpecialYourOfferTitle}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onDeactivate(item);
                  }}>
                  <IconFa
                    name={'trash'}
                    size={25}
                    color={'red'}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Deactivate}</Text>
                </TouchableOpacity>

                {true && (
                  <TouchableOpacity
                    style={styles.userButton}
                    onPress={() => {
                      this.props.onEdit(item);
                    }}>
                    <IconFa
                      name={'edit'}
                      size={25}
                      color={Color.secondary}
                      style={{marginTop: 5}}
                    />
                    <Text style={{color: '#000'}}>{Languages.Edit}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onShare(item);
                  }}>
                  <IconFa
                    name={'share-alt'}
                    size={25}
                    color={Color.secondary}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.ShareOffer}</Text>
                </TouchableOpacity>
                {!(item.TypeID >= 32 && this.props.user?.IsDealer) && (
                  <TouchableOpacity
                    style={styles.userButton}
                    onPress={() => {
                      KS.RenewOffer({listingid: item.ID}).then(data => {
                        if (data && data.Success) {
                          if (data.Status == 1) {
                            this.setState({renewed: true});
                          } else {
                            toast(Languages.CantRenew, 3000);
                          }
                        }
                      });
                    }}>
                    <IconEn
                      name={'cycle'}
                      size={25}
                      color={Color.primary}
                      style={{marginTop: 5}}
                    />
                    <Text style={{color: '#000'}}>{Languages.Renew}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

        {this.props.activeOffers &&
          !this.props.active &&
          this.props.user &&
          (this.props.user.OTPConfirmed ||
            (this.props.user.EmailConfirmed &&
              this.props.user.EmailRegister &&
              this.props.user.EmailApproved)) && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: this.props.activeOffers ? 0 : 5,
              }}>
              {item.IsSpecial &&
              !!this.props.user?.ID &&
              item.OwnerID === this.props.user?.ID ? (
                <Pressable
                  style={[
                    styles.SellFast,
                    {
                      paddingVertical: 5,
                      backgroundColor: 'red',
                      borderRadius: 5,
                      marginVertical: 2,
                    },
                  ]}
                  onPress={() =>
                    this.props.navigation.push('CarDetails', {
                      item: item,
                    })
                  }>
                  <View style={[styles.SellFastBox]}>
                    <Text style={styles.SellFastTile}>
                      {Languages.FeaturedUntil}
                      {new Date(item.SpecialExpiryDate).toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                // Omar khattab
                <TouchableOpacity
                  onPress={() => {
                    if (item.OwnerID === this.props.user?.ID) {
                      this.props.navigation.navigate('SpecialPlans', {
                        Offer: item,
                        User: !!this.props.user ? {...this.props.user} : null,
                        Currency:
                          global.ViewingCurrency || this.props.ViewingCurrency,
                        ISOCode: item.ISOCode ?? this.props.AppCountryCode,
                      });
                    } else if (!!!this.props.user?.ID) {
                      this.props.navigation.navigate('PostOfferScreen');
                    } else {
                      this.props.navigation.navigate('ActiveOffers');
                    }
                  }}>
                  <View style={styles.SellFast}>
                    <View style={styles.sellFastBTN}>
                      <IconEn name={'rocket'} size={20} color={'#ffffff'} />
                      <Text style={styles.sellFastBTNText}>
                        {Languages.SpecialYourOfferTitle}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',

                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    color: '#f00',
                    textAlign: 'left',
                    maxWidth: Dimensions.get('screen').width * 0.8,
                  }}
                  numberOfLines={2}>
                  {Languages.ThisOfferWillBeDeleted +
                    ' ' +
                    Moment(item.RenewalDate)
                      .add(3, 'months')
                      .format('YYYY-MM-DD')}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onDelete(item);
                  }}>
                  <IconFa
                    name={'trash'}
                    size={25}
                    color={'red'}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Delete}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onEdit(item);
                  }}>
                  <IconFa
                    name={'edit'}
                    size={25}
                    color={Color.secondary}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Edit}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onActivate(item);
                  }}>
                  <IconFa
                    name={'upload'}
                    size={25}
                    color={'green'}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Activate}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        <View
          style={[
            {
              backgroundColor: '#fff',
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              elevation: 1,
              alignSelf: 'center',
              overflow: 'hidden',
              width: Dimensions.get('screen').width * 0.95,
            },
            this.props.activeOffers && {
              borderTopWidth: 1,
              borderTopColor: '#ddd',
            },
          ]}>
          {item.PartNumber && (
            <Text style={{paddingHorizontal: 10}}>
              <Text style={{color: Color.secondary}}>{Languages.PartNo}:</Text>
              {` ${item.PartNumber}`}
            </Text>
          )}

          {item.IsDealer && item.OwnerName && !this.props.activeOffers && (
            <Text
              numberOfLines={1}
              style={{
                paddingHorizontal: 10,
                alignSelf: 'center',
                textAlign: 'left',
                width: Dimensions.get('screen').width * 0.95,
              }}>
              {item.OwnerName}
            </Text>
          )}
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  userButton: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
    //   backgroundColor: "red"
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  sellFastBTN: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
    height: 35,
    width: '100%',
    alignSelf: 'center',
  },
  sellFastBTNText: {
    color: '#ffffff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 2,
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
    // backgroundColor: '#ffffff',
    backgroundColor: Color.primary,
    borderRadius: 5,
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
    height: 35,
    width: '92%',
    alignSelf: 'center',
  },
  sellFastBTNText: {
    color: '#ffffff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  SellFast: {
    backgroundColor: Color.primary,
    padding: 0,
    gap: 5,
    borderRadius: 5,
    marginVertical: 2,
  },
  SellFastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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

//make this component available to the app
export default BannerListings;
