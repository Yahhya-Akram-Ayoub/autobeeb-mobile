/**
 * Created by Kensoftware on 14/02/2017.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const types = {
  EDIT_CHAT: 'EDIT_CHAT',
  PLUS_UNREAD_MESSAGES: 'PLUS_UNREAD_MESSAGES',
  MINUS_UNREAD_MESSAGES: 'MINUS_UNREAD_MESSAGES',
  REST_UNREAD_MESSAGES: 'REST_UNREAD_MESSAGES',
  OPENED_CHAT: 'OPENED_CHAT',
  ONLINE_USERS: 'ONLINE_USERS',
  ADD_ONLINE_USERS: 'ADD_ONLINE_USERS',
  REMOVE_ONLINE_USERS: 'REMOVE_ONLINE_USERS',
};

export const actions = payload => {
  return {
    type: types.EDIT_CHAT,
    payload,
  };
};

const initialState = {
  chat: false,
  unreadMessages: 0,
  opendSession: null,
  onlineUsers: [],
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.EDIT_CHAT: {
      AsyncStorage.setItem('@chatIconDot', action.payload ? 'true' : 'false');
      return {
        ...state,
        chat: action.payload,
      };
    }
    case types.PLUS_UNREAD_MESSAGES: {
      if (action.payload.Session == state.opendSession) return state;
      if (!action.payload.Count) return state;
      return {
        ...state,
        unreadMessages: state.unreadMessages + (action.payload.Count ?? 1),
      };
    }
    case types.ONLINE_USERS: {
      if (action.payload.onlineUsers.length == 0) {
        return state;
      } else {
        return {
          ...state,
          onlineUsers: action.payload.onlineUsers,
        };
      }
    }
    case types.ADD_ONLINE_USERS: {
      return {
        ...state,
        onlineUsers: [...state.onlineUsers, action.payload.UserId],
      };
    }
    case types.REMOVE_ONLINE_USERS: {
      return {
        ...state,
        onlineUsers: [
          ...state.onlineUsers.filter(x => x != action.payload.UserId),
        ],
      };
    }
    case types.MINUS_UNREAD_MESSAGES: {
      let val = state.unreadMessages - (action.payload.Count ?? 1);
      return {
        ...state,
        unreadMessages: val > -1 ? val : 0,
      };
    }
    case types.REST_UNREAD_MESSAGES: {
      return {
        ...state,
        unreadMessages: action.payload.Count ?? 0,
      };
    }
    case types.OPENED_CHAT: {
      return {
        ...state,
        opendSession: action.payload.Session,
      };
    }
    default: {
      return state;
    }
  }
};
