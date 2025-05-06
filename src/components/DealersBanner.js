import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import {Languages, Color} from '../common';
import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import IconFa from 'react-native-vector-icons/FontAwesome';
import Communications from 'react-native-communications';
import FastImage from 'react-native-fast-image';
import KS from '../services/KSAPI';
import {connect} from 'react-redux';

class DealersBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.props.date || new Date(),
    };
  }

  // componentDidMount() {
  //   alert(JSON.stringify(this.props.item));
  //   console.log(this.props.item);
  // }

  render() {
    let coverPhoto = this.props.item.FullImagePath;
    let profilePhoto = this.props.item?.User?.FullImagePath;
    let Dealer = this.props.item.User;
    let isOnline = this.props.chat.onlineUsers?.includes(Dealer.ID);
    const DifferentCountry =
      this.props.cca2 != 'ALL' &&
      this.props.cca2 &&
      this.props.cca2 != this.props.item.ISOCode;

    return (
      <TouchableOpacity
        style={[
          this.props.full
            ? {
                //     elevation: this.props.dealerProfile ? 0 : 1,
                alignSelf: 'center',
                borderRadius: this.props.dealerProfile ? 0 : 5,
                marginVertical: this.props.dealerProfile ? 0 : 5,
                overflow: 'hidden',
                width: this.props.dealerProfile
                  ? Dimensions.get('screen').width
                  : Dimensions.get('screen').width * 0.95,
                height: this.props.dealerProfile
                  ? Dimensions.get('screen').width / 1.7
                  : (Dimensions.get('screen').width * 0.95) / 1.56,
              }
            : {
                borderWidth: 1,
                //    elevation: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                marginHorizontal: 5,
                overflow: 'hidden',
                width: Dimensions.get('screen').width * 0.85,
                height: (Dimensions.get('screen').width * 0.85) / 1.56,
              },
          DifferentCountry && {
            borderWidth: 3,
            borderColor: Color.primary,
          },
        ]}
        onPress={() => {
          this.props.navigation.navigate('DealerProfileScreen', {
            userid: Dealer.ID,
          });
        }}
        disabled={this.props.dealerProfile}
        // onLayout={(event) => {
        //   if (this.props.onLayout) {
        //     this.props.onLayout(event);
        //   }
        // }}
      >
        <FastImage
          style={
            this.props.full
              ? {
                  alignSelf: 'center',
                  justifyContent: 'flex-end',
                  borderRadius: this.props.dealerProfile ? 0 : 5,
                  width: this.props.dealerProfile
                    ? Dimensions.get('screen').width
                    : Dimensions.get('screen').width * 0.95,
                  height: this.props.dealerProfile
                    ? Dimensions.get('screen').width / 1.7
                    : (Dimensions.get('screen').width * 0.95) / 1.56,
                }
              : {
                  borderRadius: 5,
                  alignSelf: 'center',
                  justifyContent: 'flex-end',

                  width: Dimensions.get('screen').width * 0.85,
                  height: (Dimensions.get('screen').width * 0.85) / 1.56,
                }
          }
          imageStyle={{
            borderRadius: this.props.dealerProfile ? 0 : 5,
          }}
          resizeMode="cover"
          source={
            this.props.item.ThumbImage && !this.state.FailOverImage
              ? {uri: 'https://autobeeb.com/' + coverPhoto + '_750x420.jpg'}
              : require('../images/Oldplaceholder.png')
          }
          onError={() => {
            this.setState({FailOverImage: true});
          }}>
          {!this.props.dealerProfile && (
            <View
              style={{
                position: 'absolute',
                backgroundColor: isOnline ? 'green' : Color.primary,
                borderBottomLeftRadius: 5,
                top: 0,
                zIndex: 10,
                right: 0,
                paddingHorizontal: 5,
              }}>
              <Text style={{color: '#fff', textAlign: 'center'}}>
                {Languages.Ads + '' + this.props.item.ListingsCount}
              </Text>
            </View>
          )}
          <LinearGradient
            colors={[
              'rgba(0,0,0,0)',
              'rgba(0,0,0,0.4)',
              'rgba(0,0,0,0.5)',
              'rgba(0,0,0,0.6)',

              'rgba(0,0,0,.7)',
            ]}>
            <View
              style={{
                flexDirection: 'row',
                //   backgroundColor:'red',
                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'space-around',
              }}>
              <View>
                {Dealer &&
                Dealer.ThumbImage &&
                !this.state.FailOverProfileImage ? (
                  <Image
                    style={{
                      // flex: 1,
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginRight: 5,
                    }}
                    source={{
                      uri: `https://autobeeb.com/${profilePhoto}_400x400.jpg?time=${this.state.date}`,
                    }}
                    onError={() => {
                      this.setState({FailOverProfileImage: true});
                    }}
                  />
                ) : (
                  <IconFa
                    name="user-circle"
                    size={50}
                    color={'#fff'}
                    style={{marginRight: 15, flex: 1}}
                  />
                )}
                {isOnline && (
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 50,
                      backgroundColor: 'green',
                      position: 'absolute',
                      bottom: 5,
                      end: 3,
                    }}
                  />
                )}
              </View>

              <View style={{flex: 5}}>
                <Text
                  numberOfLines={1}
                  style={{color: '#fff', textAlign: 'left', fontSize: 15}}>
                  {Dealer && Dealer.Name}
                </Text>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {DifferentCountry && (
                    <FastImage
                      style={{width: 30, height: 30, marginRight: 5}}
                      resizeMode={'contain'}
                      source={{
                        uri:
                          'https://autobeeb.com/wsImages/flags/' +
                          this.props.item.ISOCode +
                          '.png',
                      }}
                    />
                  )}

                  {this.props.item.CityName &&
                    this.props.item.CountryName &&
                    !this.props.detailsScreen && (
                      <Text
                        numberOfLines={1}
                        style={{
                          color: '#fff',
                          fontSize: 13,
                          textAlign: 'left',
                        }}>
                        {this.props.item.CountryName +
                          ', ' +
                          this.props.item.CityName}
                      </Text>
                    )}
                </View>

                {Dealer && this.props.detailsScreen && (
                  <Text
                    style={{color: '#fff', fontSize: 13, textAlign: 'left'}}>
                    {Languages.MemberSince +
                      Moment(Dealer.RegistrationDate).format('YYYY-MM-DD')}
                  </Text>
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 10,
                marginTop: 5,
                marginBottom: 5,
                flexWrap: 'wrap',
                //  justifyContent: 'center',
                alignItems: 'center',
              }}>
              {!!(Dealer.Phone && !this.props.item.HideMobile) && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.secondary,
                    paddingHorizontal: 5,
                    borderRadius: 5,
                    marginRight: 10,
                    marginTop: 5,
                  }}
                  onPress={() => {
                    if (!!this.state.ShowPhone) {
                      Linking.openURL(`tel:${Dealer.Phone}`);
                    } else {
                      this.setState({ShowPhone: true});
                      KS.UpdateMobileClick({UserId: Dealer.ID});
                    }
                  }}>
                  <Text
                    style={[
                      {textAlign: 'left', color: '#fff'},
                      !this.props.full && {fontSize: 14},
                    ]}>
                    {this.state.ShowPhone
                      ? this.props.mobile
                        ? `\u200E${this.props.mobile}`
                        : `\u200E${Dealer.Phone}`
                      : `${
                          this.props.mobile ? this.props.mobile : Dealer.Phone
                        }`.replace(/.{4}$/, 'xxxx')}
                  </Text>
                </TouchableOpacity>
              )}

              {this.props.item.HideMobile &&
                this.props.mobile &&
                this.props.mobile != Dealer.Phone && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: Color.secondary,
                      paddingHorizontal: 5,
                      borderRadius: 5,
                      marginRight: 10,
                      marginTop: 5,
                    }}
                    onPress={() => {
                      if (!!this.state.ShowPhone) {
                        Linking.openURL(`tel:${Dealer.Phone}`);
                      } else {
                        KS.UpdateMobileClick({UserId: Dealer.ID});
                        this.setState({ShowPhone: true});
                      }
                    }}>
                    <Text
                      style={[
                        {color: '#fff', textAlign: 'left'},
                        !this.props.full && {fontSize: 14},
                      ]}>
                      {this.state.ShowPhone
                        ? `\u200E${this.props.mobile}`
                        : `${this.props.mobile}`.replace(/.{4}$/, 'xxxx')}
                    </Text>
                  </TouchableOpacity>
                )}

              {!!this.props.item.Phone && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.secondary,
                    paddingHorizontal: 5,
                    marginTop: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    if (!!this.state.ShowPhone) {
                      Linking.openURL(`tel:${this.props.item.Phone}`);
                    } else {
                      this.setState({ShowPhone: true});
                      if (!!this.props?.item?.ID)
                        KS.UpdateMobileClick({UserId: this.props.item.ID});
                    }
                  }}>
                  <Text
                    style={[
                      {color: '#fff', textAlign: 'left'},
                      !this.props.full && {fontSize: 14},
                    ]}>
                    {this.state.ShowPhone
                      ? `\u200E${this.props.item.Phone}`
                      : `${this.props.item.Phone}`.replace(/.{4}$/, 'xxxx')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
          {DifferentCountry && (
            <View
              style={{
                backgroundColor: 'rgba(128,128,128,0.3)',
                position: 'absolute',
                zIndex: 999,
                top: 0,
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </FastImage>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = ({user, menu, chat}) => ({
  chat: chat,
});

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DealersBanner);
