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
import {SpecialSVG} from '.';
import IconFa from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Moment from 'moment';
import IconEn from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import {toast} from '../Omni';
import KS from '../services/KSAPI';
// create a component
class FeatueredListingCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageIndex: 0,
      Favorite: true,
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

  render() {
    const item = this.props.item?.item?.m_Item2 || this.props.item;
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
          {
            borderColor: '#f00707',
            borderWidth: 2,
            shadowColor: '#f00707',
            shadowOffset: {
              width: 0,
              height: 9,
            },
            shadowOpacity: 0.48,
            shadowRadius: 11.95,
            elevation: 18,
          },
          {
            backgroundColor: '#fff',
            paddingTop: 8,
            marginBottom: 10,
            borderRadius: 10,
            marginHorizontal: 8,
            paddingBottom: 15,
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
          this.props.isSpecialOnly && {
            minHeight: Dimensions.get('screen').height * 0.32,
            width:
              Dimensions.get('window').width *
              (this.props.fullScreen ? 0.96 : 0.84),
            gap: 10,
            paddingBottom: 2,
          },
        ]}>
        <View style={{marginHorizontal: 8}}>
          {!!item.ThumbURL ? (
            <FlatList
              contentContainerStyle={{
                alignSelf: 'flex-start',
                minWidth: '100%',
                gap: 15,
              }}
              data={this.props.isSpecialOnly ? [item.Images[0]] : item.Images}
              scrollEnabled={!this.props.isSpecialOnly}
              horizontal={!this.props.isSpecialOnly}
              renderItem={_item => {
                return (
                  <Pressable
                    key={`${_item.index}`}
                    style={item.Images.length == 1 ? {minWidth: '100%'} : {}}
                    onPress={() =>
                      this.props.navigation.push('CarDetails', {
                        item: item,
                      })
                    }>
                    <FastImage
                      style={{
                        width:
                          item.Images.length == 1
                            ? '100%'
                            : Dimensions.get('window').width - 75,
                        height: Dimensions.get('window').width / 1.77,
                        bordercolor: '#000',
                        borderRadius: 10,
                      }}
                      source={{
                        uri: `https://autobeeb.com/${item.ImageBasePath}${_item.item}_750x420.jpg`,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />

                    {_item.index == 0 && (
                      <>
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
                              zIndex: 2,
                              left: 0,
                              top: 0,
                              borderTopRightRadius: 10,
                            }}>
                            {item.ThumbURL
                              ? this.sellTypes.find(
                                  ST => ST.ID == item.SellType
                                )?.Name
                              : item.TypeName +
                                ' ' +
                                this.sellTypes.find(
                                  ST => ST.ID == item.SellType
                                )?.Name}
                          </Text>
                        )}

                        {item.Images && item.Images.length > 0 && (
                          <View
                            style={{
                              textAlign: 'left',
                              position: 'absolute',
                              backgroundColor: '#122',
                              width: 'auto',
                              bottom: 10,
                              left: 10,
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
                                fontSize: 14,
                              }}>
                              {item.Images?.length}
                            </Text>
                            <IconFa name={'image'} size={14} color={'#fff'} />
                          </View>
                        )}
                      </>
                    )}
                  </Pressable>
                );
              }}
            />
          ) : (
            <View
              style={{
                alignSelf: 'flex-start',
                minWidth: '100%',
                gap: 15,
              }}>
              <Pressable
                style={{minWidth: '100%'}}
                onPress={() =>
                  this.props.navigation.push('CarDetails', {
                    item: item,
                  })
                }>
                <FastImage
                  style={{
                    width: '100%',
                    height: Dimensions.get('window').width / 1.77,
                    bordercolor: '#000',
                    borderRadius: 10,
                  }}
                  source={require('../images/placeholder.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </Pressable>
            </View>
          )}
        </View>

        <View
          style={{
            paddingHorizontal: 8,
            marginTop: 6,
          }}>
          <View>
            {this.props.isFavorites && (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  borderRadius: 20,
                  backgroundColor: '#fbfbfb',
                  elevation: 3,
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
          </View>

          <View
            style={{
              width: Dimensions.get('screen').width,
              bottom: this.props.isSpecialOnly ? 6 : 6,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {!this.props.isSpecialOnly && !!item.FormatedPrice && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000',
                      textAlign: 'left',
                    }}>
                    {item.FormatedPrice
                      ? item.FormatedPrice
                      : Languages.CallForPrice}
                  </Text>
                )}

                {!this.props.isSpecialOnly &&
                  item.PaymentMethod &&
                  item.PaymentMethod == 2 && (
                    <View style={{flexDirection: 'row', alignItems: 'left'}}>
                      <Text style={{color: '#000', fontSize: 16}}>
                        {(!!item.FormatedPrice ? '/' : ' ') +
                          Languages.Installments}
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
              <FastImage
                style={{width: 30, height: 30, marginRight: 3}}
                resizeMode={FastImage.resizeMode.contain}
                source={
                  this.props.AllCountries ||
                  item.ISOCode != this.props.AppCountryCode
                    ? {
                        uri: `https://autobeeb.com/wsImages/flags/${item.ISOCode}.png`,
                      }
                    : item.TitleFullImagePath
                    ? {
                        uri: `https://autobeeb.com/${item.TitleFullImagePath}_300x150.png`,
                      }
                    : item.TypeID == 16
                    ? {
                        uri: `https://autobeeb.com/content/newlistingcategories/16${item.CategoryID}/${item.CategoryID}_300x150.png`,
                      }
                    : {
                        uri: `https://autobeeb.com/content/newlistingmakes/${item.MakeID}/${item.MakeID}_240x180.png`,
                      }
                }
              />

              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  color: '#000',
                  textAlign: 'left',
                  maxWidth: Dimensions.get('screen').width * 0.85,
                }}>
                {item.Name}
              </Text>
              <SpecialSVG />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({});

//make this component available to the app
export default FeatueredListingCard;
