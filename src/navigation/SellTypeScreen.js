import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  I18nManager,
  FlatList,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import NewHeader from '../containers/NewHeader';
import {Constants, Color, Languages} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';
import IconFa from 'react-native-vector-icons/FontAwesome';

import KS from '../services/KSAPI';
import {HorizontalSwiper, DealersBanner} from '../components';

const WIDTH = Dimensions.get('screen').width;
const cardWidth = WIDTH * 0.85;

class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ListingType: '',
      Banners: [],
    };
  }

  componentDidMount() {
    let isoCode = this.props?.route?.params?.cca2 ?? 'US';
    this.setState({
      ListingType: this.props?.route?.params?.ListingType ?? {ID: 1},
    });

    if ((this.props?.route?.params?.ListingType ?? {ID: 1}).ID != 32) {
      KS.DealersGet({
        langid: Languages.langID,
        page: 1,
        pagesize: 5,
        listingType: (this.props.route.params?.ListingType ?? {ID: 1}).ID,
        isocode: isoCode,
      }).then(data => {
        if (data && data.Success) {
          this.setState({
            Dealers: data.Dealers,
          });
        }
      });
    } else {
      KS.DealersGet({
        langid: Languages.langID,
        page: 1,
        pagesize: 5,
        isocode: isoCode,
        competence: 2,
      }).then(data => {
        if (data && data.Success) {
          this.setState({
            Dealers: data.Dealers,
          });
        }
      });
    }

    KS.BannersGet({
      isoCode,
      langID: Languages.langID,
      placementID: 8,
      listingtype: (this.props.route.params?.ListingType ?? {ID: 1}).ID,
    }).then(data => {
      // console.log(data, 'ccccccc');
      if (data && data.Success == '1' && data.Banners?.length > 0) {
        this.setState({
          Banners: data.Banners,
        });
      }
    });
  }

  renderCatRow(SellType) {
    if (this.state.ListingType.ID == 32 && SellType.ID == 2) {
      return;
    }
    return (
      <TouchableOpacity
        style={[styles.row, SellType.ID == 4 && {borderBottomWidth: 0}]}
        key={SellType.ID}
        onPress={() => {
          if (
            SellType.ID == 1 ||
            SellType.ID == 7 ||
            (this.state.ListingType.ID == 32 && SellType.ID == 4)
          ) {
            if (
              this.state.ListingType.ID == 32 ||
              this.state.ListingType.ID == 4
            ) {
              this.props.navigation.navigate('SectionsScreen', {
                ListingType: this.state.ListingType,
                SellType: SellType,
              });
            } else if (this.state.ListingType.ID == 16) {
              this.props.navigation.navigate('CategoriesScreen', {
                ListingType: this.state.ListingType,
                SellType: SellType,
              });
            } else {
              this.props.navigation.navigate('MakesScreen', {
                ListingType: this.state.ListingType,
                SellType: SellType,
              });
            }
          } else {
            this.props.navigation.navigate('ListingsScreen', {
              ListingType: this.props.route.params?.ListingType,
              SellType: SellType,
            });
          }
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 6,
            justifyContent: 'center',
          }}>
          <Image
            style={{
              width: SellType.ID == 7 || SellType.ID == 4 ? 40 : 40,
              height: SellType.ID == 7 || SellType.ID == 4 ? 25 : 40,
              flex: 1,
            }}
            resizeMode="contain"
            source={SellType.img}
          />
          <Text
            style={{
              color: '#000',
              marginLeft: 20,
              fontSize: 22,
              flex: 5,
              textAlign: 'left',
            }}>
            {SellType.ID != 7
              ? (this.props.route.params?.ListingType || {Name: ''}).Name +
                ' ' +
                SellType.Name
              : SellType.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  render() {
    this.sellTypesFilter = [
      // {
      //   ID: 7,
      //   Name: Languages.All,
      //   img: require('../images/SellTypes/BlueAll.png'),
      //   backgroundColor: '#D31018',
      // },
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('../images/SellTypes/BlueSale.png'),
        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('../images/SellTypes/BlueRent.png'),
        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.SellTypeWanted,
        img: require('../images/SellTypes/BlueWanted.png'),
        backgroundColor: '#D31018',
      },
    ];

    return (
      <View style={{flex: 1}}>
        <NewHeader navigation={this.props.navigation} back blue />
        <ScrollView
          style={{backgroundColor: '#f0f0f0'}}
          contentContainerStyle={{paddingBottom: 40}}>
          {false && (
            <StatusBar
              //  translucent={true}
              backgroundColor={Color.secondary}
              barStyle="light-content"
            />
          )}

          <View
            style={
              {
                //height: Dimensions.get('screen').height * 0.24,
              }
            }>
            {this.state.Banners?.length > 0 ? (
              <HorizontalSwiper
                autoLoop
                intervalValue={1000}
                data={this.state.Banners}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      style={{}}
                      disabled={!item.Link || item.Link == ''}
                      onPress={() => {
                        let URL = item.Link;

                        KS.BannerClick({
                          bannerID: item?.ID,
                        });
                        // .then((data) => {
                        //   alert(JSON.stringify(data));
                        // });
                        if (URL.includes('details')) {
                          this.props.navigation.push('CarDetails', {
                            item: {
                              ID: URL.split('/')[URL.split('/').length - 2],
                              TypeID: URL.split('/')[URL.split('/').length - 1],
                            },
                          });
                        } else if (URL.includes('postoffer')) {
                          this.props.navigation.navigate('PostOfferScreen');
                        } else if (URL.includes('dealers')) {
                          this.props.navigation.navigate('DealersScreen', {
                            Classification:
                              URL.split('/')[URL.split('/').length - 1],
                          });
                        } else if (URL.includes('dealer_info')) {
                          this.props.navigation.navigate(
                            'DealerProfileScreen',
                            {
                              userid: URL.split('/')[URL.split('/').length - 1],
                            },
                          );
                        } else if (URL.includes('blog')) {
                          this.props.navigation.navigate('BlogDetails', {
                            Blog: {
                              ID: URL.split('/')[URL.split('/').length - 1],
                            },
                          });
                        } else if (URL.includes('freeSearch')) {
                          this.props.navigation.navigate('SearchResult', {
                            query: URL.split('/')[URL.split('/').length - 1],
                            submitted: true,
                          });
                        } else {
                          Linking.openURL(URL);
                        }
                      }}>
                      <Image
                        resizeMode="cover"
                        source={{
                          uri: `https://autobeeb.com/${item.FullImagePath}_1000x400.jpg`,
                        }}
                        style={{
                          width: Dimensions.get('window').width,
                          height: Dimensions.get('window').width / 2.5,
                        }}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Image
                resizeMode="stretch"
                source={require('../images/CarsCategory.jpg')}
                style={{
                  width: Dimensions.get('window').width,
                  height: Dimensions.get('window').width / 2.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 0,
                }}
              />
            )}
          </View>

          <Text
            style={{
              fontSize: 25,
              marginLeft: 20,
              color: '#000',
              textAlign: 'left',
            }}>
            {Languages.WhatAreYouLookingFor}
          </Text>

          <View style={styles.whiteContainer}>
            {this.sellTypesFilter.map(type => this.renderCatRow(type))}
          </View>

          {this.state.Dealers && this.state.Dealers.length > 0 && (
            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 15,
                  alignItems: 'center',
                  //  backgroundColor: "red",
                  // paddingTop: 10,
                  marginTop: 20,
                  marginBottom: 10,
                  //     backgroundColor: "red"
                }}>
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('DealersScreen', {
                      ListingType:
                        this.state.ListingType?.ID == 32
                          ? ''
                          : this.state.ListingType,
                      Classification: this.state.ListingType?.ID == 32 ? 2 : '',
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <IconFa
                      name="users"
                      size={26}
                      color={Color.secondary}
                      style={{marginRight: 10}}
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#000',
                      }}>
                      {this.state.ListingType?.ID != 32
                        ? Languages.Dealers
                        : Languages.SparePartsAndFactories}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('DealersScreen', {
                      ListingType:
                        this.state.ListingType?.ID == 32
                          ? ''
                          : this.state.ListingType,
                      Classification: this.state.ListingType?.ID == 32 ? 2 : '',
                    });
                  }}>
                  <Text
                    style={{
                      fontFamily: Constants.fontFamily,
                      //   textDecorationLine: "underline",
                      color: Color.secondary,
                    }}>
                    {Languages.ViewAll}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                style={{alignSelf: 'flex-start'}}
                scrollEventThrottle={16}
                pagingEnabled
                snapToInterval={cardWidth + 10}
                snapToAlignment="center"
                contentInset={{
                  top: 0,
                  bottom: 0,
                  right: WIDTH * 0.075 - 5,
                  left: WIDTH * 0.075 - 5,
                }}
                data={this.state.Dealers}
                contentContainerStyle={[
                  {
                    paddingHorizontal:
                      Platform.OS == 'ios' ? 0 : WIDTH * 0.075 - 5,
                    alignItems: 'center',
                    // marginLeft: 20,
                    alignContent: 'center',
                    justifyContent: 'center',
                  },
                  I18nManager.isRTL ? {paddingLeft: 15} : {paddingRight: 30},
                ]}
                renderItem={({item, index}) => {
                  return (
                    <DealersBanner
                      item={item}
                      navigation={this.props.navigation}
                      homeScreen></DealersBanner>
                  );
                }}
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  whiteContainer: {
    backgroundColor: 'white',
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
});
export default componentName;
