import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Share,
  I18nManager,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import {connect} from 'react-redux';
import {Styles, Color, Constants, Languages} from '../../common';
import PropTypes from 'prop-types';
import IconFA from 'react-native-vector-icons/FontAwesome';
import KS from '../../services/KSAPI';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconEN from 'react-native-vector-icons/Entypo';
import IconIO from 'react-native-vector-icons/Ionicons';
import {isIphoneX} from 'react-native-iphone-x-helper';
import LinearGradient from 'react-native-linear-gradient';
import Moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconFa5 from 'react-native-vector-icons/FontAwesome5';

class Drawer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      hasImage: true,
      loadingBuffer: true,
      imageRefreshCount: 0,
      userCountry: null,
      date: new Date(),
      HasBanner: true,
      addTime: true,
      bannerPic:
        this.props.user && this.props.user.ID
          ? 'http://autobeeb.com' +
            '/content/dealers/' +
            props.user.ID +
            '/' +
            props.user.ID +
            '_1024x653.jpg'
          : undefined,
    };
    this.handleFocus = this.handleFocus.bind(this);
  }
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  handleFocus() {
    StatusBar.setBarStyle('dark-content');
    if (this.props.user) {
      KS.UserGet({
        userID: this.props.user.ID,
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success == 1) {
          if (data.User == null) {
            this.Logout();
          } else {
            this.props.storeUserData(data.User, () => {
              this.setState({
                userInfoLoaded: true,
                userLimit:
                  data.User && data.User.IsDealer
                    ? data.User.DealerLimit
                    : data.User.UserLimit,
                isDealer: data.User && data.User.IsDealer,
                ActiveListings: data.ActiveListings,
                InActiveListings: data.InActiveListings,
                Statistic: data.Statistic,
              });
            });
          }
        }
      });

      KS.WatchlistGet({
        langid: Languages.langID,
        userid: this.props.user.ID,
        pagesize: 1000,
        page: 1,
        type: 1,
      }).then(data => {
        if (data && data.Success) {
          this.setState({Favorites: data.Listings});
        }
      });
    }
  }

  componentDidMount() {
    if (!!this.props.navigation)
      this.focusListener = this.props.navigation.addListener(
        'focus',
        this.handleFocus,
      );

    if (this.props.user) {
      KS.GetPlusSubscription({
        userID: this.props.user.ID,
        langid: Languages.langID,
      })
        .then(res => {
          this.setState({DealerPlusSubscription: res.DealerPlusSubscription});
        })
        .catch(err => {});
    }

    if (this.props.user) {
      KS.UserGet({
        userID: this.props.user.ID,
        langid: Languages.langID,
      }).then(data => {
        if (data && data.Success == 1) {
          if (data.User == null) {
            this.Logout();
          } else {
            this.props.storeUserData(data.User, () => {
              this.setState(
                {
                  userInfoLoaded: true,
                  userLimit:
                    data.User && data.User.IsDealer
                      ? data.User.DealerLimit
                      : data.User.UserLimit,
                  isDealer: data.User && data.User.IsDealer,
                  ActiveListings: data.ActiveListings,
                  InActiveListings: data.InActiveListings,
                  Statistic: data.Statistic,
                },
                () => {
                  //console.log("active" + data.ActiveListings);
                  // console.log("inactive" + data.InActiveListings);
                },
              );
            });
          }
        }
      });

      KS.WatchlistGet({
        langid: Languages.langID,
        userid: this.props.user.ID,
        pagesize: 1000,
        page: 1,
        type: 1,
      }).then(data => {
        if (data && data.Success) {
          this.setState({Favorites: data.Listings});
        }
      });

      KS.GetCountry({Id: this.props.user.Country})
        .then(res => {
          this.setState({userCountry: res.Country});
        })
        .catch(err => {
          console.log({err});
        });
    }
    setTimeout(() => {
      this.setState({loadingBuffer: false});
    }, 100);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user != this.props.user) {
      this.setState({
        imageRefreshCount: this.state.imageRefreshCount + 1,
        date: new Date(),
      });
    }
  }

  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
    });
  }

  AppLink() {
    return `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;
  }
  
  share() {
    Share.share({
      message: Languages.DownloadAutobeeb + '\n \n' + this.AppLink(),
    });
  }

  shareAccount() {
    if (this.state.isDealer) {
      Share.share({
        message:
          Languages.ShareAccountMessage +
          '\n' +
          `${
            I18nManager.isRTL
              ? `https://autobeeb.com/ar/dealer/profile/${this.props.user.ID}`
              : `https://autobeeb.com/dealer/profile/${this.props.user.ID}`
          }   ` +
          '\n' +
          '\n' +
          Languages.DownloadAutobeeb +
          '\n' +
          this.AppLink(),
      });
    } else {
      Share.share({
        message:
          Languages.ShareAccountMessage +
          '\n' +
          `${
            I18nManager.isRTL
              ? `https://autobeeb.com/ar/user/profile/${this.props.user.ID}`
              : `https://autobeeb.com/user/profile/${this.props.user.ID}`
          }   ` +
          '\n' +
          '\n' +
          Languages.DownloadAutobeeb +
          '\n' +
          this.AppLink(),
      });
    }
  }

  render() {
    if (this.state.loadingBuffer) {
      return <View />;
    }

    return (
      <ScrollView style={styles.container}>
        <StatusBar
          backgroundColor="#fff"
          barStyle="dark-content"
          translucent={false}
        />

        {!this.props.user ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              padding: 15,
              paddingTop: Platform.select({ios: 5, android: 25}),
            }}>
            <Image
              style={{
                width: Dimensions.get('screen').width * 0.6,
                height: 40,
              }}
              resizeMode={'contain'}
              source={require('../../images/autobeeb.png')}
            />
          </View>
        ) : (
          <View
            style={{
              //  minHeight: Dimensions.get("screen").height * 0.3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
              height: this.state.isDealer
                ? Dimensions.get('screen').width / 1.77
                : 100,
              borderBottomWidth: 1,
              borderBottomColor: '#bbb',
              //   padding: 10,
              paddingTop: Platform.select({
                ios: isIphoneX() ? 25 : 5,
                android: 25,
              }),
            }}>
            {this.state.isDealer && (
              <TouchableOpacity
                onPress={() => {
                  KS.UserGet({
                    userID: this.props.user.ID,
                    langid: Languages.langID,
                  }).then(data => {
                    //   alert(JSON.stringify(data));
                    if (data && data.Success == 1) {
                      this.props.storeUserData(data.User, () => {
                        if (data.User.IsDealer) {
                          this.props.navigation.navigate('DealerSignUp', {
                            Edit: true,
                          });
                        } else {
                          this.props.navigation.navigate('EditProfile');
                        }
                      });
                    } else {
                      this.props.navigation.navigate('EditProfile');
                    }
                  });
                }}
                style={{
                  position: 'absolute',
                  width: Dimensions.get('screen').width,
                  height: Dimensions.get('screen').width / 1.77,
                }}>
                {this.state.HasBanner ? (
                  <Image
                    style={{
                      width: Dimensions.get('screen').width,
                      height: Dimensions.get('screen').width / 1.77,
                      resizeMode: 'cover',
                    }}
                    source={{
                      uri:
                        this.state.bannerPic +
                        (this.state.addTime ? '?time=' + this.state.date : ''),
                      cache: 'force-cache',
                      priority: 'low',
                    }}
                    onError={e => {
                      this.setState({
                        HasBanner: false,
                        addTime: false,
                      });
                    }}
                  />
                ) : (
                  <Image
                    style={{
                      height: Dimensions.get('screen').width / 1.77,
                      alignSelf: 'center',
                    }}
                    resizeMode="contain"
                    source={require('../../images/Oldplaceholder.png')}
                  />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                KS.UserGet({
                  userID: this.props.user.ID,
                  langid: Languages.langID,
                }).then(data => {
                  if (data && data.Success == 1) {
                    this.props.storeUserData(data.User, () => {
                      if (data.User.IsDealer) {
                        this.props.navigation.navigate('DealerSignUp', {
                          Edit: true,
                        });
                      } else {
                        this.props.navigation.navigate('EditProfile');
                      }
                    });
                  } else {
                    this.props.navigation.navigate('EditProfile');
                  }
                });
              }}
              style={{
                flex: 1,
              }}>
              <LinearGradient
                colors={
                  this.state.isDealer
                    ? [
                        //   "rgba(255,255,255,0.3)",
                        // "rgba(255,255,255,0.3)",
                        // "rgba(255,255,255,0.5)",

                        // "rgba(255,255,255,0.8)",

                        'rgba(0,0,0,0)',
                        'rgba(0,0,0,0.5)',
                        'rgba(0,0,0,.7)',
                      ]
                    : [
                        'rgba(255,255,255,0.3)',
                        'rgba(255,255,255,0.5)',

                        'rgba(255,255,255,0.8)',
                      ]
                }
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: this.state.isDealer ? 100 : 0,
                  //    backgroundColor: "rgba(255,255,255,0.8)"
                }}>
                {this.props.user && this.props.user.ThumbImage ? (
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginLeft: 10,
                      marginVertical: 15,
                    }}
                    source={{
                      uri:
                        'https://autobeeb.com/' +
                        this.props.user.FullImagePath +
                        '_400x400.jpg' +
                        '?time=' +
                        this.state.date,
                      cache: 'force-cache',
                      priority: 'low',
                    }}
                    onError={e => {
                      this.setState({
                        hasImage: false,
                      });
                    }}
                  />
                ) : (
                  <IconFA
                    name="user-circle"
                    size={50}
                    color={this.state.isDealer ? 'white' : 'black'}
                    style={{marginLeft: 10, marginVertical: 15}}
                  />
                )}

                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                  }}
                  disabled>
                  <Text
                    style={{
                      color: this.state.isDealer ? '#fff' : '#000',
                      fontSize: 18,
                      textAlign: 'left',
                      textAlignVertical: 'center',
                    }}>
                    {this.props.user &&
                      this.props.user.Name &&
                      this.props.user.Name.charAt(0).toUpperCase() +
                        this.props.user.Name.slice(1, 22)}
                  </Text>

                  <Text
                    style={{
                      //color: Color.secondary,
                      textAlign: 'left',
                      fontSize: 16,
                      textAlignVertical: 'center',
                      color: this.state.isDealer ? '#fff' : '#000',
                    }}>
                    {Languages.EditProfile}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.rowsContainer}>
          {!this.props.user && (
            <TouchableOpacity
              style={styles.rowStyle}
              onPress={() => {
                this.props.navigation.navigate('LoginScreen');
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconMC
                  name="login"
                  size={20}
                  color={Color.secondary}
                  //    style={{ marginRight: 15 }}
                />
              </View>

              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.SignInSignUp}
              </Text>
            </TouchableOpacity>
          )}
          {!this.props.user && (
            <TouchableOpacity
              style={styles.rowStyle}
              onPress={() => {
                this.props.navigation.navigate('DealerSignUp');
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconFA
                  name="building"
                  size={20}
                  color={Color.secondary}
                  //    style={{ marginRight: 15 }}
                />
              </View>

              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.SignUpAsDealer}
              </Text>
            </TouchableOpacity>
          )}
          {this.props.user &&
            this.props.user.IsDealer &&
            this.props.user.MemberOf &&
            this.props.user.PaidPlans && (
              <View
                style={[
                  styles.rowsContainer,
                  {height: 65, justifyContent: 'center'},
                ]}>
                <Text
                  style={{
                    //color: Color.secondary,
                    textAlign: 'center',
                    fontSize: 16,
                    textAlignVertical: 'center',
                    color: '#ff0000',
                  }}>
                  {Languages.SubscriptionExpiry} {'\n'}
                  {Moment(
                    this.props.user.MemberOf.find(
                      x => x.ID == '33333333-3333-3333-3333-333333333333',
                    ).EndDate,
                  ).format('YYYY-MM-DD')}
                </Text>
              </View>
            )}

          {this.props.user &&
            this.props.user.IsDealer &&
            this.props.user.MemberOf &&
            this.state.DealerPlusSubscription && (
              <View style={[styles.rowsContainer]}>
                <View
                  style={[
                    {
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      paddingHorizontal: 16,
                    },
                  ]}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      textAlignVertical: 'center',
                      color: '#ff0000',
                    }}>
                    {Languages.SubscDealerPlus}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      textAlignVertical: 'center',
                      color: '#ff0000',
                    }}>
                    {Moment(this.state.DealerPlusSubscription.CreatedAt)
                      .add(1, 'M')
                      .format('YYYY-MM-DD')}
                  </Text>
                </View>
                <Pressable
                  style={{
                    alignSelf: 'flex-end',
                    marginEnd: 16,
                  }}
                  onPress={() => {
                    this.props.navigation.navigate('DealerPlusRenewal', {
                      DealerPlusPlanId:
                        this.state.DealerPlusSubscription.PlanId,
                      userCountry: this.state.userCountry,
                    });
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      textAlignVertical: 'center',
                      color: Color.secondary,
                    }}>
                    {Languages.Renew}
                  </Text>
                </Pressable>
              </View>
            )}
          <TouchableOpacity
            style={styles.rowStyle}
            onPress={() => {
              this.props.navigation.navigate('PostOfferScreen');
            }}>
            <View
              style={{
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                style={{tintColor: Color.secondary, width: 25, height: 25}}
                resizeMode="contain"
                source={require('../../images/PostOfferTrans.png')}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'space-between',
              }}>
              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.PostOffer}
              </Text>
              <Text
                style={{
                  borderRadius: 15,
                  overflow: 'hidden',
                  color: '#fff',
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                  backgroundColor: Color.primary,
                }}>
                {Languages.FREE}
              </Text>
            </View>
          </TouchableOpacity>

          {this.props.user &&
            !this.props.user.IsDealer &&
            this.props.user.MemberOf &&
            this.props.user.MemberOf.filter(
              x => x.ID == '33333333-3333-3333-3333-333333333333',
            ).length == 0 && (
              <TouchableOpacity
                style={styles.rowStyle}
                onPress={() => {
                  this.props.navigation.navigate('DealerSignUp', {
                    BecomeADealer: true,
                  });
                }}>
                <View
                  style={{
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconFA
                    name="building"
                    size={20}
                    color={Color.secondary}
                    //    style={{ marginRight: 15 }}
                  />
                </View>

                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.BecomeADealer}
                </Text>
              </TouchableOpacity>
            )}
        </View>

        {this.props.user && (
          <View style={styles.rowsContainer}>
            <TouchableOpacity
              style={styles.rowStyle}
              onPress={() => {
                this.props.navigation.navigate('ActiveOffers', {
                  userid: this.props.user.ID,
                  status: 16,
                  active: true,
                });
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconMC
                  name="playlist-check"
                  size={25}
                  color={'green'}
                  //    style={{ marginRight: 15 }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexGrow: 1,
                  justifyContent: 'space-between',
                }}>
                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.ActiveOffers}
                </Text>
                {this.state &&
                  this.state.ActiveListings != null &&
                  this.state.userLimit > 0 && (
                    <Text
                      style={{
                        textAlign: 'right',
                        color: Color.primary,
                        fontSize: 20,
                      }}>
                      {this.state.ActiveListings + '/' + this.state.userLimit}
                    </Text>
                  )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rowStyle}
              onPress={() => {
                this.props.navigation.navigate('ActiveOffers', {
                  userid: this.props.user.ID,
                  status: 10,
                  active: false,
                });
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconMC
                  name="playlist-remove"
                  size={25}
                  color={'red'}
                  //    style={{ marginRight: 15 }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flexGrow: 1,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.InActiveOffers}
                </Text>
                {this.state &&
                  this.state.InActiveListings != null &&
                  this.state.InActiveListings > 0 && (
                    <Text
                      style={{
                        textAlign: 'center',
                        color: Color.primary,
                        fontSize: 20,
                      }}>
                      {this.state.InActiveListings}
                    </Text>
                  )}
              </View>
            </TouchableOpacity>
            {this.state.isDealer && (
              <View style={styles.rowStyle}>
                <View
                  style={{
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconFa5 name={'eye'} size={18} color={Color.secondary} />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{color: '#000', fontSize: 17}}>
                    {Languages.NumberViewsMyAds}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: Color.primary,
                      fontSize: 20,
                    }}>
                    {(this.state.Statistic?.ViewsClicks ?? 0) +
                      (this.state.Statistic?.ScViews ?? 0)}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              //hide
              style={[styles.rowStyle, {justifyContent: 'space-between'}]}
              onPress={() => {
                this.props.navigation.navigate('FavoriteScreen');
              }}>
              <View
                style={{
                  flexDirection: 'row',

                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconFA
                    name="heart"
                    size={20}
                    color={Color.primary}
                    //    style={{ marginRight: 15 }}
                  />
                </View>

                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.MyFavourites}
                </Text>
              </View>
              {this.state &&
                this.state.Favorites &&
                this.state.Favorites.length > 0 && (
                  <Text style={{color: Color.primary, fontSize: 20}}>
                    {this.state.Favorites.length}
                  </Text>
                )}
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.rowsContainer}>
          {this.props.user && (
            <TouchableOpacity
              style={styles.rowStyle}
              onPress={() => {
                this.props.navigation.navigate('MessagesScreen');
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconIO name="chatbubbles" size={25} color={Color.secondary} />
              </View>

              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.MyChats}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {
          <View style={styles.rowsContainer}>
            {/*hide */}
            <TouchableOpacity
              style={styles.rowStyle}
              onPress={() => {
                this.props.navigation.navigate('HomeScreen', {
                  screen: 'BlogsScreen',
                });
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconEN
                  name="newsletter"
                  size={20}
                  color={Color.secondary}
                  //    style={{ marginRight: 15 }}
                />
              </View>

              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.Blog}
              </Text>
            </TouchableOpacity>
            {
              <TouchableOpacity
                style={styles.rowStyle}
                onPress={() => {
                  this.props.navigation.navigate('DealersScreen');
                }}>
                <View
                  style={{
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconFA
                    name="users"
                    size={20}
                    color={Color.secondary}
                    //  style={{ marginRight: 15 }}
                  />
                </View>

                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.Dealers}
                </Text>
              </TouchableOpacity>
            }

            {
              <TouchableOpacity
                style={styles.rowStyle}
                onPress={() => {
                  this.props.navigation.navigate('HomeScreen', {
                    screen: 'RecentlyViewedScreen',
                  });
                }}>
                <View
                  style={{
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconMC
                    name="eye"
                    size={20}
                    color={Color.secondary}
                    //    style={{ marginRight: 15 }}
                  />
                </View>

                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.RecentlyViewed}
                </Text>
              </TouchableOpacity>
            }
          </View>
        }

        <View style={styles.rowsContainer}>
          {this.state.userCountry &&
            this.state.userCountry.WithFee &&
            !!this.props.user && (
              <TouchableOpacity
                //hide
                style={styles.rowStyle}
                onPress={() => {
                  this.props.navigation.navigate('PaymentDetailsAutobeeb', {
                    userCountry: this.state.userCountry,
                    user: this.props.user,
                  });
                }}>
                <View
                  style={{
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconMC
                    name="credit-card"
                    size={26}
                    color={Color.secondary}
                    style={{marginRight: 10}}
                  />
                </View>

                <Text style={{color: '#000', fontSize: 17}}>
                  {Languages.DetailsPayToAutobeeb}
                </Text>
              </TouchableOpacity>
            )}
          {
            <TouchableOpacity
              //hide
              style={styles.rowStyle}
              onPress={() => {
                this.share();
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconEN
                  name="share"
                  size={20}
                  color={Color.secondary}
                  //  style={{ marginRight: 15 }}
                />
              </View>

              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.ShareApplication}
              </Text>
            </TouchableOpacity>
          }
          {this.props.user && (
            <TouchableOpacity
              //hide
              style={styles.rowStyle}
              onPress={() => {
                this.shareAccount();
              }}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconMC
                  name="account-box"
                  size={20}
                  color={Color.secondary}
                  //  style={{ marginRight: 15 }}
                />
              </View>

              <Text style={{color: '#000', fontSize: 17}}>
                {Languages.ShareAccount}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.rowStyle}
            onPress={() => {
              this.props.navigation.navigate('SettingScreen');
            }}>
            <View
              style={{
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconIO
                name="settings"
                size={20}
                color={Color.secondary}
                //  style={{ marginRight: 15 }}
              />
            </View>

            <Text style={{color: '#000', fontSize: 17}}>
              {Languages.Settings}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 40}}></View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  AuthButton: {
    paddingHorizontal: 20,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: Color.secondary,
  },

  rowsContainer: {
    //  borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    // marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  container: {
    paddingTop: Platform.select({ios: 40, android: 0}),

    flex: 1,
    backgroundColor: '#fff',
    //   backgroundColor: "#F2F2F2"
  },
  avatar: {
    height: Styles.width / 3,
    width: Styles.width / 3,
    borderRadius: Styles.width / 8,
    //  marginBottom: 10
  },
  avatar_background: {
    padding: 10,
    backgroundColor: Color.SideMenu,
  },
  fullName: {
    fontWeight: '400',
    textAlign: 'center',
    color: Color.SideMenuText,
    backgroundColor: 'transparent',
    fontSize: Styles.FontSize.medium,
    marginBottom: 6,
    fontFamily: Constants.fontFamily,
  },
  email: {
    color: '#D24B92',
    backgroundColor: 'transparent',
    fontSize: 13,
  },
});

Drawer.propTypes = {
  user: PropTypes.object,
};
const mapDispatchToProps = dispatch => {
  const UserRedux = require('../../redux/UserRedux');
  const MenuRedux = require('../../redux/MenuRedux');
  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),

    setViewingCountry: (country, callback) =>
      MenuRedux.actions.setViewingCountry(dispatch, country, callback),
    storeUserData: (user, callback) =>
      UserRedux.actions.storeUserData(dispatch, user, callback),
  };
};
const mapStateToProps = ({user}) => ({
  user: user.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
