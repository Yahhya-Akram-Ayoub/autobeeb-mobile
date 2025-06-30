//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  I18nManager,
  Dimensions,
  Image,
  AppState,
  StatusBar,
  Alert,
} from 'react-native';
import NewHeader from '../containers/NewHeader';
import KS from '../services/KSAPI';
import Languages from '../common/Languages';
import {Constants} from '../common';
import {connect} from 'react-redux';
import {LogoSpinner} from '../components';
import Moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SwipeRow} from 'react-native-swipe-list-view';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import '@nois/react-native-signalr';

// create a component
class MessagesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      onlineUsers: [],
      loading: true,
      appState: AppState.currentState,
      date: new Date(),
    };

    this.handleFocus = this.handleFocus.bind(this);
  }

  componentDidMount = () => {
    if (!this.props.user || !this.props.user?.ID) return;

    this.focusListener = this.props.navigation.addListener(
      'focus',
      this.handleFocus,
    );

    AppState.addEventListener('change', this._handleAppStateChange);

    if (this.props.user && this.props.user.ID) {
      KS.getMessageSessions({
        userID: this.props.user.ID,
        langid: Languages.langID,
      }).then(data => {
        this.setState({
          sessions: data.Sessions,
          loading: false,
        });
      });
    }
    this.setupNotification();
    this.setPushNotification(this.props.user && this.props.user.ID);

    const _connection = $.hubConnection(`${Constants.HubUrl}`, {
      logging: false,
    });
    const hub = _connection.createHubProxy('ChatHub');
    this.setState({signalRChat: hub, signalRConnection: _connection});

    // hub.on('connected', userId => {
    //   !!userId &&
    //     this.setState({
    //       onlineUsers: [
    //         ...this.state.onlineUsers.filter(u => u != userId),
    //         userId,
    //       ],
    //     });
    // });

    hub.on('disconnected', userId => {
      !!userId &&
        this.setState({
          onlineUsers: [...this.state.onlineUsers.filter(u => u != userId)],
        });
    });

    hub.on('blockUser', userId => {
      if (this?.props?.user) {
        KS.getMessageSessions({
          userID: this?.props?.user?.ID,
          langid: Languages.langID,
        }).then(data => {
          this.setState({
            sessions: data.Sessions,
            loading: false,
          });
        });
      }
    });

    hub.on('recieveMessage', (userId, sessionId, message) => {
      // this.props.IncreasUnreadMessages(sessionId)
      hub.invoke('messageReceived', sessionId, userId);
      let _sessions = [...this.state.sessions];
      if (this.props.activeSession != sessionId) {
        this.setState({
          sessions: [
            ..._sessions.map(s => {
              if (s.ID === sessionId) {
                s.UnreadCount += 1;
              }
              return s;
            }),
          ],
        });
      }
    });

    _connection.start().done(
      async function () {
        hub.invoke('JoinChat', this.props.user && this.props.user.ID);
        let onlineUsers = await hub.invoke('GetUsersOnline');
        this.setState({onlineUsers: onlineUsers?.split(',')});
      }.bind(this),
    );
  };

  handleFocus() {
    this.props.editChat({type: 'EDIT_CHAT', payload: false});
    KS.UserGet({
      userID: this?.props?.user?.ID,
      langid: Languages.langID,
    }).then(data => {
      if (data && data?.Success == 1) {
        if (data.User == null) {
          this.Logout();
        }
      }
    });

    if (this?.props?.user) {
      KS.getMessageSessions({
        userID: this?.props?.user?.ID,
        langid: Languages.langID,
      }).then(data => {
        this.setState({
          sessions: data.Sessions,
          loading: false,
        });
      });
    }
  }

  // componentWillUnmount() {
  //   AppState?.removeEventListener?.('change', this._handleAppStateChange);
  // }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (this.props.user) {
        KS.getMessageSessions({
          userID: this.props.user.ID,
          langid: Languages.langID,
        }).then(data => {
          this.setState({
            sessions: data.Sessions,
            loading: false,
          });
        });
      }
    }
    this.setState({appState: nextAppState});
  };

  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
      //    this.props.navigation.navigate("HomeScreen");
    });
  }

  setPushNotification(ID) {
    const _this = this;
    FCM = messaging();
    // check to make sure the user is authenticated

    // requests permissions from the user
    FCM.requestPermission();
    // gets the device's push token
    FCM.getToken().then(token => {
      if (!!token)
        KS.SetUserToken({
          userid: ID,
          token: token,
          langId: Languages.langID,
        });
    });
  }
  setupNotification() {
    const _this = this;
    _this.notificationDisplayedListener = messaging().onMessage(
      async remoteMessage => {},
    );
    //App in foreground
    _this.notificationListener = messaging().onMessage(async remoteMessage => {
      {
      } //to remove chat red dot when recieve message and user is on screen
      if (remoteMessage) {
        if (remoteMessage.data) {
          if (this.props.user) {
            KS.getMessageSessions({
              userID: this.props.user.ID,
              langid: Languages.langID,
            }).then(data => {
              this.setState({
                sessions: data.Sessions,
                loading: false,
              });
            });
          } else {
            this.setState({
              loading: false,
            });
          }
        }
      }
    });
  }

  render() {
    if (!this.props.user) {
      return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
          <NewHeader navigation={this.props.navigation} back={true} />
          <View
            style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
            <IconMC
              name="login"
              size={40}
              //    color={Color.secondary}
              //    style={{ marginRight: 15 }}
            />
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Cairo-Bold',
                fontSize: 25,
              }}>
              {Languages.YouNeedToLoginFirst}
            </Text>

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: 'green',
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 5,
              }}
              onPress={() => {
                this.props.navigation.navigate('DrawerStack', {
                  screen: 'LoginScreen',
                });
              }}>
              <Text style={{color: '#fff', fontSize: 18}}>
                {Languages.LoginNow}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (this.state.loading) {
      return (
        <View style={{flex: 1}}>
          <StatusBar backgroundColor="#fff" barStyle="dark-content" />

          <NewHeader back={true} navigation={this.props.navigation} />

          <LogoSpinner fullStretch />
        </View>
      );
    }

    return this.state.sessions && this.state.sessions.length <= 0 ? (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <NewHeader back={true} navigation={this.props.navigation} />
        <View
          style={{
            paddingTop: 40,
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}>
          <Text
            style={[
              styles.text,
              {textAlign: 'center', fontFamily: 'Cairo-Regular', fontSize: 25},
            ]}>
            {Languages.NoMessages}
          </Text>
        </View>
      </View>
    ) : (
      <View>
        <NewHeader back={true} navigation={this.props.navigation} />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          style={[{}]}
          contentContainerStyle={{paddingBottom: 100}}
          data={this.state.sessions}
          extraData={this.state.sessions}
          renderItem={(item, index) => {
            let RelatedEntity = {};
            try {
              if (!!item.item.RelatedEntity)
                RelatedEntity = JSON.parse(item.item.RelatedEntity);
            } catch (er) {}

            return (
              <SwipeRow
                key={'Messages' + item.item.ID}
                style={{marginBottom: 2}}
                disableLeftSwipe={I18nManager.isRTL ? false : true}
                disableRightSwipe={I18nManager.isRTL ? true : false}
                leftOpenValue={75}
                rightOpenValue={-75}>
                <TouchableOpacity
                  style={styles.hiddenRow}
                  onPress={() => {
                    this.setState({
                      sessions: this.state.sessions.filter(
                        x => x.ID != item.item.ID,
                      ),
                    });
                    KS.hideCommunication({
                      Id: item.item.ID,
                      UserId: this?.props?.user?.ID,
                    });
                  }}>
                  <FontAwesome name="trash" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  disableRightSwipe
                  onPress={() => {
                    this.props.OpenChatRedux(
                      item.item.ID,
                      item.item.UnreadCount ?? 0,
                    );
                    this.props.navigation.navigate('ChatScreen', {
                      sessionID: item.item.ID,
                      targetID: item.item.SecondParty,
                      ownerName: item.item.SecondPartyName,
                      entityID: '',
                    });
                  }}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'white',
                    alignItems: 'center',
                    padding: 10,
                  }}>
                  {((item.item.SecondParty != this.props.user.ID &&
                    this.state.onlineUsers.includes(item.item.SecondParty)) ||
                    (item.item.FirstParty != this.props.user.ID &&
                      this.state.onlineUsers.includes(
                        item.item.FirstParty,
                      ))) && <View style={styles.greenPoint} />}
                  <Image
                    style={{width: 50, height: 50, borderRadius: 100}}
                    resizeMode="contain"
                    onError={data => {
                      item.item.noImage = true;
                      this.setState({index: 1});
                    }}
                    source={
                      item.item.noImage &&
                      item.item.SecondPartyName != 'Autobeeb'
                        ? {
                            uri: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                            width: 50,
                            height: 50,
                          }
                        : item.item.noImage &&
                          item.item.SecondPartyName == 'Autobeeb'
                        ? {
                            uri: `https://autobeeb.com/wsImages/chat_logo_400x400.jpg`,
                          }
                        : {
                            uri: `https://autobeeb.com/content/users/${item.item.SecondParty}/${item.item.SecondParty}_400x400.jpg?time=${this.state.date}`,
                          }
                    }
                  />

                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      paddingHorizontal: 10,
                      flex: 1,
                    }}>
                    {!!item.item.UnreadCount && (
                      <View style={styles.containerUnread}>
                        <Text style={styles.UnreadMessages}>
                          {item.item.UnreadCount}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: 'Cairo-Bold',
                          maxWidth: Dimensions.get('screen').width * 0.6,
                          textAlign: 'left',
                          color: '#333',
                          fontWeight: '700',
                        }}>
                        {item.item.SecondPartyName}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          flexGrow: 1,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: 'Cairo-Regular',
                            textAlign: 'left',
                            width: Dimensions.get('screen').width * 0.55,
                            color: '#333',
                          }}>
                          {RelatedEntity.Name}
                          {/* {!!item.item.ExtraInfo &&
                          item.item.ExtraInfo.startsWith('Chat_Audio=')
                            ? Languages.VoicePlacehokder
                            : !!item.item.ExtraInfo &&
                              item.item.ExtraInfo.startsWith('Chat_Image=')
                            ? Languages.ImagePlaceholder
                            : item.item.ExtraInfo} */}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'right',
                            fontFamily: 'Cairo-Regular',
                            width: Dimensions.get('screen').width * 0.25,
                            fontSize: 15,
                          }}>
                          {Moment(item.item.DateRank).format('MM-DD')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </SwipeRow>
            );
          }}
        />
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  hiddenRow: {
    flex: 1,
    width: 75,
    height: 50,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenPoint: {
    width: 12,
    height: 12,
    borderRadius: 55,
    backgroundColor: 'green',
    position: 'absolute',
    left: 9,
    bottom: 18,
    zIndex: 1,
  },
  containerUnread: {
    position: 'absolute',
    right: 5,
    bottom: 30,
    backgroundColor: 'red',
    borderRadius: 50,
    width: 25,
    height: 25,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  UnreadMessages: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 14,
  },
});

const mapStateToProps = ({user, chat}) => {
  return {
    user: user.user,
    activeSession: chat.opendSession,
  };
};

const mapDispatchToProps = dispatch => {
  const HomeRedux = require('../redux/HomeRedux');
  const UserRedux = require('../redux/UserRedux');

  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),
    IncreasUnreadMessages: sessionId => {
      dispatch({
        type: 'PLUS_UNREAD_MESSAGES',
        payload: {Count: 1, Session: sessionId},
      });
    },
    OpenChatRedux: (Session, Count = 1) => {
      dispatch({type: 'MINUS_UNREAD_MESSAGES', payload: {Session, Count}});
      dispatch({type: 'OPENED_CHAT', payload: {Session}});
    },
    getCommunication: (userID, targetID, sessionID, entityID, callback) => {
      HomeRedux.actions.getCommunication(
        userID,
        targetID,
        sessionID,
        entityID,
        callback,
      );
    },

    editChat: data => dispatch(data),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessagesScreen);
