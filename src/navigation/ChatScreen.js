//import liraries
import React, {Component, Fragment} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  I18nManager,
  Platform,
  AppState,
  StatusBar,
  LayoutAnimation,
  UIManager,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import {Color, Languages, Constants} from '../common';
import {connect} from 'react-redux';
import LogoSpinner from '../components/LogoSpinner';
import messaging from '@react-native-firebase/messaging';
import KS from '../services/KSAPI';
import {isIphoneX} from 'react-native-iphone-x-helper';
import IconEn from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigationActions, StackActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon, toast} from '../Omni';
import RNFS from 'react-native-fs';
import '@nois/react-native-signalr';
import BlockButton from '../components/Chat/BlockButton';
import {Message} from '../components';

// create a component
class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.timer = null;

    this.UpdateMessagesState = this.UpdateMessagesState.bind(this);
  }

  static navigationOptions = ({navigation}) => ({
    tabBarVisible: false,
  });

  state = {
    messages: [],
    loading: true,
    isOninle: false,
    text: '',
    canDelete: false,
    appState: AppState.currentState,
  };

  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
      // this.props.navigation.navigate("HomeScreen");
    });
  }
  makeMessageReade(senderID, userID, sessionid, isOpened) {
    KS.makeMessageReade({targetID: senderID, userID, sessionid, isOpened}).then(
      res => {
        __DEV__ && console.log({res});
      },
    );
  }
  formatDateLabel(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  insertDateSeparators(messages) {
    const result = [];
    let lastDateStr = null;

    messages.forEach(msg => {
      const date = new Date(msg.createdAt);
      const currentDateStr = date.toDateString(); // "Mon Apr 28 2025"

      if (currentDateStr !== lastDateStr) {
        if (lastDateStr != null) {
          result.push({
            _id: `separator-${lastDateStr}`,
            type: 'separator',
            createdAt: lastDateStr.toString(),
          });
        }
        lastDateStr = currentDateStr;
      }

      result.push({...msg, type: 'message'});
    });

    return result;
  }

  componentDidMount = async () => {
    this.setupNotification();
    let userJson = await AsyncStorage.getItem('user');
    let user = JSON.parse(userJson);
    if (this.props.user) {
      this.setPushNotification(this.props.user && this.props.user.ID);
    }

    KS.getMessageSessions({
      userID: this.props.user.ID,
      langid: Languages.langID,
    }).then(data => {
      const _session = data.Sessions.find(
        session => session.ID == this.props.route.params.sessionID,
      );
      if (!!_session) {
        this.setState({
          Session: _session,
          isBlocked: _session?.IsBlock,
        });
      } else {
        KS.getIfTargetBlockUser({
          userID: this.props.user.ID,
          targetID: this.props.route.params.targetID,
        }).then(data => {
          this.setState({
            isUnAvailable: data.isBlocked,
          });
        });
      }
    });

    AppState.addEventListener('change', this._handleAppStateChange);

    let UserData = await KS.UserGet({
      userID: (this.props.user && this.props.user.ID) || user?.ID,
      langid: Languages.langID,
    });

    if (UserData.User != null) {
      if (UserData?.User?.IsActive == false) {
        toast(Languages.AccountBlocked, 3500);
        setTimeout(() => {
          this.props.navigation.goBack();
        }, 1000);
      } else {
        this.props.getCommunication(
          UserData.User.ID,
          this.props.route.params.targetID,
          this.state.sessionID
            ? this.state.sessionID
            : this.props.route.params.sessionID,
          this.props.route.params.entityID,
          data => {
            this.setState({
              RelatedEntity: JSON.parse(data.RelatedEntity),
              messages: data.Messages,
              loading: false,
              sessionID: data.SessionID,
              isListingActive: data?.IsListingActive,
              isSystem: `${data?.RelatedEntity}`.includes(
                '"FullImagePath":"wsImages/chat_logo"',
              ),
            });
          },
        );
      }
    } else {
      this.Logout();
      toast(Languages.AccountDeleted, 3500);
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({routeName: 'App'})],
        }),
      );
    }

    this.props.route.params &&
      this.props.route.params.description &&
      this.setState({
        description: this.props.route.params?.description ?? 'اعلانك',
      });

    this.props.route.params &&
      this.props.user &&
      this.props.getCommunication(
        this.props.user && this.props.user.ID,
        this.props.route.params.targetID,
        this.state.sessionID
          ? this.state.sessionID
          : this.props.route.params.sessionID,
        this.props.route.params.entityID,
        data => {
          this.setState({
            RelatedEntity: JSON.parse(data.RelatedEntity),
            messages: data.Messages,
            isListingActive: data?.IsListingActive,
            loading: false,
            sessionID: data.SessionID,
            isSystem: `${data.RelatedEntity}`.includes(
              '"FullImagePath":"wsImages/chat_logo"',
            ),
          });
        },
      );

    /*Chat SignalR*/
    const _connection = $.hubConnection(`${Constants.HubUrl}`, {
      logging: false,
    });
    const hub = _connection.createHubProxy('ChatHub');
    this.setState({signalRChat: hub, signalRConnection: _connection});

    hub.on('recieveMessage', (userId, sessionId, message) => {
      hub.invoke('messageReceived', sessionId, userId);
      if (
        (this.state.sessionID
          ? this.state.sessionID
          : this.props.route.params.sessionID) === sessionId
      ) {
        hub.invoke('messageOpened', sessionId, userId);
        this.AddMessageToState({userId, sessionId, message});
        this.makeMessageReade(this.props.user.ID, userId, sessionId, 1);
      } else {
        this.makeMessageReade(this.props.user.ID, userId, sessionId, 0);
        //increase unread count
      }
    });

    hub.on('acknowledgmentOpened', sessionId => {
      if (
        !!this.state.messages &&
        (this.state.sessionID
          ? this.state.sessionID
          : this.props.route.params.sessionID) === sessionId
      ) {
        let _messages = [...this.state.messages];
        this.UpdateMessagesState([
          ..._messages?.map(m => {
            if (!m.dateRead) {
              return {...m, dateRead: new Date()};
            } else {
              return m;
            }
          }),
        ]);
      }
    });

    hub.on('acknowledgmentReceived', sessionId => {
      if (
        !!this.state.messages &&
        (this.state.sessionID
          ? this.state.sessionID
          : this.props.route.params.sessionID) === sessionId
      ) {
        let _messages = [...this.state.messages];
        this.UpdateMessagesState([
          ..._messages?.map(m => {
            if (!m.reserved) {
              return {...m, reserved: true, sent: true};
            } else {
              return m;
            }
          }),
        ]);
      }
    });

    // hub.on('connected', userId => {
    //   const _targetId = this.props.route.params?.targetID
    //     ? this.props.route.params?.targetID
    //     : this.props.route.params.targetID;
    //   this.setState({isOninle: userId === _targetId});
    //   44;
    // });

    hub.on('disconnected', userId => {
      const _targetId = this.props.route.params?.targetID
        ? this.props.route.params?.targetID
        : this.props.route.params.targetID;
      if (userId === _targetId) this.setState({isOninle: false});
    });

    hub.on('blockUser', userId => {
      const _targetId = this.props.route.params?.targetID
        ? this.props.route.params?.targetID
        : this.props.route.params.targetID;
      if (userId === _targetId)
        this.props.navigation.navigate('MessagesScreen');
    });

    _connection.start().done(
      async function () {
        const _sessionId = this.state.sessionID
          ? this.state.sessionID
          : this.props.route.params.sessionID;
        const _targetId = this.props.route.params?.targetID
          ? this.props.route.params?.targetID
          : this.props.route.params.targetID;
        hub.invoke('JoinChat', this.props.user && this.props.user.ID);
        hub.invoke('messageReceived', _sessionId, _targetId);
        hub.invoke('messageOpened', _sessionId, _targetId);
        let onlineUsers = await hub.invoke('GetUsersOnline');
        this.setState({isOninle: onlineUsers.includes(_targetId)});
      }.bind(this),
    );
    /**/
  };

  handeMessageReed() {}
  componentDidUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  componentWillUnmount() {
    this.state.signalRConnection?.stop();
    this.state.signalRChat?.off('acknowledgmentOpened', () => {});
    this.state.signalRChat?.off('recieveMessage', () => {});
    this.state.signalRChat?.off('blockUser', () => {});
    this.state.signalRChat?.off('disconnected', () => {});
    this.state.signalRChat?.off('connected', () => {});
    this.props.CloseChatRedux();
  }

  AddMessageToState = ({userId, sessionId, message}) => {
    this.setState(previousState => ({
      messages: [
        ...previousState.messages,
        {
          createdAt: new Date(),
          dateRead: new Date(),
          extraInfo: null,
          reserved: true,
          sent: true,
          text: message,
          user: {_id: userId},
          _id: `${Math.random() * 10000}`,
        },
      ],
    }));
  };

  UpdateMessagesState = Messages => {
    this.setState(() => ({
      messages: [...Messages],
    }));
  };

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (this.props.user) {
        this.props.getCommunication(
          this.props.user && this.props.user.ID,
          this.state.notificationData && this.state.notificationData.userID
            ? this.state.notificationData.userID
            : this.props.route.params?.targetID,
          this.state.sessionID
            ? this.state.sessionID
            : this.props.route.params.sessionID,
          this.props.route.params.entityID,
          data => {
            this.setState({
              sessionID: data.SessionID,
              messages: data.Messages,
              isListingActive: data?.IsListingActive,
              loading: false,
            });
          },
        );
      }
    }
    this.setState({appState: nextAppState});
  };

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

    //App in foreground
    _this.notificationListener = messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        if (remoteMessage.data) {
          this.props.getCommunication(
            this.props.user && this.props.user.ID,
            remoteMessage.data.userID,
            remoteMessage.data.sessionID,
            remoteMessage.data.entityID,
            data => {
              // this.setState({
              //   sessionID: data.SessionID,
              //   messages: data.Messages,
              //   notificationData: remoteMessage.data,
              //   secondPartyName: remoteMessage.data.name,
              //   isListingActive: data?.IsListingActive,
              //   loading: false,
              // });
            },
          );
        }
      }
    });

    // firebase.notifications().onNotificationOpened((notificationOpen) => {
    messaging().onNotificationOpenedApp(notification => {
      // Get the action triggered by the notification being opened
      //const action = notificationOpen.action;
      // Get information about the notification that was opened
      //const notification = remoteMessage.notification;
      if (notification && notification.data) {
        this.props.getCommunication(
          this.props.user && this.props.user.ID,
          notification.data.userID,
          notification.data.sessionID,
          notification.data.entityID,
          data => {
            this.setState({
              sessionID: data.SessionID,
              messages: data.Messages,
              notificationData: notification.data,
              secondPartyName: notification.data.name,
              isListingActive: data?.IsListingActive,
              loading: false,
            });
          },
        );
      }
    });
    //App closed in background
  }

  onSend(message) {
    this.setState(previousState => ({
      messages: [message, ...previousState.messages],
    }));

    KS.SendMessage({
      senderID: this.props.user && this.props.user.ID,
      receiverID: this.props.route.params.targetID,
      message: message.text,
      sessionID: this.state.sessionID,
    }).then(res => {
      this.state.signalRChat.invoke(
        'sendMessageToUser',
        this.props.user.ID,
        this.state.sessionID,
        res.message,
        this.props.route.params.userTo ?? this.props.route.params?.targetID,
      );
    });
  }
  // renderSend(props) {
  //   return (
  //     <Send {...props}>
  //       <View style={{marginRight: 10, marginBottom: 5}}>
  //         <IconMC
  //           name={'send'}
  //           size={25}
  //           style={
  //             I18nManager.isRTL
  //               ? {transform: [{rotate: '180deg'}], marginBottom: 5}
  //               : {}
  //           }
  //           color={Color.secondary}
  //         />
  //       </View>
  //     </Send>
  //   );
  // }

  /**End recording */

  render() {
    if (this.state.loading) {
      return <LogoSpinner fullStretch />;
    }
    return (
      <View
        style={[
          {
            flex: 1,
          },
        ]}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />

        <View
          style={{
            width: Dimensions.get('window').width,
            backgroundColor: '#fff',
            paddingVertical: 5,

            zIndex: 10,
            alignItems: 'center',
            paddingTop: Platform.select({
              ios: isIphoneX() ? 50 : 40,
              android: 20,
            }),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Dimensions.get('screen').width,
              position: 'relative',
            }}>
            {!this.state.isSystem && !this.state.isUnAvailable && (
              <BlockButton
                UserId={this.props.user.ID}
                BlockedId={this.props.route.params.targetID}
                IsBlocked={this.state.isBlocked}
                onDone={res => {
                  this.setState({isBlocked: !this.state.isBlocked});
                  this.state.signalRChat.invoke(
                    'doBlockUser',
                    this.props.user.ID,
                    this.props.route.params.targetID,
                  );
                }}
              />
            )}
            {this.state.isOninle && <View style={styles.greenPoint} />}
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 100,
                marginHorizontal: 10,
                //   marginVertical: 5
              }}
              resizeMode="contain"
              onError={data => {
                this.setState({noImage: true});
              }}
              source={
                this.state.noImage
                  ? {
                      uri: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                      width: 50,
                      height: 50,
                    }
                  : {
                      uri: `https://autobeeb.com/content/users/${this.props.route.params?.targetID}/${this.props.route.params?.targetID}_400x400.jpg`,
                    }
              }
            />
            <TouchableOpacity
              style={{flex: 1}}
              onPress={data => {
                if (
                  !!this.state.RelatedEntity?.ID &&
                  this.state.isListingActive
                ) {
                  this.props.navigation.replace('CarDetails', {
                    item: {
                      ID: this.state.RelatedEntity?.ID,
                      TypeID: this.state.RelatedEntity?.TypeID,
                    },
                  });
                } else {
                  KS.UserGet({
                    userID:
                      this.state.notificationData &&
                      this.state.notificationData.userID
                        ? this.state.notificationData.userID
                        : this.props.route.params?.targetID,
                    langid: Languages.langID,
                  }).then(data => {
                    //   alert(JSON.stringify(data));
                    if (data && data.Success == 1) {
                      if (data.User.IsDealer) {
                        this.props.navigation.navigate('DealerProfileScreen', {
                          userid:
                            this.state.notificationData &&
                            this.state.notificationData.userID
                              ? this.state.notificationData.userID
                              : this.props.route.params?.targetID,
                        });
                      } else {
                        this.props.navigation.navigate('UserProfileScreen', {
                          userid:
                            this.state.notificationData &&
                            this.state.notificationData.userID
                              ? this.state.notificationData.userID
                              : this.props.route.params?.targetID,
                        });
                      }
                    }
                  });
                }
              }}>
              <Text
                numberOfLines={1}
                style={{
                  textAlign: 'left',
                  fontSize: 16,
                  color: Color.primary,
                }}>
                {this.props.route.params?.ownerName ??
                  (this.state.secondPartyName || 'User')}
              </Text>
              {this.state.RelatedEntity && (
                <Text numberOfLines={1} style={{textAlign: 'left'}}>
                  {this.state.RelatedEntity.Name}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginHorizontal: 10}}
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <IconEn
                name={!I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
                size={25}
                color={Color.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {this.state.isListingActive === false && (
          <View style={{backgroundColor: 'red'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>
              {Languages.ThisOfferUnavalable}
            </Text>
          </View>
        )}

        {this.state.isBlocked || this.state.isUnAvailable ? (
          <View
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#fff',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: 20,
              paddingTop: 100,
            }}>
            <Text style={{textAlign: 'center'}}>
              {Languages.YouBlockedThisUser}
            </Text>
          </View>
        ) : (
          <>
            <KeyboardAvoidingView
              style={{flex: 1}}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={100}>
              <FlatList
                ref={ref => (this.flatListRef = ref)}
                data={this.insertDateSeparators(this.state.messages)}
                keyExtractor={item => item._id?.toString()}
                inverted
                renderItem={({item, index}) => {
                  if (item.type === 'separator') {
                    return (
                      <View style={{alignItems: 'center', marginVertical: 8}}>
                        <Text
                          style={{
                            backgroundColor: '#ddd',
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 12,
                            fontSize: 13,
                            color: '#333',
                          }}>
                          {this.formatDateLabel(item.createdAt)}
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <Message
                      key={`${item._id}`}
                      item={item}
                      index={index}
                      isOwined={
                        `${this.props.user && this.props.user.ID}` ===
                        item.user?._id
                      }
                    />
                  );
                }}
                contentContainerStyle={{paddingVertical: 10}}
                keyboardShouldPersistTaps="handled"
              />

              {!this.state.isSystem && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 25,
                    margin: 10,
                    paddingHorizontal: 10,
                    elevation: 2, // Android shadow
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 1},
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      fontFamily: 'Cairo-Regular',
                      color: '#000',
                    }}
                    placeholder={`${Languages.TypeHere}...`}
                    placeholderTextColor="#888"
                    multiline
                    value={this.state.text}
                    onChangeText={text => {
                      this.setState({text});
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (this.state.text.trim()) {
                        this.onSend({
                          createdAt: new Date(),
                          dateRead: null,
                          extraInfo: null,
                          reserved: false,
                          sent: true,
                          text: this.state.text.trim(),
                          user: {
                            _id: `${this.props.user && this.props.user.ID}`,
                          },
                          _id: `${Math.random() * 10000}`,
                        });
                        this.setState({text: ''});
                      }
                    }}
                    disabled={!this.state.text.trim()}
                    style={{padding: 5}}>
                    <IconMC
                      name="send"
                      size={24}
                      color={Color.secondary}
                      style={
                        I18nManager.isRTL
                          ? {transform: [{rotate: '180deg'}]}
                          : {}
                      }
                    />
                  </TouchableOpacity>
                </View>
              )}
            </KeyboardAvoidingView>
          </>
        )}
      </View>
    );
  }
}
/*

: (
          <GiftedChat
            disableComposer={this.state.isSystem}
            messages={
              !this.state.messages
                ? []
                : [
                    ...this.state.messages?.map(x => {
                      if (!!x.text && x.text == 'WantedText') {
                        x.audio = 'WantedText';
                        x.text = null;
                      }
                      x.sent = !!x._id;
                      x.received = !!x.reserved || !!x.dateRead;
                      x.seen = !!x.dateRead;
                      return x;
                    }),
                  ]
            }
            isAnimated
            scrollToBottom
            renderMessage={props => this.CustomMessage(props)} // Use custom message component
            keyboardShouldPersistTaps="never"
            onSend={messages => this.onSend(messages)}
            placeholder={Languages.TypeHere}
            renderBubble={props => {
              return (
                <Bubble
                  {...props}
                  wrapperStyle={{
                    right: {
                      backgroundColor: Color.secondary,
                    },
                    left: {
                      backgroundColor: '#717171bd',
                    },
                  }}
                  timeTextStyle={{
                    right: {color: 'white'},
                    left: {color: 'white'},
                  }}
                  textStyle={{
                    right: {
                      fontSize: 18,
                      lineHeight: 27,
                    },
                    left: {
                      fontSize: 18,
                      lineHeight: 27,
                      color: 'white',
                    },
                  }}
                />
              );
            }}
            user={{
              _id: this.props.user && this.props.user.ID,
            }}
            renderSend={this.renderSend}
            label={Languages.Send}
            text={this.state.text}
            textInputStyle={{
              fontSize: 18,
              lineHeight: 27,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
              fontFamily: 'Cairo-Regular',
              color: '#000',
            }}
            optionTitles={[Languages.CopyText, Languages.Cancel]}
            renderAvatar={null}
            onInputTextChanged={text => {
              if (text != '') {
                this.setState({text: text, canDelete: true});
              }
              if (text == '' && this.state.canDelete) {
                this.setState({text: text});
              }
            }}
          />
        )
*/
// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  microphone: {
    position: 'absolute',
    right: 10,
    alignSelf: 'center',
    width: 20,
    zIndex: 10,
  },
  recordDiv: {
    position: 'absolute',
    bottom: 0,
    height: 70,
    width: Dimensions.get('screen').width,
    zIndex: 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  recordingTime: {
    fontSize: 10,
    textAlign: 'center',
  },
  recordingClose: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  recordingSend: {
    position: 'absolute',
    right: 10,
    transform: [{rotateY: '180deg'}],
  },
  greenPoint: {
    width: 12,
    height: 12,
    borderRadius: 55,
    backgroundColor: 'green',
    position: 'absolute',
    left: 50,
    bottom: 2,
    zIndex: 1,
  },
  checkIcon: {
    fontSize: 10,
    textAlign: 'center',
    marginHorizontal: 5,
    marginTop: 5,
  },
});

const mapStateToProps = ({user}) => {
  return {
    user: user.user,
  };
};

const mapDispatchToProps = dispatch => {
  const HomeRedux = require('../redux/HomeRedux');
  const UserRedux = require('../redux/UserRedux');

  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),
    CloseChatRedux: () => {
      dispatch({type: 'OPENED_CHAT', payload: {Session: null}});
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);
