const types = {
  SET_COUNTRY: 'SET_COUNTRY',
  SET_CURRENCY: 'SET_CURRENCY',
  SEARCH_BARCODE: 'SEARCH_BARCODE',
  SET_ALLOWFEATURE: 'SET_ALLOWFEATURE',
};

export const actions = {
  toggleCamera: () => {
    return {type: types.TOGGLE_CAMERA, payload: {}};
  },
  setViewingCountry: (dispatch, country, callback) => {
    //alert (JSON.stringify (country));
    dispatch({type: types.SET_COUNTRY, payload: {country}});
    if (callback) {
      callback(callback);
    }
  },

  setViewingCurrency: (dispatch, Currency, callback) => {
    global.ViewingCurrency = Currency;
    dispatch({type: types.SET_CURRENCY, payload: {Currency}});
    if (callback) {
      callback(callback);
    }
  },
  searchBarcode: code => {
    return {type: types.SEARCH_BARCODE, payload: {code}};
  },
  setAllowFeature: flag => {
    return {type: types.SET_ALLOWFEATURE, payload: flag};
  },
};

const initialState = {
  showCamera: false,
  ViewingCountry: undefined,
  ViewingCurrency: undefined,
  AllowFeature: true,
};

export const reducer = (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case types.SET_ALLOWFEATURE: {
      return {
        ...state,
        AllowFeature: payload,
      };
    }
    case types.SET_COUNTRY: {
      return {
        ...state,
        ViewingCountry: payload.country,
      };
    }
    case types.SET_CURRENCY: {
      return {
        ...state,
        ViewingCurrency: payload.Currency,
      };
    }

    case types.TOGGLE_CAMERA: {
      return {
        ...state,
        showCamera: !state.showCamera,
      };
    }

    case types.SEARCH_BARCODE: {
      return {
        ...state,
        showCamera: false,
        code: payload.code,
      };
    }
    default: {
      return state;
    }
  }
};
