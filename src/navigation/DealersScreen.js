import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import KS from '../services/KSAPI';
import {Languages, Color, Constants, ExtractScreenObjFromUrl} from '../common';
import {LogoSpinner, DealersBanner} from '../components';
import NewHeader from '../containers/NewHeader';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';
import CountryPicker, {
  getAllCountries,
} from 'react-native-country-picker-modal-kensoftware';

class DealersScreen extends Component {
  constructor(props) {
    console.log;
    super(props);
    this.state = {
      page: 1,
      refreshing: false,
      CompetencesLoading: true,
      cca2: props.ViewingCountry.cca2,
      userCountryData: null,
      countryName:
        this.userCountryData ?? null
          ? userCountryData.name[Languages.translation]
          : props.ViewingCountry.name,
      dealersLoading: true,
      seed: Math.floor(Math.random() * 10),
      // measuredItem: 280,
    };
  }

  xx = async () => {
    const da = await getAllCountries().find(
      country => country.cca2 == props?.ViewingCountry.cca2,
    );
    this.setState({userCountryData: da});
  };
  componentDidMount() {
    try {
      KS.DealersGet({
        langid: Languages.langID,
        page: 1,
        pagesize: 10,
        isocode: this.state.cca2,
        seed: this.state.seed,
        listingtype: (this.props.route.params?.ListingType || {ID: ''}).ID,
        classification:
          !!this.props.route.params?.Classification &&
          this.props.route.params?.Classification != 'dealers'
            ? this.props.route.params?.Classification
            : '',
      }).then(data => {
        this.xx();
        if (data && data.Success) {
          this.setState({
            Dealers: data.Dealers,
            TotalPages: data.TotalPages,
          });
        }
        this.setState({dealersLoading: false});
      });

      KS.CompetencesGet({
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success == 1) {
          let newArr = data.Competences.filter(x => x.ID != 32 && x.ID <= 2048);
          newArr.unshift({
            ID: undefined,
            //  FullImagePath: "content/newlistingtype/1/1",
            Name: Languages.All,
          });
          this.setState(
            {
              Competences: newArr,
              CompetencesLoading: false,
            },
            () => {
              // console.log(this.state.Competences);
              // console.log(this.props.route.params?.ListingType);
              // console.log(
              //   this.state.Competences.find(
              //     (item) =>
              //       item.ID ==
              //       this.props.route.params?.ListingType?.ID
              //   )
              // );

              if (!!this.props.route.params?.ListingType) {
                this.setState({
                  selectedCompetence: this.state.Competences.find(
                    item => item.ID == this.props.route.params?.ListingType?.ID,
                  ),
                });
              }
            },
          );
        }
      });

      KS.BannersGet({
        isoCode: this.props.ViewingCountry.cca2,
        langID: Languages.langID,
        placementID: 5,
      }).then(data => {
        if (data && data.Success == '1' && data.Banners?.length > 0) {
          this.setState(
            {
              Banners: data.Banners,
            },
            () => {
              this.state.Banners?.map(item => {
                KS.BannerViewed(item.ID);
              });
            },
          );
        }
      });

      KS.ClassificationsGet({
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success == 1) {
          // var newArr = data.Classifications.map(function(val, index) {
          //   return { label: val.Name, value: val.ID };
          // });

          if (!!this.props.route.params?.Classification) {
            let selectedClassification = data.Classifications.find(
              classification =>
                classification.ID ==
                (this.props.route.params?.Classification ?? 2),
            );
            this.setState({selectedClassification});
          }
          let newArr = data.Classifications;
          newArr.unshift({
            ID: undefined,
            //  FullImagePath: "content/newlistingtype/1/1",
            Name: Languages.All,
          });
          this.setState({
            Classifications: newArr,
            ClassificationsLoading: false,
          });
        }
      });
    } catch {
      this.setState({dealersLoading: false});
    }
  }

  _onRefresh = () => {
    this.setState({refreshing: true, dealersLoading: true});

    KS.DealersGet({
      langid: Languages.langID,
      page: 1,
      listingtype: this.state.selectedCompetence
        ? this.state.selectedCompetence.ID
        : '',
      isocode: this.state.cca2,
      pagesize: 10,
      seed: this.state.seed,
      classification: this.state.selectedClassification
        ? this.state.selectedClassification.ID
        : '',
    }).then(data => {
      if (data && data.Success) {
        this.setState({
          Dealers: data.Dealers,
          TotalPages: data.TotalPages,
          page: 1,
        });
      }
      this.setState({dealersLoading: false, refreshing: false});
    });
  };

  renderItem = ({item, index}) => {
    if (item.AutoBeebBanner) {
      return (
        <TouchableOpacity
          disabled={!item.BannerDetails.Link}
          style={
            {
              // height: this.state.measuredItem,
            }
          }
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
      <DealersBanner
        key={index}
        navigation={this.props.navigation}
        item={item}
        full
        cca2={this.props.ViewingCountry.cca2}

        // onLayout={(event) => {
        //   if (!this.state.measuredItem) {
        //     this.setState({
        //       measuredItem: true,
        //       bannerHeight: event.nativeEvent.layout.height,
        //     });
        //   }
        // }}
      ></DealersBanner>
    );
  };

  render() {
    if (this.state.dealersLoading) {
      return (
        <View style={{flex: 1}}>
          <NewHeader
            navigation={this.props.navigation}
            back
            onCountryChange={item => {
              this.setState({cca2: item.cca2});
            }}
          />
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <View style={{backgroundColor: '#eee', flex: 1}}>
        <NewHeader
          navigation={this.props.navigation}
          back
          CustomSearchComponent
          onChangeText={search => {
            this.setState({keyword: search});
          }}
          searchValue={this.state.keyword}
          placeholder={Languages.SearchByCompanyName}
          onSubmitEditing={() => {
            this.setState({dealersLoading: true});
            KS.DealersGet({
              langid: Languages.langID,
              page: 1,
              listingtype: this.state.selectedCompetence
                ? this.state.selectedCompetence.ID
                : '',
              isocode: this.state.cca2,
              pagesize: 10,
              seed: this.state.seed,
              classification: this.state.selectedClassification
                ? this.state.selectedClassification.ID
                : '',
              keyword: this.state.keyword,
            }).then(data => {
              if (data && data.Success) {
                this.setState({
                  Dealers: data.Dealers,
                  TotalPages: data.TotalPages,
                  page: 1,
                });
              }
              this.setState({dealersLoading: false, refreshing: false});
            });
          }}
          onCountryChange={item => {
            this.setState({
              cca2: item.cca2,
              countryName: item.name,

              dealersLoading: true,
            });
            KS.DealersGet({
              langid: Languages.langID,
              page: 1,
              pagesize: 10,
              listingtype: this.state.selectedCompetence
                ? this.state.selectedCompetence.ID
                : '',
              isocode: item.cca2,
              seed: this.state.seed,
              classification: this.state.selectedClassification
                ? this.state.selectedClassification.ID
                : '',
            }).then(data => {
              if (data && data.Success) {
                this.setState({
                  Dealers: data.Dealers,
                  TotalPages: data.TotalPages,
                });
              }
              this.setState({
                dealersLoading: false,
                page: 1,
              });
            });
          }}
        />
        {this.props.ViewingCountry && (
          <View style={{position: 'absolute', top: -100}}>
            <CountryPicker
              filterPlaceholder={Languages.Search}
              hideAlphabetFilter
              ref="countryPicker"
              filterable
              AllCountries
              autoFocusFilter={false}
              styles={{
                input: {},
                header: {
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: Color.secondary,
                },
              }}
              closeable
              transparent
              onChange={item => {
                this.setState({
                  cca2: item.cca2,
                  countryName: item.name,
                  dealersLoading: true,
                });

                KS.DealersGet({
                  langid: Languages.langID,
                  page: 1,
                  pagesize: 10,
                  listingtype: this.state.selectedCompetence
                    ? this.state.selectedCompetence.ID
                    : '',
                  isocode: item.cca2,
                  seed: this.state.seed,
                  classification: this.state.selectedClassification
                    ? this.state.selectedClassification.ID
                    : '',
                }).then(data => {
                  if (data && data.Success) {
                    this.setState({
                      Dealers: data.Dealers,
                      TotalPages: data.TotalPages,
                    });
                  }
                  this.setState({
                    dealersLoading: false,
                    page: 1,
                  });
                });
              }}
              cca2={this.props.ViewingCountry.cca2}
              translation={Languages.translation}>
              <View />
            </CountryPicker>
          </View>
        )}
        {!this.state.CompetencesLoading &&
          !this.state.ClassificationsLoading && (
            <View style={{flexDirection: 'row'}}>
              <SectionedMultiSelect
                ref={ins => (this.CompetenceMultiSelect = ins)}
                selectedText={Languages.Selected}
                items={this.state.Competences}
                single
                uniqueKey="ID"
                colors={{
                  primary: Color.primary,
                }}
                displayKey="Name"
                // alwaysShowSelectText={true}
                //   showCancelButton
                hideSelect
                styles={{
                  container: {flex: 1},
                  selectToggle: {
                    //   flex: 4,
                    backgroundColor: 'white',
                  },
                  button: {backgroundColor: 'red'},
                  selectToggleText: {
                    paddingVertical: 5,
                    color: 'red',
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
                selectText={Languages.PleaseSelectWorkType}
                onSelectedItemObjectsChange={selectedCompetence => {
                  //  alert(JSON.stringify(selectedCompetence));
                  this.setState({selectedClassification: undefined});

                  KS.DealersGet({
                    langid: Languages.langID,
                    page: 1,
                    pagesize: 10,
                    listingtype: selectedCompetence[0].ID,
                    isocode: this.state.cca2 || '',
                    seed: this.state.seed,
                  }).then(data => {
                    if (data && data.Success) {
                      this.setState({
                        Dealers: data.Dealers,
                        TotalPages: data.TotalPages,
                      });
                    }
                    this.setState({
                      selectedCompetence: selectedCompetence[0],
                      dealersLoading: false,
                      page: 1,
                    });
                  });
                }}
                onSelectedItemsChange={() => {}}
                modalWithSafeAreaView
                confirmText={Languages.Confirm}
                selectedItems={this.state.selectedCompetences}
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
              <SectionedMultiSelect
                ref={ins => (this.ClassificationMultiSelect = ins)}
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
                  modalWrapper: {
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  container: {
                    height: 410,
                    flex: 0,
                  },
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
                //   showRemoveAll={true}
                selectText={Languages.SelectWorkClassifications}
                //  showDropDowns={true}
                //   readOnlyHeadings={true}
                onSelectedItemObjectsChange={selectedClassification => {
                  //  alert(JSON.stringify(selectedCompetence));
                  this.setState({selectedCompetence: undefined});
                  KS.DealersGet({
                    langid: Languages.langID,
                    page: 1,
                    pagesize: 10,
                    isocode: this.state.cca2 || '',
                    seed: this.state.seed,
                    classification: selectedClassification[0].ID,
                  }).then(data => {
                    if (data && data.Success) {
                      this.setState({
                        Dealers: data.Dealers,
                        TotalPages: data.TotalPages,
                      });
                    }
                    this.setState({
                      selectedClassification: selectedClassification[0],
                      dealersLoading: false,
                      page: 1,
                    });
                  });
                }}
                onSelectedItemsChange={selectedClassification => {
                  //    let arrSum = arr => arr.reduce((a, b) => a + b, 0);
                  //this.setState({ selectedClassification });
                }}
                modalWithSafeAreaView
                // cancelIconComponent={
                //   <Text style={{ color: "white" }}>Cancel</Text>
                // }
                hideSelect
                hideSearch
                confirmText={Languages.Confirm}
                selectedItems={this.state.selectedClassifications}
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
                          this.ClassificationMultiSelect._submitSelection();
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
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRightWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRightColor: Color.secondary,
                }}
                onPress={() => {
                  this.ClassificationMultiSelect._toggleSelector();
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    paddingVertical: 10,
                    maxWidth: 100,
                  }}
                  numberOfLines={1}>
                  {this.state.selectedClassification
                    ? this.state.selectedClassification.Name
                    : Languages.Classification}
                </Text>
                <IconFa
                  name={'caret-down'}
                  size={15}
                  color={'#000'}
                  //    style={{ position: "relative", top: 10 }}
                  style={{marginLeft: 5}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  //     borderRightWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRightColor: Color.secondary,
                }}
                onPress={() => {
                  this.CompetenceMultiSelect._toggleSelector();
                }}>
                {false && (
                  <IconFa
                    name={'cog'}
                    size={20}
                    color={'#000'}
                    //    style={{ position: "relative", top: 10 }}
                    style={{marginRight: 5}}
                  />
                )}
                <Text style={{textAlign: 'center', paddingVertical: 10}}>
                  {this.state.selectedCompetence
                    ? this.state.selectedCompetence.Name
                    : Languages.Competence}
                </Text>
                <IconFa
                  name={'caret-down'}
                  size={15}
                  color={'#000'}
                  //    style={{ position: "relative", top: 10 }}
                  style={{marginLeft: 5}}
                />
              </TouchableOpacity>
            </View>
          )}

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          windowSize={6}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          ListHeaderComponent={
            (this.props.user && this.props.user?.IsDealer) ||
            (this.props.user &&
              !this.props.user?.IsDealer &&
              this.props.user?.MemberOf &&
              this.props.user?.MemberOf.filter(
                x => x.ID == '33333333-3333-3333-3333-333333333333',
              ).length > 0) ? (
              <></>
            ) : (
              <TouchableOpacity
                style={{
                  width: Dimensions.get('screen').width * 0.95,

                  alignSelf: 'center',
                  flexDirection: 'row',
                  elevation: 1,
                  borderRadius: 5,
                  marginBottom: 10,
                  marginTop: 15,
                  backgroundColor: 'green',
                  paddingVertical: 5,
                  //   minHeight: 50,
                }}
                onPress={() => {
                  this.props.navigation.navigate('DealerSignUp', {
                    BecomeADealer:
                      this.props.user &&
                      !this.props.user.IsDealer &&
                      this.props.user.MemberOf &&
                      this.props.user.MemberOf.filter(
                        x => x.ID == '33333333-3333-3333-3333-333333333333',
                      ).length == 0,
                  });
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      padding: 5,
                      fontFamily: 'Cairo-Regular',
                      fontSize: 18,
                    }}>
                    {Languages.AddYourStore}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }
          data={this.state.Dealers}
          renderItem={this.renderItem.bind(this)}
          onEndReached={() => {
            //  alert(this.state.page);
            this.setState({page: this.state.page + 1}, () => {
              if (this.state.page <= this.state.TotalPages) {
                this.setState({footerLoading: true});

                KS.DealersGet({
                  langid: Languages.langID,
                  page: this.state.page,
                  pagesize: 10,
                  listingtype: this.state.selectedCompetence
                    ? this.state.selectedCompetence.ID
                    : '',
                  isocode: this.state.cca2 || '',

                  seed: this.state.seed,
                  classification: this.state.selectedClassification
                    ? this.state.selectedClassification.ID
                    : '',
                }).then(data => {
                  if (data && data.Success) {
                    let concattedDealers = this.state.Dealers;
                    let tempBanners = this.state.Banners || [];
                    if (this.state.Banners?.length > 0) {
                      concattedDealers.push({
                        AutoBeebBanner: true,
                        BannerDetails: tempBanners.shift(),
                      });
                      this.setState({Banners: tempBanners});
                    }
                    //  else {
                    //   concattedDealers.push({Banner: true});
                    // }

                    concattedDealers = concattedDealers.concat(data.Dealers);

                    this.setState({
                      Dealers: concattedDealers,
                    });
                  }

                  setTimeout(() => {
                    this.setState({
                      dealersLoading: false,
                      footerLoading: false,
                    });
                  }, 1000);
                });
              }
            });
          }}
          onEndReachedThreshold={5} //im not sure about this was 0.5
          ListFooterComponent={
            this.state.footerLoading && (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 10,
                  marginBottom: 80,
                }}>
                <ActivityIndicator size="large" color={'#F85502'} />
              </View>
            )
          }
        />
      </View>
    );
  }
}

const mapStateToProps = ({menu, user}) => ({
  ViewingCountry: menu.ViewingCountry,
  user: user.user,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/MenuRedux');

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),

    //  fetchListings: (parentid) => Listingredux.actions.fetchListings(dispatch, parentid, 1)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DealersScreen);
