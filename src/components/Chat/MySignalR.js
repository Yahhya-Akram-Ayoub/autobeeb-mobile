import React, {Fragment, useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Constants, Languages} from '../../common';
import {useSelector} from 'react-redux';
import '@nois/react-native-signalr';
import KS from '../../services/KSAPI';

const MySignalR = () => {
  const [connection, setConnection] = useState(null);
  const [hubState, setHubState] = useState(null);
  let {user} = useSelector(state => state.user);
  let {onlineUsers} = useSelector(state => state.chat);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   console.log({ onlineUsers});
  // }, [onlineUsers]);

  useEffect(() => {
    const isLogin = !!user && !!user?.ID;
    if (isLogin) {
      setupSignalR(user.ID);
      KS.GetUnreadMessagesCount(user.ID).then(res => {
        dispatch({type: 'REST_UNREAD_MESSAGES', payload: {Count: res.Count}});
      });
    }
    return () => {
      connection?.stop();
      hubState?.off('recieveMessage', () => {});
    };
  }, [user]);

  const setupSignalR = userId => {
    if (connection != null) return;
    const _connection = $.hubConnection(`${Constants.HubUrl}`, {
      logging: false,
    });
    const hub = _connection.createHubProxy('ChatHub');

    hub.off('recieveMessage', () => {});
    hub.on('recieveMessage', (userId, sessionId, message) => {
      dispatch({
        type: 'PLUS_UNREAD_MESSAGES',
        payload: {Count: 1, Session: sessionId},
      });
    });

    hub.on('connected', userId => {
    
      if (!!onlineUsers) {
        dispatch({
          type: 'ADD_ONLINE_USERS',
          payload: {
            UserId: userId,
          },
        });
      }
    });

    hub.on('disconnected', userId => {
      if (!!onlineUsers) {
        dispatch({
          type: 'REMOVE_ONLINE_USERS',
          payload: {
            UserId: userId,
          },
        });
      }
    });

    _connection.start().done(async function () {
      hub.invoke('JoinChat', userId);
      KS.UpdateLastLogin({UserId: userId, AppLangId: Languages.langID});
      let _onlineUsers = await hub.invoke('GetUsersOnline');
      console.log({
        _onlineUsers: _onlineUsers?.split(',').filter(u => u != userId),
      });
      if (!!_onlineUsers) {
        dispatch({
          type: 'ONLINE_USERS',
          payload: {
            onlineUsers: [
              ..._onlineUsers?.split(',').filter(u => u != userId),
              userId,
            ],
          },
        });
      }
    });

    setConnection(_connection);
    setHubState(hub);
  };

  return <Fragment></Fragment>;
};

export default MySignalR;
