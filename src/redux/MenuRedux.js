const types = {
  SET_COUNTRY: "SET_COUNTRY",
  SET_CURRENCY: "SET_CURRENCY",
  SEARCH_BARCODE: "SEARCH_BARCODE",
};

export const actions = {
  toggleCamera: () => {
    return { type: types.TOGGLE_CAMERA, payload: {} };
  },
  setViewingCountry: (dispatch, country, callback) => {
    //alert (JSON.stringify (country));
    dispatch({ type: types.SET_COUNTRY, payload: { country } });
    if (callback) {
      callback(callback);
    }
  },

  setViewingCurrency: (dispatch, Currency, callback) => {
    dispatch({ type: types.SET_CURRENCY, payload: { Currency } });
    if (callback) {
      callback(callback);
    }
  },
  searchBarcode: (code) => {
    return { type: types.SEARCH_BARCODE, payload: { code } };
  },
};

const initialState = {
  showCamera: false,
  ViewingCountry: undefined,
  ViewingCurrency: undefined,
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.SET_COUNTRY: {
      // alert (JSON.stringify (payload.country));
      return {
        ...state,
        ViewingCountry: payload.country,
      };
    }
    case types.SET_CURRENCY: {
      //   alert(JSON.stringify(payload.Currency));
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
