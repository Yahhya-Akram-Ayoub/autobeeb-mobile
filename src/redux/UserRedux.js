import KS from '../services/KSAPI';
import {Languages} from '../common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {actions as actionsMenu} from './MenuRedux';

FCM = messaging();
// check to make sure the user is authenticated

// requests permissions from the user
FCM.requestPermission();
// gets the device's push token

const types = {
  LOGOUT: 'LOGOUT',
  LOGIN: 'LOGIN_SUCCESS',
  TEMP_LOGIN: 'TEMP_LOGIN',
  USER_COUNTRY: 'USER_COUNTRY',
  LOGINDATE: 'LOGIN_DATE',
  USER_LISTING_FETCH_PENDING: 'USER_LISTING_FETCH_PENDING',
  USER_FAVORITES_FETCH_PENDING: 'USER_FAVORITES_FETCH_PENDING',
  USER_GENERATE_OTP: 'USER_GENERATE_OTP',
  USER_FAVORITES_FETCH_SUCCESS: 'USER_FAVORITES_FETCH_SUCCESS',
  USER_FAVORITES_UPDATED: 'USER_FAVORITES_UPDATED',
  USER_MERMBERSHIP_UPDATE_PENDING: 'USER_MERMBERSHIP_UPDATE_PENDING',
  USER_MERMBERSHIP_UPDATE_SUCCESS: 'USER_MERMBERSHIP_UPDATE_SUCCESS',
  USER_MEMBERSHIP_SET_GROUPID: 'USER_MEMBERSHIP_SET_GROUPID',
  USER_OTP_CONFIRM: 'USER_OTP_CONFIRM',
  USER_REGISTER_PENDING: 'USER_REGISTER_PENDING',
  USER_REGISTER_SUCCESS: 'USER_REGISTER_SUCCESS',
  USER_REGISTER_FAIL: 'USER_REGISTER_FAIL',
  USER_LOGIN_PENDING: 'USER_LOGIN_PENDING',
  USER_LOGIN_SUCCESS: 'USER_LOGIN_SUCCESS',
  USER_LOGIN_FAIL: 'USER_LOGIN_FAIL',
  USER_FORGOT_PASSWORD_PENDING: 'USER_FORGOT_PASSWORD_PENDING',
  USER_FORGOT_PASSWORD_SUCCESS: 'USER_FORGOT_PASSWORD_SUCCESS',
  USER_TYPE_UPDATE: 'USER_TYPE_UPDATE',
  USER_USERNAME_UPDATE: 'USER_USERNAME_UPDATE',
};

export const actions = {
  login: (dispatch, user) => {
    FCM.getToken().then(token => {
      if (!!token)
        KS.SetUserToken({
          userID: user.ID,
          token: token,
          langId: Languages.langID,
        });
    });

    KS.UserGet({
      userID: user.ID,
      langid: Languages.langID,
    }).then(data => {
      const _user = data.User;

      KS.GetCountryCore({
        LangId: Languages.langID,
        Id: _user.Country?.Id ?? _user.Country,
      }).then(({country}) => {
        dispatch({
          type: types.USER_COUNTRY,
          userCountry: country,
        });
      });

      dispatch({
        type: types.LOGIN,
        user: {..._user, trigger: new Date()},
      });
    });
  },
  logout: dispatch => {
    // alert("logout");
    dispatch({type: 'REST_UNREAD_MESSAGES', payload: {Count: 0}});
    return {type: types.LOGOUT};
  },
  forgotPassword(dispatch, data, callback) {
    dispatch({
      type: types.USER_FORGOT_PASSWORD_PENDING,
    });
    KS.forgotPassword(data).then(data => {
      //  alert(JSON.stringify(data))
      dispatch({
        type: types.USER_FORGOT_PASSWORD_SUCCESS,
      });
      if (callback) callback(data);
    });
  },
  storeUserData(dispatch, data, callback) {
    if (data) {
      KS.GetFeaturesPlansCore({
        userId: data?.ID,
        langId: Languages.langID,
      }).then(res => {
        dispatch(actionsMenu.setAllowFeature(res?.plans && res?.plans?.length));
      });
    }

    const _this = this;
    AsyncStorage.setItem('user', JSON.stringify(data), () => {
      _this.login(dispatch, data);
      if (callback) callback(data);
    });
  },
  storeTempUserData(dispatch, tempUser) {
    dispatch({
      type: types.TEMP_LOGIN,
      tempUser: {...tempUser},
    });
  },

  GoogleSignin(dispatch, email, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    KS.GoogleSignin({email: email}).then(data => {
      console.log({GoogleSignin: data});
      _this.storeUserData(dispatch, data, callback);
    });
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },
  GoogleRegister(dispatch, email, name, callback) {
    const _this = this;
    console.log({GoogleRegister: email});
    dispatch({type: types.USER_LOGIN_PENDING});
    KS.GoogleRegister({email: email, name: name}).then(data => {
      console.log({GoogleRegister: data});
      _this.storeUserData(dispatch, data, callback);
    });
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },

  facebookLogin(dispatch, user, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    KS.facebookLogin({
      facebookid: user.id,
      email: user.email,
      name: user.name,
      langid: Languages.langID,
    }).then(data => {
      _this.storeUserData(dispatch, data, callback);
    });
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },
  getFacebookUser(dispatch, user, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    KS.getFacebookUser({facebookid: user.id, langid: Languages.langID}).then(
      data => {
        if (callback) callback(data);
      },
    );
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },

  verifyCODE(dispatch, data, callback) {
    KS.verifyCODE(data).then(data => {
      if (callback) callback(data);
    });
  },
  EditUser(dispatch, name, phone) {
    dispatch({type: types.USER_USERNAME_UPDATE, name: name, phone: phone});
  },
};

const initialState = {
  user: null,
  language: 'en',
  favorites: [],
  LogoImage: '',
  listings: [],
  isFetching: false,
  reLoad: false,
  isLoggedIn: false,
  error: false,
  errorMessage: '',
  userCountry: null,
  tempUser: null, // in case user regestered and try toa dd offer without login
};

export const reducer = (state = initialState, action) => {
  const {type, user, userCountry} = action;
  switch (type) {
    case types.USER_LOGIN_PENDING:
      return {
        ...state,
        error: false,
        errorMessage: '',
        isFetching: true,
        user: {},
        isLoggedIn: false,
      };

    case types.LOGOUT:
      return {...state, user: null};
    case types.LOGIN:
      return {...state, user: user, tempUser: null};
    case types.TEMP_LOGIN:
      return {...state, tempUser: action.tempUser};
    case types.USER_COUNTRY:
      return {...state, userCountry: userCountry};
    case types.USER_USERNAME_UPDATE:
      return {
        ...state,
        user: {
          ...state.user,
          phone: action.phone,
          name: action.name,
        },
      };
    default:
      return state;
  }
};
