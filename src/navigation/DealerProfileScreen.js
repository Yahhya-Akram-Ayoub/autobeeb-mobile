import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Image,
  TouchableOpacity,
  Share,
  Dimensions,
  StyleSheet,
  RefreshControl,
  I18nManager,
  Platform,
  Linking,
  Pressable,
} from 'react-native';
import KS from '../services/KSAPI';
import {Languages, Color, Constants, ExtractScreenObjFromUrl} from '../common';
import {
  LogoSpinner,
  DealersBanner,
  BannerListingsComponent,
  FeatueredListingCard,
  AutobeebModal,
} from '../components';
import LinearGradient from 'react-native-linear-gradient';
import IconOc from 'react-native-vector-icons/Octicons';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, {Marker} from 'react-native-maps';
import {connect} from 'react-redux';
import getDirections from 'react-native-google-maps-directions';

class DealerProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      refreshing: false,
      date: new Date(),
      ListingsLoading: true,
      DealerLoading: true,
      active: true,
      currency: global.ViewingCurrency
        ? global.ViewingCurrency
        : {
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
    };
  }

  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  handleGetDirections = destination => {
    const data = {
      destination: destination,
      params: [
        {
          key: 'travelmode',
          value: 'driving', // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate', // this instantly initializes navigation using the given travel mode
        },
      ],
    };

    getDirections(data);
  };

  componentDidMount() {
    //  alert(JSON.stringify(this.state.currency));

    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : '2',
    })
      .then(result => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));

          this.setState(prevState => ({
            ...prevState,
            PrimaryCurrencies: result.Currencies,
          }));
          result.Currencies &&
            result.Currencies.forEach(cur => {
              if (global?.ViewingCurrency) {
                if (cur.ID == global?.ViewingCurrency?.ID) {
                  this.setState(prevState => ({
                    ...prevState,
                    currency: cur,
                  }));
                }
              } else {
                if (cur.ID == this.props.ViewingCurrency?.ID) {
                  global.ViewingCurrency = cur;
                  this.setState(prevState => ({
                    ...prevState,
                    currency: cur,
                  }));
                }
              }
            });
        } else {
          //should never happen, in case something goes wrong ill have fallback currencies
          this.setState(prevState => ({
            ...prevState,
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
          }));
        }
      })
      .catch(err => {});

    try {
      KS.DealerGet({
        userID: this.props.route.params?.userid ?? 0,
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success) {
          this.setState(prevState => ({
            ...prevState,
            Dealer: data.Dealer,
            Competences: data.Competences,
            Makes: data.Makes,

            vat: data.Dealer.Vat,
            Phone: data.Dealer.Phone,
            aboutCo: data.Dealer.About,
            Address: data.Dealer.Address,
            hideMobile: data.Dealer.HideMobile,
            DealerLoading: false,
          }));
        }
      });

      KS.UserListings({
        langid: Languages.langID,
        offerStatus: 16,

        page: 1,
        pagesize: 10,
        userid: this.props.route.params?.userid ?? null,
      }).then(data => {
        //    alert(JSON.stringify(data));
        if (data && data.Success) {
          this.setState(prevState => ({
            ...prevState,
            Listings: data.Listings,
            TotalPages: data.TotalPages,
          }));
        }
        this.setState(prevState => ({
          ...prevState,
          ListingsLoading: false,
        }));
      });
    } catch (e) {
      alert(JSON.stringify(e));
      //    this.setState(prevState => ({  ...prevState, ListingsLoading: false, UserLoading: false }));
    }

    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 4,
    }).then(data => {
      if (data && data.Success == '1' && data.Banners?.length > 0) {
        this.setState(
          {
            Banners: data.Banners,
          },
          () => {
            this.state.Banners.map(item => {
              KS.BannerViewed(item.ID);
            });
          },
        );
      }
    });
  }

  _onRefresh = () => {
    this.setState(prevState => ({
      ...prevState,
      refreshing: true,
      ListingsLoading: true,
    }));
    KS.UserListings({
      langid: Languages.langID,
      page: 1,
      pagesize: 10,
      offerStatus: 16,

      userid: this.props.route.params?.userid ?? null,
    }).then(data => {
      //    alert(JSON.stringify(data));
      if (data && data.Success) {
        this.setState(prevState => ({
          ...prevState,
          Listings: data.Listings,
          refreshing: false,
          TotalPages: data.TotalPages,
          page: 1,
        }));
      }
      this.setState(prevState => ({
        ...prevState,
        ListingsLoading: false,
      }));
    });
  };

  renderCurrencyRow(Currency) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          global.ViewingCurrency = Currency;
          this.setState(prevState => ({
            ...prevState,
            currency: Currency,
            page: 1,
          }));
          //   this.ResetFilters();
          this.CurrencyModal.close();

          KS.UserListings({
            langid: Languages.langID,
            offerStatus: 16,

            page: 1,
            pagesize: 10,
            userid: this.props.route.params?.userid ?? null,
          }).then(data => {
            //    alert(JSON.stringify(data));
            if (data && data.Success) {
              this.setState(prevState => ({
                ...prevState,
                Listings: data.Listings,
                TotalPages: data.TotalPages,
              }));
            }
            this.setState(prevState => ({
              ...prevState,
              ListingsLoading: false,
            }));
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 6,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color:
                this.state.currency.ID == Currency.ID ? Color.primary : '#000',
              marginLeft: 20,
              fontSize: 23,
              flex: 5,
              textAlign: 'left',
            }}>
            {Currency.Name}
          </Text>
        </View>
        <IconMa
          name={
            this.state.currency.ID == Currency.ID
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={25}
          color={this.state.currency.ID == Currency.ID ? Color.primary : '#000'}
        />
      </TouchableOpacity>
    );
  }

  renderCompetence() {
    try {
      let competencesNames = '';

      competencesNames = this.state.Competences.map((comp, index) => {
        return index != this.state.Competences.length - 1
          ? comp.Name + ', '
          : comp.Name;
      });

      return competencesNames;
    } catch {
      return 'no competence';
    }
  }

  renderMakes() {
    try {
      let MakesNames = '';

      MakesNames = this.state.Makes.map((make, index) => {
        return index != this.state.Makes.length - 1
          ? make.Name + ', '
          : make.Name;
      });

      return MakesNames;
    } catch {
      return 'no Makes';
    }
  }
  renderHeaderComponent() {
    return (
      <View style={{marginBottom: 10}}>
        {this.state.Dealer && (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <DealersBanner
              item={this.state.Dealer}
              date={this.state.date}
              full
              dealerProfile
            />
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            //   borderTopWidth: 1,
            borderColor: '#ddd',
            elevation: 1,
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderBottomWidth: 2,
              borderBottomColor: this.state.active ? Color.primary : '#ddd',

              padding: 5,
              paddingVertical: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderRightColor: '#ddd',
              borderRightWidth: 1,
            }}
            onPress={() => {
              this.setState(prevState => ({
                ...prevState,
                active: true,
              }));
            }}>
            <Text
              style={{
                color: '#000',
                textAlign: 'center',
              }}>
              {Languages.Offers}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              borderBottomWidth: 2,
              borderBottomColor: !this.state.active ? Color.primary : '#ddd',
              padding: 5,
              paddingVertical: 5,
            }}
            onPress={() => {
              this.setState(prevState => ({
                ...prevState,
                active: false,
              }));
            }}>
            <Text
              style={{
                color: '#000',
                textAlign: 'center',
              }}>
              {Languages.Information}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  AppLink() {
    return `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;
  }
  generateDealerLink() {
    if (I18nManager.isRTL) {
      return `https://autobeeb.com/ar/dealer/dealer/${
        this.props.route.params?.userid ?? 0
      }`;
    } else {
      return `https://autobeeb.com/dealer/dealer/${
        this.props.route.params?.userid ?? 0
      }`;
    }
  }
  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          Languages.CheckDealer +
          '\n' +
          this.generateDealerLink() +
          '\n' +
          '\n' +
          Languages.DownloadAutobeeb +
          '\n' +
          this.AppLink(),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  renderItem = ({item, index}) => {
    if (item.AutoBeebBanner) {
      return (
        <TouchableOpacity
          disabled={!item.BannerDetails.Link}
          style={{}}
          onPress={async () => {
            let url = item.BannerDetails.Link;
            if (!url) return;

            KS.BannerClick({
              bannerID: item.BannerDetails.ID,
            });

            const {screen, params} = await ExtractScreenObjFromUrl(url);
            if (!!screen) {
              this.props.navigation.navigate(screen, !!params && params);
            } else {
              Linking.openURL(url);
            }
          }}>
          <Image
            resizeMode="contain"
            source={{
              uri: `https://autobeeb.com/${item.BannerDetails.FullImagePath}.png`,
            }}
            style={{
              //  marginVertical: 10,
              alignSelf: 'center',
              width: Dimensions.get('window').width * 0.8,
              height: (Dimensions.get('window').width * 0.8) / 1.8,
              marginBottom: 8,
            }}
          />
        </TouchableOpacity>
      );
    }
    return (
      <>
        {item.IsSpecial ? (
          <View key={index} style={{maxWidth: '100%'}}>
            <FeatueredListingCard
              key={index}
              isSpecialOnly={false}
              AllCountries={this.props.ViewingCountry?.cca2 == 'ALL'}
              AppCountryCode={this.props.ViewingCountry?.cca2}
              item={item}
              navigation={this.props.navigation}
              fullScreen={true}
              isListingsScreen={true}
            />
          </View>
        ) : (
          <BannerListingsComponent
            key={index}
            profile
            item={item}
            navigation={this.props.navigation}
            AppCountryCode={this.props.ViewingCountry?.cca2}
          />
        )}
      </>
    );
  };

  render() {
    if (this.state.ListingsLoading || this.state.DealerLoading) {
      return (
        <View style={{flex: 1}}>
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={{flex: 1}}
        style={{backgroundColor: '#eee'}}>
        <AutobeebModal //currency modal
          ref={instance => (this.CurrencyModal = instance)}
          //  isOpen={true}
          style={styles.sellTypeModal}
          position="center"
          backButtonClose={true}
          entry="bottom"
          swipeToClose={true}
          coverscreen={false}
          backdropOpacity={0.5}>
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              // justifyContent: 'center',
              // alignItems:"center",
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}>
            <View
              style={{backgroundColor: 'white', padding: 5, borderRadius: 10}}>
              {this.state.PrimaryCurrencies &&
                this.state.PrimaryCurrencies.map(type =>
                  this.renderCurrencyRow(type),
                )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.CurrencyModal.close();
                }}>
                <Text
                  style={{
                    color: Color.secondary,
                    flex: 1,
                    fontSize: 26,
                    textAlign: 'center',
                  }}>
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AutobeebModal>

        {this.state.currency && this.state.active && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 10,
              zIndex: 100,
              right: 5,
              backgroundColor: Color.primary,
              padding: 15,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: '#fff',
              elevation: 5,
            }}
            onPress={data => {
              this.CurrencyModal.open();
            }}>
            <Text
              style={{
                fontSize: 18,
                color: 'white',
                fontFamily: 'Cairo-Bold',
              }}>
              {this.state.currency?.ShortName}
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            position: 'absolute',
            top: 0,
            zIndex: 200,
            minHeight: 70,
            paddingTop: 15,
            width: Dimensions.get('screen').width,
          }}>
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              style={{
                marginRight: 15,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 100,
                padding: 7,
              }}
              onPress={data => {
                this.props.navigation.goBack();
              }}>
              <Ionicons
                name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
                size={20}
                color={'white'}
              />
            </TouchableOpacity>

            <Pressable
              onPress={() => {
                this.onShare();
              }}
              style={{
                marginRight: 15,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 100,
                width: 35,
                height: 35,
                paddingStart: 2,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 15,
              }}>
              <IconOc name="share-android" size={15} color="white" />
            </Pressable>
          </View>
        </View>

        {this.state.active && (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              alignItems: 'center',
              //paddingBottom: 10
              //  paddingVertical: 20
            }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            ListHeaderComponent={() => {
              return this.renderHeaderComponent();
            }}
            data={this.state.Listings}
            renderItem={this.renderItem.bind(this)}
            onEndReached={() => {
              this.setState(
                prevState => ({
                  ...prevState,
                  page: this.state.page + 1,
                }),
                () => {
                  if (this.state.page <= this.state.TotalPages) {
                    this.setState(prevState => ({
                      ...prevState,
                      footerLoading: true,
                    }));

                    KS.UserListings({
                      langid: Languages.langID,
                      offerStatus: 16,

                      userid: this.props.route.params?.userid ?? null,
                      page: this.state.page,
                      pagesize: 10,
                    }).then(data => {
                      if (data && data.Success) {
                        let concattedListings = this.state.Listings;
                        let tempBanners = this.state.Banners || [];

                        if (this.state.Banners?.length > 0) {
                          concattedListings.push({
                            AutoBeebBanner: true,
                            BannerDetails: tempBanners.shift(),
                          });
                          this.setState(prevState => ({
                            ...prevState,
                            Banners: tempBanners,
                          }));
                        }
                        //  else {
                        //   concattedListings.push({Banner: true});
                        // }

                        concattedListings = concattedListings.concat(
                          data.Listings,
                        );

                        this.setState(
                          {
                            Listings: concattedListings,
                          },
                          () => {
                            setTimeout(() => {
                              this.setState(prevState => ({
                                ...prevState,
                                footerLoading: false,
                              }));
                            }, 1000);
                          },
                        );
                      }
                      this.setState(prevState => ({
                        ...prevState,
                        ListingsLoading: false,
                      }));
                    });
                  }
                },
              );
            }}
            ListEmptyComponent={() => {
              return <Text style={{}}>{Languages.NoOffers}</Text>;
            }}
            onEndReachedThreshold={5}
            ListFooterComponent={
              this.state.footerLoading && (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                  }}>
                  <ActivityIndicator size="large" color={'#F85502'} />
                </View>
              )
            }
          />
        )}

        {!this.state.active && (
          <ScrollView
            style={{flex: 1, backgroundColor: '#fff'}}
            contentContainerStyle={{paddingBottom: 70}}>
            <View style={{}}>{this.renderHeaderComponent()}</View>
            {this.state.Dealer && (
              <View style={{}}>
                {this.state.Dealer.Classification && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Classification}
                    </Text>
                    <Text style={styles.InformationValue}>
                      {this.state.Dealer.Classification}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.Competence && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Competence}
                    </Text>
                    <Text
                      style={[
                        styles.InformationValue,
                        {
                          justifyContent: 'center',

                          textAlignVertical: 'center',
                        },
                      ]}>
                      {this.renderCompetence()}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.Competence && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Makes}
                    </Text>
                    <Text
                      style={[
                        styles.InformationValue,
                        {
                          justifyContent: 'center',

                          textAlignVertical: 'center',
                        },
                      ]}>
                      {this.renderMakes()}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.Phone && (
                  <Pressable
                    onPress={() => {
                      if (!!this.state.ShowPhone) {
                        Linking.openURL(`tel:${this.state.Dealer.Phone}`);
                      } else {
                        KS.UpdateMobileClick({UserId: this.state.Dealer.ID});
                        this.setState(prevState => ({
                          ...prevState,
                          ShowPhone: true,
                        }));
                      }
                    }}
                    style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Phone2}
                    </Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.ShowPhone
                        ? `\u200E${this.state.Dealer.Phone}`
                        : `${this.state.Dealer.Phone}`.replace(/.{4}$/, 'xxxx')}
                    </Text>
                  </Pressable>
                )}

                {this.state.Dealer.User && !this.state.Dealer.HideMobile && (
                  <Pressable
                    onPress={() => {
                      if (!!this.state.ShowPhone) {
                        Linking.openURL(`tel:${this.state.Dealer.User.Phone}`);
                      } else {
                        KS.UpdateMobileClick({
                          UserId: this.state.Dealer.User.ID,
                        });
                        this.setState(prevState => ({
                          ...prevState,
                          ShowPhone: true,
                        }));
                      }
                    }}
                    style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Mobile}
                    </Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.ShowPhone
                        ? `\u200E${this.state.Dealer.User.Phone}`
                        : `${this.state.Dealer.User.Phone}`.replace(
                            /.{4}$/,
                            'xxxx',
                          )}
                    </Text>
                  </Pressable>
                )}
                {this.state.Dealer.Vat && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>{Languages.Vat}</Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.Dealer.Vat}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.About && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.AboutCompany}
                    </Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.Dealer.About}
                    </Text>
                  </View>
                )}

                {this.state.Dealer?.LatLng && (
                  <View
                    style={[
                      styles.InformationRow,
                      {
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        paddingHorizontal: 5,
                      },
                    ]}>
                    <Text style={{textAlign: 'left', marginBottom: 5}}>
                      {Languages.Address}
                    </Text>

                    <MapView
                      liteMode
                      region={{
                        latitude: parseFloat(
                          this.state.Dealer?.LatLng.split(',')[0],
                        ),
                        longitude: parseFloat(
                          this.state.Dealer?.LatLng.split(',')[1],
                        ),
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                      }}
                      onPress={() => {
                        this.handleGetDirections({
                          latitude: parseFloat(
                            this.state.Dealer?.LatLng.split(',')[0],
                          ),
                          longitude: parseFloat(
                            this.state.Dealer?.LatLng.split(',')[1],
                          ),
                        });
                      }}
                      // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                      style={{
                        width: '100%',
                        height: 180,

                        backgroundColor: '#fff',
                      }}>
                      {
                        <Marker
                          onPress={() => {
                            this.handleGetDirections({
                              latitude: parseFloat(
                                this.state.Dealer?.LatLng.split(',')[0],
                              ),
                              longitude: parseFloat(
                                this.state.Dealer?.LatLng.split(',')[1],
                              ),
                            });
                          }}
                          coordinate={{
                            latitude: parseFloat(
                              this.state.Dealer?.LatLng.split(',')[0],
                            ),
                            longitude: parseFloat(
                              this.state.Dealer?.LatLng.split(',')[1],
                            ),
                          }}
                        />
                      }
                    </MapView>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  modelContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    alignSelf: 'center',

    //   height: Dimensions.get("screen").height * 0.7,

    width: Dimensions.get('screen').width * 0.8,
  },
  rangeTitle: {fontSize: 17, color: '#000'},
  rangeCancel: {
    color: Color.secondary,
  },
  rangeBox: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    borderColor: '#e6e6e6',
    width: Dimensions.get('screen').width * 0.45,
  },
  rangeBoxText: {
    textAlign: 'left',
    color: 'gray',
    fontSize: 16,
  },
  modalRowContainer: {
    marginVertical: 3,
    paddingBottom: 5,
    height: 50,
    justifyContent: 'center',
    //       borderWidth:1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  filterSectionContainer: {
    elevation: 2,
    borderWidth: 0,
    //borderColor:Color.secondary,
    overflow: 'hidden',
    marginHorizontal: 7,
    borderRadius: 5,
    backgroundColor: '#fff',
    //   borderWidth: 1,
    //  borderColor: "#f00",
    marginVertical: 5,
  },
  filterValueContainer: {
    flexDirection: 'row',
    width: Dimensions.get('screen').width,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    //  borderColor: Color.secondary,
    padding: 10,
    //  borderBottomWidth: 1,
    //   borderColor: "#e6e6e6"
  },
  FilterSectionHeader: {
    // marginBottom: 10,
    backgroundColor: '#fff',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e6e6e6',
    borderBottomColor: '#e6e6e6',
    paddingHorizontal: 10,
  },
  FilterSectionHeaderText: {
    //color: "#808080",
    color: Color.secondary,
    fontSize: 17,
    textAlign: 'left',
  },

  FilterButton: {
    borderColor: Color.secondary,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  filterContainer: {
    //   paddingVertical: 20
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',
    borderWidth: 0,
    elevation: 2,
    padding: 10,
  },
  sortContainerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: "#fff",
    justifyContent: 'center',
  },
  modal: {
    zIndex: 50,

    elevation: 10,
    zIndex: 20,

    height: Dimensions.get('screen').height * 0.8,

    width: Dimensions.get('screen').width,
  },
  modelModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },

  filterModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    height: '100%',
    justifyContent: 'flex-end',
    width: Dimensions.get('screen').width,
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },
  sellTypeModal: {
    zIndex: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    // alignItems: "center",
    justifyContent: 'center',

    flex: 1,
  },
  sortContainerText: {
    textAlign: 'left',
    color: '#000',
    fontSize: 16,
  },
  whiteContainer: {
    //  marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    // marginHorizontal: 4,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
  InformationRow: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingVertical: 5,
    // flexDirection: "row",
    // alignItems: "center",
  },
  InformationTitle: {
    paddingHorizontal: 5,
    textAlign: 'left',

    color: '#000',
    fontSize: 18,
  },
  InformationValue: {
    textAlign: 'left',
    color: '#61667B',
    paddingHorizontal: 5,
  },
});

const mapStateToProps = ({menu, user}) => ({
  ViewingCurrency: menu.ViewingCurrency,
  ViewingCountry: menu.ViewingCountry,
});

export default connect(mapStateToProps, undefined)(DealerProfileScreen);
