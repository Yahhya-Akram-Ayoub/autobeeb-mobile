//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Platform,
  Linking,
  Pressable,
} from 'react-native';
import {Color, Languages} from '../../common';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconIon from 'react-native-vector-icons/Ionicons';
import Communications from 'react-native-communications';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import KS from '../../services/KSAPI';
import LinearGradient from 'react-native-linear-gradient';
import {LinearGradientLable} from './LinearGradientLable';

const PLACEHOLDER_IMAGE = require('../../images/placeholder.png');
class Cards extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      Favorite: (this.props.item?.Item2 || this.props.item).Favorite,
    };
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

  findSellType(item) {
    let sellTypes = [
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('../../images/SellTypes/WhiteSale.png'),
        linearColors: ['#0F93DD', '#0f93dd96', '#0f93dd38'],
        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('../../images/SellTypes/WhiteRent.png'),
        linearColors: ['#F68D00', '#F68D0096', '#F68D0038'],
        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require('../../images/SellTypes/WhiteWanted.png'),
        linearColors: ['#D31018', '#D3101896', '#D3101838'],
        backgroundColor: '#D31018',
      },
    ];
    return sellTypes.find(ST => ST.ID == item.SellType);
  }
  render() {
    const item = this.props.item?.Item2 || this.props.item;

    const isOnline = this.props.chat.onlineUsers?.includes(item.OwnerID);
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
          this.props.itemStyle || {
            marginHorizontal: 5,
            elevation: 2,

            borderWidth: 0,
            overflow: 'hidden',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: {
              width: 1,
              height: 2,
            },
            marginTop: 5,
            marginBottom: 15,
            borderRadius: 5,
            overflow: 'hidden',
            marginRight: 5,
            backgroundColor: '#fff',
            width: Dimensions.get('window').width * 0.45,
          },
          this.props.isListingsScreen && {
            height: Dimensions.get('screen').height * 0.38,
          },
          DifferentCountry && {
            borderWidth: 2,
            borderColor: Color.primary,
          },
          {
            borderWidth: 0,
            elevation: 0,
            borderRadius: 12,
          },
          item.IsSpecial ? styles.SpecialShadow : null,
        ]}>
        <TouchableOpacity
          activeOpacity={0.6}
          key={item.ID}
          style={[
            {
              flex: 1,
              backgroundColor: '#fff',
              borderWidth: 0,
            },
          ]}
          onPress={() =>
            this.props.navigation.navigate('CarDetails', {
              item: item,
            })
          }>
          <View
            style={{
              // overflow: 'hidden',
              marginBottom: 8,
              borderWidth: 0,
            }}>
            {!!item.ThumbURL && !this.state.FailOverImage ? (
              <FastImage
                style={[
                  !!this.props.imageStyle
                    ? {...this.props.imageStyle}
                    : {
                        ...this.props.imageStyle,
                        width: Dimensions.get('window').width * 0.45,
                        height: Dimensions.get('window').height * 0.2,
                      },
                  {
                    borderRadius: 12,
                  },
                  DifferentCountry && {
                    borderColor: '#f00707',
                    borderWidth: 1,
                  },
                ]}
                source={{
                  uri:
                    'https://autobeeb.com/' +
                    item.FullImagePath +
                    '_400x400.jpg',
                }}
                resizeMode="cover"
                onError={() => {
                  this.setState({FailOverImage: true});
                }}
              />
            ) : (
              <View
                style={[
                  {},
                  DifferentCountry && {
                    borderColor: '#f00707',
                    borderWidth: 1,
                    borderRadius: 10,
                  },
                ]}>
                <View
                  style={{
                    width: '100%',
                    height: Dimensions.get('window').height * 0.2,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 5,
                    backgroundColor: 'rgba(28,126,164,0.1)',
                    borderRadius: 10,
                  }}
                />
                <FastImage
                  style={[
                    {
                      width: Dimensions.get('window').width * 0.25,
                      height: Dimensions.get('window').height * 0.2,
                      alignSelf: 'center',
                    },
                  ]}
                  source={PLACEHOLDER_IMAGE}
                  resizeMode="contain"
                />
              </View>
            )}

            {item.IsSpecial && (
              <>
                {Languages.prefix == 'en' || Languages.prefix == 'ar' ? (
                  <View style={styles.specialSiganl}>
                    <Text style={styles.specialSiganlText}>
                      {Languages.SpecialOffer}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.specialSiganl,
                      styles.specialSiganlOtherLang,
                    ]}>
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

            {!!item.SellType && (
              <View style={{position: 'absolute', top: 0}}>
                <LinearGradientLable
                  LinearColors={this.findSellType(item)?.linearColors}
                  Lable={this.findSellType(item).Name}
                />
              </View>
            )}
            <View
              style={{
                textAlign: 'left',
                position: 'absolute',
                backgroundColor: '#122',
                width: 'auto',
                bottom: 5,
                left: 5,
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 3,
                gap: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 12,
                }}>
                {item.Images?.length}
              </Text>
              <IconFa name={'image'} size={12} color={'#fff'} />
            </View>
            {!!(item.Condition == 1) && (
              <View
                style={{
                  backgroundColor: '#2B9531',
                  textAlign: 'right',
                  position: 'absolute',
                  width: 'auto',
                  bottom: 5,
                  right: 5,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 1,
                  gap: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 12,
                  }}>
                  {Languages.New}
                </Text>
              </View>
            )}

            {DifferentCountry && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  position: 'absolute',
                  zIndex: 999,
                  top: 0,
                  width: '100%',
                  height: Dimensions.get('window').height * 0.2,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            paddingBottom: 8,
            borderWidth: 0,
          }}>
          {
            <Pressable
              onPress={() =>
                this.props.navigation.navigate('CarDetails', {
                  item: item,
                })
              }
              style={{
                flex: 1,
                justifyContent: 'space-between',
              }}>
              {item.TypeID != 32 ? (
                <View>
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginHorizontal: 7,
                      justifyContent: 'flex-start',
                    }}>
                    <FastImage
                      style={{
                        width: 30,
                        height: 30,
                      }}
                      resizeMode="contain"
                      source={
                        item.TitleFullImagePath
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

                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#000',
                        fontSize: 15,
                        //   flex: 5,
                        textAlign: 'center',
                        paddingRight: 2,
                      }}>
                      {item.NameFirstPart}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#000',
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    {item.NameSecondPart}
                  </Text>
                </View>
              ) : (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: '#000',
                      fontSize: 15,
                      flex: 1,
                      textAlign: 'center',
                    }}>
                    {item.Name}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  paddingHorizontal: 8,
                }}>
                {!this.props.AllCountries &&
                item.ISOCode == this.props.AppCountryCode ? (
                  <View
                    style={{
                      flex: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    {item.CityName && (
                      <IconFa
                        name="map-marker"
                        size={16}
                        color={Color.secondary}
                        style={{marginRight: 6}}
                      />
                    )}
                    <Text numberOfLines={1} style={{fontSize: 14}}>
                      {item.CityName}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    <Image
                      style={{
                        resizeMode: 'cover',
                        width: 30,
                        height: 20,
                        borderRadius: 3,
                        backgroundColor: 'transparent',
                        opacity: 0.8,
                      }}
                      source={{
                        uri:
                          'https://autobeeb.com/wsImages/flags/' +
                          item.ISOCode +
                          '.png',
                      }}
                    />
                  </View>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#f00707',
                      textAlign: 'left',
                    }}>
                    {item.FormatedPrice ? item.FormatedPrice : ''}
                  </Text>
                  {item.PaymentMethod && item.PaymentMethod == 2 && (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#000',
                          textAlign: 'left',
                        }}>
                        {` - `}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#2B9531',
                          textAlign: 'left',
                        }}>
                        {`${Languages.Installments}`}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </Pressable>
          }

          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 6,
            }}>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: Color.secondary,
                paddingHorizontal: 10,
                borderRadius: 5,
                width: 40,
              }}
              onPress={() => {
                Linking.openURL(`tel:${item.Phone}`);
                KS.UpdateMobileClick({
                  UserId: item.OwnerID,
                  ListingId: item.ID,
                });
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#fff',
                  marginVertical: 10,
                }}>
                <IconFa name="phone" size={16} color={Color.secondary} />
              </Text>
            </TouchableOpacity>

            {(this.props.userData == null ||
              (this.props.userData &&
                this.props.userData.ID != item.OwnerID)) && (
              <TouchableOpacity
                style={[
                  {
                    borderWidth: 1,
                    borderColor: '#2B9531',
                    backgroundColor: isOnline ? 'green' : '#fff',
                    paddingHorizontal: 10,
                    borderRadius: 5,
                    width: 40,
                    position: 'relative',
                  },
                ]}
                onPress={() => {
                  if (this.props.userData) {
                    delete item.Views;
                    KS.AddEntitySession({
                      userID: this.props.userData.ID,
                      targetID: item.OwnerID,
                      relatedEntity: JSON.stringify(item),
                    }).then(data => {
                      this.props.navigation.navigate('ChatScreen', {
                        targetID: item.OwnerID,
                        ownerName: item.OwnerName,
                        description: item.Name,
                        entityID: item.ID,
                        sessionID: data.SessionID,
                      });
                    });
                  } else {
                    this.props.navigation.navigate('LoginScreen');
                  }
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: 'center',
                    color: '#fff',
                    marginVertical: 10,
                  }}>
                  {isOnline ? (
                    <IconIon name="chatbubbles" size={16} color={'#fff'} />
                  ) : (
                    <IconIon
                      name="chatbubbles-outline"
                      size={16}
                      color={'green'}
                    />
                  )}
                </Text>
                {isOnline && (
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 50,
                      backgroundColor: 'green',
                      position: 'absolute',
                      top: -5,
                      end: -5,
                    }}
                  />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                {
                  borderWidth: 1,
                  borderColor: Color.primary,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  width: 40,
                },
              ]}
              onPress={() => {
                if (this.props.userData) {
                  KS.WatchlistAdd({
                    listingID: item.ID,
                    userid: this.props.userData.ID,
                    type: 1,
                  }).then(data => {
                    if (!!data && data.Success == 1) {
                      console.log({data});
                      item.Favorite = data.Favorite;
                      this.setState({Favorite: data.Favorite});
                    }
                  });
                } else {
                  this.props.navigation.navigate('LoginScreen');
                }
              }}>
              <Text
                numberOfLines={1}
                style={{
                  textAlign: 'center',
                  color: '#fff',
                  marginVertical: 10,
                }}>
                {this.state.Favorite ? (
                  <IconIon name="heart" size={16} color={Color.primary} />
                ) : (
                  <IconIon
                    name="heart-outline"
                    size={16}
                    color={Color.primary}
                  />
                )}
              </Text>
            </TouchableOpacity>
          </View>
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
  specialSiganl: {
    top: 20,
    right: -60,
    position: 'absolute',
    transform: I18nManager.isRTL ? [{rotate: '315deg'}] : [{rotate: '45deg'}],
    textTransform: 'uppercase',
    paddingVertical: 2,
    paddingHorizontal: 0,
    zIndex: 1,
    width: 200,
    backgroundColor: '#ff1c1a',
    letterSpacing: 0.5,
    backgroundImage: 'radial-gradient(circle, #ff1c1a, #bf0b00)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 0,
  },
  specialSiganlText: {
    color: '#e9ea7b',
    fontSize: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#e5e82c',
    paddingVertical: 2,
  },
  specialSiganlTextOtherLang: {
    borderColor: '#ff1c1a',
    gap: 15,
    flexDirection: 'row',
  },
  specialSiganlOtherLang: {
    backgroundColor: '#e5e82c',
  },
  SpecialShadow: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: Color.primary,
  },
});

//make this component available to the app
const mapStateToProps = ({user, chat}) => ({
  chat: chat,
  userData: user.user,
});

export default connect(mapStateToProps, null)(Cards);
