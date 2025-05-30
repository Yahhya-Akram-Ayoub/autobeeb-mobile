import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  I18nManager,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import KS from '../services/KSAPI';
import {Languages, Color} from '../common';
import IconIon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import IconFe from 'react-native-vector-icons/Feather';

export class SearchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      Suggestions: [],
      recentSeenListings: this.props.recentSeenListings,
    };
  }
  componentDidMount() {
    if (!!this.props.route.params?.query) {
      this.setState({query: this.props.route.params?.query ?? 0}, () => {
        KS.QuickSearch({
          langid: Languages.langID,
          query: this.state.query,
        }).then(data => {
          if (data && data.Success) {
            this.setState({
              Suggestions: data.Suggestions,
            });
          }
        });
      });
    }

    if (this.props.recentSeenListings?.length > 5) {
      let tempSeenListings = this.props.recentSeenListings.slice(0, 5);
      tempSeenListings.push({SeeMore: true});
      this.setState({
        recentSeenListings: tempSeenListings,
      });
    }
  }
  convertToNumber(number) {
    if (number) {
      number = number + '';
      return number
        .replace(/٠/g, '0')
        .replace(/،/g, '.')
        .replace(/٫/g, '.')
        .replace(/,/g, '.')
        .replace(/١/g, '1')
        .replace(/٢/g, '2')
        .replace(/٣/g, '3')
        .replace(/٤/g, '4')
        .replace(/٥/g, '5')
        .replace(/٦/g, '6')
        .replace(/٧/g, '7')
        .replace(/٨/g, '8')
        .replace(/٩/g, '9');
    } else return '';
  }

  render() {
    const _this = this;
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            // marginTop: Platform.select({ios: 40, android: 36}),
            borderBottomWidth: 1,
            borderBottomColor: '#000',
          }}>
          <TouchableOpacity
            style={{
              paddingVertical: 6,
              width: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <IconIon
              name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
              color={'#000'}
              size={30}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TextInput
              ref={'SearchInput'}
              style={{
                flex: 0.9,
                fontSize: 18,
                textAlign: I18nManager.isRTL ? 'right' : 'left',
                fontFamily: 'Cairo-Regular',
              }}
              value={this.state.query}
              placeholder={Languages.SearchByMakeOrModel}
              onChangeText={text => {
                let FormattedText = this.convertToNumber(text);
                this.setState({isLoading: true});
                if (this.timeout) {
                  clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                  //  alert("called");
                  KS.QuickSearch({
                    langid: Languages.langID,
                    query: FormattedText,
                  }).then(data => {
                    if (data && data.Success) {
                      this.setState({
                        Suggestions: data.Suggestions,
                        isLoading: false,
                      });
                    }
                  });
                }, 1000);

                this.setState({query: text});
              }}
              onSubmitEditing={() => {
                this.props.navigation.replace('SearchResult', {
                  submitted: true,
                  query: this.state.query,
                });
                if (this.state.query) {
                  this.props.updateRecentlySearched(this.state.query);
                }
              }}
            />
            {!!this.state.query && (
              <TouchableOpacity
                style={{}}
                onPress={() => {
                  this.setState({query: 0, Suggestions: []});
                }}>
                <IconIon
                  name="close-circle"
                  color={'#555'}
                  size={27}
                  style={{}}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {this.state.isLoading && (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color={'#F85502'} />
          </View>
        )}

        {this.state.Suggestions &&
        !this.state.isLoading &&
        this.state.Suggestions.length > 0 &&
        !!this.state.query ? (
          <FlatList
            //  contentContainerStyle={{ flex: 1 }}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            extraData={this.state.Suggestions}
            data={this.state.Suggestions}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                  }}
                  onPress={() => {
                    this.props.navigation.replace('SearchResult', {
                      query: item.Label,
                      MakeID: item.MakeID,
                      ModelID: item.ModelID,
                      Make: {ID: parseInt(item.MakeID), Name: item.MakeName},
                      Model: {
                        ID: parseInt(item.ModelID),
                        Name: item.ModelName,
                      },
                    });
                    this.props.updateRecentlySearched(item.Label);

                    // KS.MakesGet({
                    //   langID: Languages.langID,
                    //   listingType: item.ListingType.ID
                    // }).then(data => {
                    //   let AllMakes = {
                    //     //  FullImagePath: "yaz",
                    //     ID: "",
                    //     All: true,

                    //     Image: require("../images/SellTypes/BlueAll.png"),
                    //     AllMake: true,
                    //     Name: Languages.AllMakes
                    //   };
                    //   data.unshift(AllMakes);

                    //   _this.props.navigation.replace("ListingsScreen", {
                    //     ListingType: item.ListingType,
                    //     SellType: Constants.sellTypesFilter[0],
                    //     selectedMake: { Name: item.MakeName, ID: item.MakeID },
                    //     selectedModel: {
                    //       ID: item.ModelID,
                    //       Name: item.ModelName
                    //     },
                    //     Makes: data
                    //   });
                    // });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: '#000'}}>{item.Label}</Text>
                    {false && item.ModelID == '' && (
                      <Text style={{color: Color.primary}}>
                        {Languages.In + item.ListingType.Name}
                      </Text>
                    )}
                  </View>

                  <IconIon
                    name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
                    color={'#000'}
                    size={20}
                  />
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={{}}>
            {!this.state.isLoading && this.props.recentSearched?.length > 0 && (
              <View style={{marginTop: 5}}>
                <Text
                  style={{
                    fontFamily: 'Cairo-Bold',
                    textAlign: 'left',
                    marginHorizontal: 7,
                  }}>
                  {Languages.LatestSearches}
                </Text>

                <FlatList
                  //  contentContainerStyle={{ flex: 1 }}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  contentContainerStyle={{
                    paddingHorizontal: 4,
                    width: '100%',
                  }}
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                  data={this.props.recentSearched}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#ccc',
                          backgroundColor: 'white',
                          marginTop: 5,
                          elevation: 1,
                          paddingVertical: 5,
                          paddingHorizontal: 15,
                          borderRadius: 5,
                          marginHorizontal: 3,
                        }}
                        onPress={() => {
                          //alert(JSON.stringify(item));
                          this.props.updateRecentlySearched(item);
                          // this.props.navigation.replace("SearchResult", {
                          //   query: item,
                          //   submitted: true,
                          // });
                          this.setState({isLoading: true, query: item});

                          KS.QuickSearch({
                            langid: Languages.langID,
                            query: item,
                          }).then(data => {
                            if (data && data.Success) {
                              if (
                                data.Suggestions &&
                                data.Suggestions.length == 0
                              ) {
                                this.refs.SearchInput &&
                                  this.refs.SearchInput.focus();
                              }
                              this.setState({
                                Suggestions: data.Suggestions,
                                isLoading: false,
                              });
                            } else {
                              this.setState({
                                isLoading: false,
                              });
                            }
                          });
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={{color: '#000'}}>{item}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {!this.state.isLoading &&
              this.state.recentSeenListings?.length > 0 && (
                <View
                  style={{
                    marginHorizontal: 0,
                    marginTop: Dimensions.get('screen').height * 0.15,

                    justifyContent: 'center',
                    //   backgroundColor: "blue",
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Cairo-Bold',
                      textAlign: 'left',
                      marginHorizontal: 7,
                    }}>
                    {Languages.RecentlyViewed}:
                  </Text>

                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    //   inverted={I18nManager.isRTL}
                    contentContainerStyle={{
                      paddingHorizontal: 2,
                      width: '100%',
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}
                    data={this.state.recentSeenListings}
                    renderItem={({item, index}) => {
                      if (item.SeeMore) {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              this.props.navigation.navigate(
                                'RecentlyViewedScreen',
                              );
                            }}
                            style={{
                              flexGrow: 1,
                              backgroundColor: 'red',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: Dimensions.get('window').width * 0.4,
                              overflow: 'hidden',
                              borderWidth: 1,
                              borderColor: '#ccc',
                              backgroundColor: 'white',
                              marginTop: 5,
                              elevation: 1,
                              marginHorizontal: 7,
                              borderRadius: 5,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text style={{color: 'gray'}}>
                                {Languages.ShowMore}
                              </Text>
                              <IconFe
                                name={
                                  I18nManager.isRTL
                                    ? 'chevrons-left'
                                    : 'chevrons-right'
                                }
                                style={{marginTop: 3, marginLeft: 10}}
                                color={'gray'}
                                size={20}></IconFe>
                            </View>
                          </TouchableOpacity>
                        );
                      } else
                        return (
                          <TouchableOpacity
                            style={{
                              overflow: 'hidden',
                              borderWidth: 1,
                              borderColor: '#ccc',
                              backgroundColor: 'white',
                              marginTop: 5,
                              elevation: 1,

                              borderRadius: 5,
                              marginHorizontal: 5,
                              width: Dimensions.get('window').width * 0.4,
                            }}
                            onPress={() => {
                              this.props.navigation.replace('CarDetails', {
                                item: item,
                                id: item.ID,
                              });
                            }}>
                            {item.Images.length > 0 ? (
                              <Image
                                style={{
                                  width: Dimensions.get('window').width * 0.4,
                                  height: Dimensions.get('window').width * 0.4,

                                  //  borderColor: "#fff"
                                }}
                                source={{
                                  uri:
                                    'https://autobeeb.com/' +
                                    item.FullImagePath +
                                    '_400x400.jpg',
                                }}
                                resizeMode="cover"
                              />
                            ) : (
                              <Image
                                style={{
                                  width: Dimensions.get('window').width * 0.35,
                                  height: Dimensions.get('window').width * 0.4,
                                  alignSelf: 'center',
                                  //  borderColor: "#fff"
                                }}
                                source={require('../images/placeholder.png')}
                                resizeMode="contain"
                              />
                            )}

                            <View
                              style={{
                                //  backgroundColor: "red",
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                              }}>
                              {false && (
                                <Image
                                  style={{
                                    width: 22,
                                    height: 22,
                                    // marginLeft: 12,
                                    // marginRight: 6,
                                    //       flex: 1
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
                              )}
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: '#000',
                                  paddingVertical: 5,
                                  paddingHorizontal: 5,
                                  fontSize: 14,
                                }}>
                                {item.Name}
                              </Text>
                            </View>

                            {!!item.CountryName && (
                              <Text
                                numberOfLines={1}
                                style={{
                                  //     color: Color.primary,
                                  fontSize: 18,

                                  fontSize: 13,

                                  textAlign: 'center',
                                }}>
                                {item.CountryName} / {item.CityName}
                              </Text>
                            )}

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                              }}>
                              {!!item.FormatedPrice && (
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    color: Color.primary,
                                    fontSize: 18,
                                    fontFamily: 'Cairo-Bold',
                                    fontSize: 12,
                                    paddingLeft: 5,
                                    textAlign:
                                      item.PaymentMethod != 2
                                        ? 'center'
                                        : 'left',
                                    flex: 6,
                                  }}>
                                  {item.FormatedPrice}
                                </Text>
                              )}

                              {item.PaymentMethod &&
                                item.PaymentMethod == 2 && (
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      color: '#2B9531',
                                      fontSize: 12,
                                      flex: 5,
                                      textAlign: 'center',
                                    }}>
                                    {Languages.Installments}
                                  </Text>
                                )}
                            </View>
                          </TouchableOpacity>
                        );
                    }}
                  />
                </View>
              )}
          </View>
        )}
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/RecentListingsRedux');

  return {
    updateRecentlySearched: (searchStatement, callback) => {
      actions.updateRecentlySearched(dispatch, searchStatement, callback);
    },
  };
};

const mapStateToProps = ({recentListings}) => ({
  recentSearched: recentListings.recentSearched,
  recentSeenListings: recentListings.recentSeenListings,
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);
