import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Constants, Languages} from '../../common';
import '@nois/react-native-signalr';
import KS from '../../services/KSAPI';

const MySignalR = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  const {onlineUsers} = useSelector(state => state.chat);

  const connectionRef = useRef(null);
  const hubRef = useRef(null);

  useEffect(() => {
    const isLoggedIn = !!user?.ID;

    if (isLoggedIn) {
      setupSignalR(user.ID);

      KS.GetUnreadMessagesCount(user.ID).then(res => {
        dispatch({type: 'REST_UNREAD_MESSAGES', payload: {Count: res.Count}});
      });
    }

    return () => {
      // Cleanup on unmount or user change
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
      if (hubRef.current) {
        hubRef.current.off('recieveMessage');
        hubRef.current.off('connected');
        hubRef.current.off('disconnected');
      }
    };
  }, [user?.ID]); // only rerun when user ID changes

  const setupSignalR = async userId => {
    if (connectionRef.current) return; // Already connected

    const connection = $.hubConnection(Constants.HubUrl, {
      logging: false,
    });
    const hub = connection.createHubProxy('ChatHub');

    // Clean before attaching
    hub.off('recieveMessage');
    hub.off('connected');
    hub.off('disconnected');

    // Message received handler
    hub.on('recieveMessage', (senderId, sessionId, message) => {
      dispatch({
        type: 'PLUS_UNREAD_MESSAGES',
        payload: {Count: 1, Session: sessionId},
      });
    });

    // Connected handler
    hub.on('connected', connectedUserId => {
      if (onlineUsers) {
        dispatch({
          type: 'ADD_ONLINE_USERS',
          payload: {UserId: connectedUserId},
        });
      }
    });

    // Disconnected handler
    hub.on('disconnected', disconnectedUserId => {
      if (onlineUsers) {
        dispatch({
          type: 'REMOVE_ONLINE_USERS',
          payload: {UserId: disconnectedUserId},
        });
      }
    });

    connection.start().done(async () => {
      try {
        await hub.invoke('JoinChat', userId);
        KS.UpdateLastLogin({UserId: userId, AppLangId: Languages.langID});
        const online = await hub.invoke('GetUsersOnline');
        if (online) {
          const onlineList = online.split(',').filter(id => id && id !== userId);
          dispatch({
            type: 'ONLINE_USERS',
            payload: {onlineUsers: [...onlineList, userId]},
          });
        }
      } catch (err) {
        console.warn('SignalR join/init failed:', err);
      }
    });

    connectionRef.current = connection;
    hubRef.current = hub;
  };

  return null;
};

export default MySignalR;
