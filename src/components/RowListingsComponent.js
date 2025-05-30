//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Linking,
} from 'react-native';
import {connect} from 'react-redux';
import {Color, Languages} from '../common';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconIon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import KS from '../services/KSAPI';
// create a component
class RowListingsComponent extends PureComponent {
  constructor(props) {
    super(props);
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
  render() {
    const item = this.props.item?.item?.m_Item2 || this.props.item;
    const isOnline = this.props.chat.onlineUsers?.includes(item.OwnerID);

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
          this.props.itemStyle || {
            elevation: 2,
            borderWidth: 0,
            //overflow: "hidden",
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: {
              width: 1,
              height: 2,
            },
            marginBottom: 5,
            backgroundColor: '#fff',
            width: Dimensions.get('window').width,
            overflow: 'hidden',
          },
          DifferentCountry && {
            borderWidth: 1,
            borderColor: Color.primary,
          },
        ]}>
        <TouchableOpacity
          key={item.ID}
          style={{
            borderRadius: 10,
            borderWidth: 0,
            borderColor: '#eee',
          }}
          onPress={() =>
            this.props.navigation.push('CarDetails', {
              item: item,
              id: item.ID,
            })
          }>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',

              flex: 5,
            }}>
            <View
              style={{
                flex: 2,
                height: Dimensions.get('screen').height * 0.16,
              }}>
              {!!item.ThumbURL ? (
                <FastImage
                  style={
                    this.props.imageStyle || {
                      //   width: Dimensions.get("window").width * 0.45,
                      height: Dimensions.get('window').height * 0.16,
                      flex: 2,
                      borderColor: '#fff',
                    }
                  }
                  source={{
                    uri:
                      'https://autobeeb.com/' +
                      item.FullImagePath +
                      '_635x811.jpg',
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View
                  style={{
                    height: Dimensions.get('window').height * 0.16,
                  }}>
                  <View
                    style={{
                      height: Dimensions.get('window').height * 0.2,
                      flex: 2,
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 5,
                      backgroundColor: 'rgba(28,126,164,0.2)',
                    }}
                  />
                  <FastImage
                    style={{
                      width: Dimensions.get('window').width * 0.35,
                      flex: 2,

                      height: Dimensions.get('window').height * 0.16,
                      alignSelf: 'center',
                    }}
                    source={require('../images/placeholder.png')}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
              )}

              {!!(item.Condition == 1) && (
                <Text
                  style={{
                    color: '#fff',
                    backgroundColor: '#2B9531',
                    paddingHorizontal: 3,
                    flex: 1,
                    //  paddingVertical: 1,
                    minWidth: 45,
                    textAlign: 'center',
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                  }}>
                  {Languages.New}
                </Text>
              )}
              {DifferentCountry && (
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    position: 'absolute',
                    zIndex: 1,
                    top: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}

              {
                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    position: 'absolute',
                    zIndex: 10,
                    flex: 1,
                    width: 45,
                    textAlign: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    bottom: 0,
                    paddingHorizontal: 3,
                  }}>
                  <IconFa
                    name="camera"
                    size={10}
                    color="white"
                    style={{marginRight: 5}}
                  />

                  <Text style={{color: '#fff'}}>
                    {(item.Images && item.Images.length) || 0}
                  </Text>
                </View>
              }
            </View>
            <View
              style={{
                // backgroundColor: "#f00",
                height: Dimensions.get('screen').height * 0.16,
                justifyContent: 'center',
                //   minHeight: 68,
                flex: 3,
              }}>
              {
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    //  paddingTop: 10,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {item.TypeID != 32 && (
                      <FastImage
                        style={{width: 30, height: 30, marginRight: 5}}
                        resizeMode={FastImage.resizeMode.contain}
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
                    )}
                    <Text
                      numberOfLines={item.TypeID == 32 ? 2 : 1}
                      style={{
                        color: '#000',
                        fontSize: 15,
                        textAlign: 'center',
                      }}>
                      {item.TypeID == 32 ? item.Name : item.NameFirstPart}
                    </Text>
                  </View>

                  {false && (
                    <TouchableOpacity
                      style={{
                        alignSelf: 'flex-end',
                      }}
                      onPress={() => {}}>
                      <FastImage
                        style={{
                          width: 30,
                          height: 30,
                          tintColor: Color.secondary,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                        source={require('../images/parkList.png')}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              }
              {item.TypeID != 32 && (
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#000',
                    fontSize: 15,
                    textAlign: 'left',
                    paddingHorizontal: 10,
                  }}>
                  {item.NameSecondPart}
                </Text>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-end',
                  paddingHorizontal: 10,
                  paddingBottom: 5,
                }}>
                {!!item.SellType && (
                  <Text
                    numberOfLines={1}
                    style={{
                      //   fontWeight: "bold",
                      textAlign: 'left',
                      flex: 3,
                      fontFamily: 'Cairo-Bold',
                      fontSize: 13,
                      //      paddingHorizontal: 10,
                      color: this.sellTypes.find(ST => ST.ID == item.SellType)
                        .backgroundColor,
                    }}>
                    {item.ThumbURL
                      ? this.sellTypes.find(ST => ST.ID == item.SellType).Name
                      : item.TypeName +
                        ' ' +
                        this.sellTypes.find(ST => ST.ID == item.SellType).Name}
                  </Text>
                )}
                {item.PaymentMethod && item.PaymentMethod == 2 && (
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1.5,
                      color: '#2B9531',
                      fontSize: 13,
                      textAlign: 'right',
                    }}>
                    {Languages.Installments}
                  </Text>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,

                  //     justifyContent: "space-between"
                }}>
                {!this.props.AllCountries &&
                item.ISOCode == this.props.AppCountryCode ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    <IconFa
                      name="map-marker"
                      size={12}
                      color={Color.secondary}
                      style={{marginRight: 5}}
                    />
                    <Text numberOfLines={1} style={{fontSize: 12}}>
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
                    <FastImage
                      style={{
                        width: 30,
                        height: 20,
                        borderRadius: 3,
                        backgroundColor: 'transparent',
                        //    borderWidth: 1 / PixelRatio.get(),
                        // borderColor: '#eee',
                        elevation: 3,
                        opacity: 0.8,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                      source={{
                        uri:
                          'https://autobeeb.com/wsImages/flags/' +
                          item.ISOCode +
                          '.png',
                      }}
                    />
                  </View>
                )}

                {
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: item.FormatedPrice ? 14 : 12,
                      flex: 1,
                      color: Color.secondary,

                      textAlign: 'right',
                    }}>
                    {item.FormatedPrice
                      ? item.FormatedPrice
                      : Languages.CallForPrice}
                  </Text>
                }
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {!this.props.profile && (
          <View
            style={{
              backgroundColor: '#f8f8f8',
              flexDirection: 'row',

              //     alignSelf: "flex-end",
              //   padding: 7,
              alignItems: 'center',
            }}>
            {
              <TouchableOpacity
                style={{flex: 1, borderRightWidth: 1, borderColor: '#333'}}
                onPress={() => {
                  //  console.log(JSON.stringify(item));
                  KS.UserGet({
                    userID: item.OwnerID,
                    langid: Languages.langID,
                  }).then(data => {
                    //   alert(JSON.stringify(data));
                    if (data && data.Success == 1) {
                      if (data.User.IsDealer) {
                        this.props.navigation.navigate('DealerProfileScreen', {
                          userid: item.OwnerID,
                        });
                      } else {
                        this.props.navigation.navigate('UserProfileScreen', {
                          userid: item.OwnerID,
                        });
                      }
                    }
                  });
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#333',
                    marginVertical: 7,
                  }}>
                  <IconFa name="user" size={15} color="#333" />
                  {'  ' + Languages.Profile}
                </Text>
              </TouchableOpacity>
            }
            <TouchableOpacity
              style={{
                flex: 1,
                borderRightWidth: 1,

                borderColor: '#333',
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
                  color: '#333',
                  //    borderRightWidth: 1,
                  borderColor: '#333',
                  marginVertical: 7,
                }}>
                <IconFa name="phone" size={15} color="#333" />
                {'  ' + Languages.Call}
              </Text>
            </TouchableOpacity>

            {(this.props.userData == null ||
              (this.props.userData &&
                this.props.userData.ID != item.OwnerID)) && (
              <TouchableOpacity
                style={[{flex: 1}]}
                onPress={() => {
                  delete item.Views;
                  if (this.props.userData) {
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
                  style={{
                    textAlign: 'center',
                    color: '#333',
                    //   borderRightWidth: I18nManager.isRTL ? 1 : 0,
                    //   borderLeftWidth: I18nManager.isRTL ? 0 : 1,
                    //  borderColor: "#fff",
                    marginVertical: 7,
                  }}>
                  <IconIon
                    name="chatbubbles"
                    size={15}
                    color={isOnline ? '#2B9531' : '#333'}
                  />
                  {'  ' + Languages.Chat}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
});

//make this component available to the app
const mapStateToProps = ({user, chat}) => ({
  userData: user.user,
  chat: chat,
});

export default connect(mapStateToProps, null)(RowListingsComponent);
