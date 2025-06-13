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
  StyleSheet,
} from 'react-native';
import KS from '../services/KSAPI';
import {Languages, Color} from '../common';
import IconIon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import IconFe from 'react-native-vector-icons/Feather';
import {screenWidth} from '../autobeeb/constants/Layout';

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
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <IconIon
              name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
              color={'#000'}
              size={30}
            />
          </TouchableOpacity>

          <View style={styles.searchInputContainer}>
            <TextInput
              ref={'SearchInput'}
              style={styles.searchInput}
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
                style={styles.clearButton}
                onPress={() => {
                  this.setState({query: 0, Suggestions: []});
                }}>
                <IconIon
                  name="close-circle"
                  color={'#555'}
                  size={27}
                  style={styles.clearIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {this.state.isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={'#F85502'} />
          </View>
        )}

        {this.state.Suggestions &&
        !this.state.isLoading &&
        this.state.Suggestions.length > 0 &&
        !!this.state.query ? (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            extraData={this.state.Suggestions}
            data={this.state.Suggestions}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={styles.suggestionItem}
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
                  }}>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionText}>{item.Label}</Text>
                    {false && item.ModelID == '' && (
                      <Text style={styles.suggestionType}>
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
          <View style={styles.emptyContainer}>
            {!this.state.isLoading && this.props.recentSearched?.length > 0 && (
              <View style={styles.recentSearchContainer}>
                <Text style={styles.sectionTitle}>
                  {Languages.LatestSearches}
                </Text>

                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  contentContainerStyle={styles.recentSearchList}
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                  data={this.props.recentSearched}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity
                        style={styles.recentSearchItem}
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
                        <View style={styles.recentSearchItemContent}>
                          <Text style={styles.recentSearchText}>{item}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {!this.state.isLoading &&
              this.state.recentSeenListings?.length > 0 && (
                <View style={styles.recentListingsContainer}>
                  <Text style={styles.sectionTitle}>
                    {Languages.RecentlyViewed}:
                  </Text>

                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    contentContainerStyle={styles.recentListingsList}
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
                            style={styles.seeMoreButton}>
                            <View style={styles.seeMoreContent}>
                              <Text style={styles.seeMoreText}>
                                {Languages.ShowMore}
                              </Text>
                              <IconFe
                                name={
                                  I18nManager.isRTL
                                    ? 'chevrons-left'
                                    : 'chevrons-right'
                                }
                                style={styles.seeMoreIcon}
                                color={'gray'}
                                size={20}></IconFe>
                            </View>
                          </TouchableOpacity>
                        );
                      } else
                        return (
                          <TouchableOpacity
                            style={styles.listingItem}
                            onPress={() => {
                              this.props.navigation.replace('CarDetails', {
                                item: item,
                                id: item.ID,
                              });
                            }}>
                            {item.Images?.length > 0 ||
                            item.images?.length > 0 ? (
                              <Image
                                style={styles.listingImage}
                                source={{
                                  uri:
                                    'https://autobeeb.com/' +
                                    (item.FullImagePath || item.fullImagePath) +
                                    '_400x400.jpg',
                                }}
                                resizeMode="cover"
                              />
                            ) : (
                              <Image
                                style={styles.placeholderImage}
                                source={require('../images/placeholder.png')}
                                resizeMode="contain"
                              />
                            )}

                            <View style={styles.listingInfo}>
                              {false && (
                                <Image
                                  style={styles.brandImage}
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
                                style={styles.listingName}>
                                {item.Name}
                              </Text>
                            </View>

                            {!!item.CountryName && (
                              <Text
                                numberOfLines={1}
                                style={styles.locationText}>
                                {item.CountryName} / {item.CityName}
                              </Text>
                            )}

                            <View style={styles.priceContainer}>
                              {!!item.FormatedPrice && (
                                <Text
                                  numberOfLines={1}
                                  style={[
                                    styles.priceText,
                                    {
                                      textAlign:
                                        item.PaymentMethod != 2
                                          ? 'center'
                                          : 'left',
                                    },
                                  ]}>
                                  {item.FormatedPrice}
                                </Text>
                              )}

                              {item.PaymentMethod &&
                                item.PaymentMethod == 2 && (
                                  <Text
                                    numberOfLines={1}
                                    style={styles.installmentText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  backButton: {
    paddingVertical: 6,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 0.9,
    fontSize: 18,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    fontFamily: 'Cairo-Regular',
  },
  clearButton: {},
  clearIcon: {},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionText: {
    color: '#000',
  },
  suggestionType: {
    color: Color.primary,
  },
  emptyContainer: {},
  recentSearchContainer: {
    marginTop: 5,
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    textAlign: 'left',
    marginHorizontal: 7,
  },
  recentSearchList: {
    paddingHorizontal: 4,
    width: screenWidth,
  },
  recentSearchItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginTop: 5,
    elevation: 1,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  recentSearchItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentSearchText: {
    color: '#000',
  },
  recentListingsContainer: {
    marginHorizontal: 0,
    marginTop: Dimensions.get('screen').height * 0.15,
    justifyContent: 'center',
  },
  recentListingsList: {
    paddingHorizontal: 2,
    width: '100%',
  },
  seeMoreButton: {
    flexGrow: 1,
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
  },
  seeMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreText: {
    color: 'gray',
  },
  seeMoreIcon: {
    marginTop: 3,
    marginLeft: 10,
  },
  listingItem: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginTop: 5,
    elevation: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    width: Dimensions.get('window').width * 0.4,
  },
  listingImage: {
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').width * 0.4,
  },
  placeholderImage: {
    width: Dimensions.get('window').width * 0.35,
    height: Dimensions.get('window').width * 0.4,
    alignSelf: 'center',
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  brandImage: {
    width: 22,
    height: 22,
  },
  listingName: {
    color: '#000',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 14,
  },
  locationText: {
    fontSize: 13,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  priceText: {
    color: Color.primary,
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
    paddingLeft: 5,
    flex: 6,
  },
  installmentText: {
    color: '#2B9531',
    fontSize: 12,
    flex: 5,
    textAlign: 'center',
  },
});

const mapDispatchToProps = dispatch => {
  const {actions, recentFreeSeach} = require('../redux/RecentListingsRedux');

  return {
    updateRecentlySearched: searchStatement => {
      dispatch(recentFreeSeach(searchStatement));
    },
  };
};

const mapStateToProps = ({recentListings}) => ({
  recentSearched: recentListings.recentFreeSeach.map(x => x.keyword),
  recentSeenListings: recentListings.recentOpenListings,
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);
