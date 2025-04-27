import {Languages, Constants} from '../common';

const types = {
  SWITCH_LANGUAGE: 'SWITCH_LANGUAGE',
  SWITCH_RTL: 'SWITCH_RTL',
  REDUCER_RESET: 'REDUCER_RESET',
};

export const actions = {
  switchLanguage: (dispatch, lang) => {
    dispatch({type: types.SWITCH_LANGUAGE, lang});
  },
  switchRtl: (dispatch, rtl) => {
    dispatch({type: types.SWITCH_RTL, rtl});
  },
};

const initialState = {
  lang: Constants.Language,
  rtl: Constants.RTL,
};

export const reducer = (state = initialState, action) => {
  const {lang, rtl} = action;
  switch (action.type) {
    case types.SWITCH_LANGUAGE:
      return Object.assign({}, state, {lang});
    case types.SWITCH_RTL:
      return Object.assign({}, state, {rtl});
    case types.REDUCER_RESET:
      return initialState;
    default:
      return state;
  }
};
