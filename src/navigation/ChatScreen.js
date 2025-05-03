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
import {
  GiftedChat,
  Bubble,
  Actions,
  Send,
  Message,
} from 'react-native-gifted-chat';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// create a component
class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.timer = null;

    this.UpdateMessagesState = this.UpdateMessagesState.bind(this);
    this.AddMessageToState = this.AddMessageToState.bind(this);
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
    audioPath: '',
    recordMode: false,
    recordTime: '00:00:00',
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
      }
    );
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
        session => session.ID == this.props.route.params.sessionID
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
                '"FullImagePath":"wsImages/chat_logo"'
              ),
            });
          }
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
        })
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
            isSystem: `${item.RelatedEntity}`.includes(
              '"FullImagePath":"wsImages/chat_logo"'
            ),
          });
        }
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
          ...[..._messages]?.map(m => {
            return {...m, dateRead: new Date()};
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
          ...[..._messages]?.map(m => {
            return {...m, reserved: true, sent: true};
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
      }.bind(this)
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
      messages: GiftedChat.append(previousState.messages, [
        {
          createdAt: new Date(),
          dateRead: new Date(),
          extraInfo: null,
          received: true,
          reserved: true,
          sent: true,
          text: message,
          user: {_id: userId},
          _id: `${Math.random() * 10000}`,
        },
      ]),
    }));
  };

  UpdateMessagesState = Messages => {
    this.setState(() => ({
      messages: GiftedChat.append([...Messages], []),
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
          }
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
            }
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
          }
        );
      }
    });
    //App closed in background
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));

    KS.SendMessage({
      senderID: this.props.user && this.props.user.ID,
      receiverID: this.props.route.params.targetID,
      message: messages[0].text,
      sessionID: this.state.sessionID,
    }).then(res => {
      this.state.signalRChat.invoke(
        'sendMessageToUser',
        this.props.user.ID,
        this.state.sessionID,
        res.message,
        this.props.route.params.userTo ?? this.props.route.params?.targetID
      );
    });
  }
  renderSend(props) {
    return (
      <Send {...props}>
        <View style={{marginRight: 10, marginBottom: 5}}>
          <IconMC
            name={'send'}
            size={25}
            style={
              I18nManager.isRTL
                ? {transform: [{rotate: '180deg'}], marginBottom: 5}
                : {}
            }
            color={Color.secondary}
          />
        </View>
      </Send>
    );
  }

  /**End recording */

  onSendVoice(voice) {
    RNFS.readFile(voice, 'base64')
      .then(base64Data => {
        KS.SendMessage({
          senderID: this.props.user && this.props.user.ID,
          receiverID:
            this.props.route.params.targetID ??
            this.props.route.params?.targetID,
          audioBase64: base64Data,
          sessionID: this.state.sessionID,
        })
          .then(res => {
            this.state.signalRChat.invoke(
              'sendMessageToUser',
              this.props.user.ID,
              this.state.sessionID,
              res.message,
              this.props.route.params.userTo ??
                this.props.route.params?.targetID
            );
          })
          .catch(err => {
            console.log({err});
          });
      })
      .catch(error => {
        console.log({error});
      });

    const message = {
      audio: voice,
      text: null,
      sent: true,
      _id: Math.random(),
      createdAt: new Date(),
      user: {
        _id: this.props.user.ID,
        name: '',
        avatar: '',
      },
    };

    this.setState({
      messages: [message, ...this.state.messages],
    });
  }

  customRenderTicks(message) {
    if (this.props.user.ID != message.user._id) return null;

    if (message.seen) {
      return <Text style={[styles.checkIcon, {color: '#fb5201'}]}>✓✓</Text>;
    } else if (message.received) {
      return <Text style={[styles.checkIcon, {color: '#fff'}]}>✓✓</Text>;
    } else if (message.sent) {
      return <Text style={[styles.checkIcon, {color: '#fff'}]}>✓</Text>;
    }
    return null;
  }

  CustomMessage(props) {
    return (
      <Message
        {...props}
        renderTicks={message => this.customRenderTicks(message)}
      />
    );
  }

  renderMic(props) {
    return (
      <TouchableOpacity
        {...props}
        onPress={event => {
          event.stopPropagation();
          this.startRecording();
        }}
        style={styles.microphone}>
        <Icon name={'microphone'} size={20} color={Color.primary} />
      </TouchableOpacity>
    );
  }

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
                    this.props.route.params.targetID
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
                  lineHeight: 22,
                  flex: 1,
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

        {this.state.recordMode && (
          <View style={styles.recordDiv}>
            <TouchableOpacity
              style={styles.recordingClose}
              onPress={event => {
                //  event.stopPropagation();
                this.setState({recordMode: !this.state.recordMode});
                this.stopAndDeleteRecording();
              }}>
              <Icon name={'trash-can-outline'} size={20} color={'red'} />
            </TouchableOpacity>
            <View>
              <Icon name={'record-circle-outline'} size={40} color={'red'} />
              <Text style={styles.recordingTime}>
                {this.state.recordTime.substring(0, 5)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.recordingSend}
              onPress={event => {
                // event.stopPropagation();
                this.setState({recordMode: !this.state.recordMode});
                this.stopRecording();
              }}>
              <Icon name={'send'} size={27} color={'#146ba1'} />
            </TouchableOpacity>
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
          <GiftedChat
            disableComposer={this.state.isSystem}
            messages={
              !this.state.messages
                ? []
                : [
                    ...this.state.messages?.map(x => {
                      if (!!x.text && x.text.startsWith('Chat_Image=')) {
                        x.image = `${KS.url
                          .replaceAll('/v2/', '')
                          .replaceAll('api.', '')}/content/chat/${
                          this.state.sessionID
                        }/${x.text.split('=')[1]}.png`;
                        x.text = null;
                      } else if (!!x.text && x.text.startsWith('Chat_Audio=')) {
                        x.audio = `${KS.url
                          .replaceAll('/v2/', '')
                          .replaceAll('api.', '')}/content/chat/${
                          this.state.sessionID
                        }/${x.text.split('=')[1]}.mp3`;
                        x.text = null;
                      } else if (!!x.text && x.text == 'WantedText') {
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
        )}
      </View>
    );
  }
}

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
        callback
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);
