import KS from '../services/KSAPI';

const types = {
  FETCH_LISTINGS_PENDING: 'FETCH_LISTINGS_PENDING',
  FETCH_Listings_SUCCESS: 'FETCH_Listings_SUCCESS',
  FETCH_Recent_Listings_SUCCESS: 'FETCH_Recent_Listings_SUCCESS',
  FETCH_BackListings_SUCCESS: 'FETCH_BackListings_SUCCESS',
  FETCH_Listings_FAILURE: 'FETCH_Listings_FAILURE',
  FETCH_LISTING_GET_SUCCESS: 'FETCH_LISTING_GET_SUCCESS',
  FETCH_LISTING_GET_PENDING: 'FETCH_LISTING_GET_PENDING',
  SET_SELECTED_SupplierOffer: 'SET_SELECTED_SupplierOffer',
};

export const actions = {
  fetchListings: (dispatch, parentid, page, langid, callback) => {
    dispatch({
      type: types.FETCH_LISTINGS_PENDING,
      fetchMore: page == 1 ? false : true,
    });

    KS.fetchListings({
      page: page,
      parentid: parentid,
      langid: langid,
    }).then(data => {
      if (callback) {
        callback(data);
      }
      dispatch({
        type: types.FETCH_Listings_SUCCESS,
        items: data,
        products: data.products,
        fetchMore: page == 1 ? false : true,
      });
    });
  },
  fetchListingsSuccess: items => {
    return {type: types.FETCH_Listings_SUCCESS, items: items};
  },
  fetchListingsFailure: error => {
    return {type: types.FETCH_Listings_FAILURE, error};
  },

  fetchRecentListings: (dispatch, page, langid, callback) => {
    dispatch({
      type: types.FETCH_LISTINGS_PENDING,
      fetchMore: page == 1 ? false : true,
    });
    KS.fetchRecentListings({
      page: page,
      langid: langid,
    }).then(data => {
      if (callback) {
        callback(data);
      }
      dispatch({
        type: types.FETCH_Recent_Listings_SUCCESS,
        RecentData: data,
        RecentProducts: data.Listings,
        fetchMore: page == 1 ? false : true,
      });
    });
  },

  listingGet: (dispatch, id, userid, langid, callback) => {
    dispatch({
      type: types.FETCH_LISTING_GET_PENDING,
    });

    KS.listingGet({
      id: id,
      userid: userid,
      langid: langid,
    }).then(data => {
      //    alert(JSON.stringify(data))

      if (callback) {
        callback(data);
      }
      dispatch({
        type: types.FETCH_LISTING_GET_SUCCESS,
        details: data,
      });
    });
  },

  // fetchBackListings: (dispatch, parentid) => {
  //     dispatch({ type: types.FETCH_LISTINGS_PENDING });

  //     KS
  //         .fetchListings({
  //             parentid: parentid,
  //             langid: 1
  //         })
  //         .then(data => {
  //             return dispatch(actions.fetchBackListingsSuccess(data));
  //         });
  // },
  // fetchBackListingsSuccess: items => {
  //     return { type: types.FETCH_BackListings_SUCCESS, items: items };
  // },
  // fetchBackListingsFailure: error => {
  //     return { type: types.FETCH_Listings_FAILURE, error };
  // },
};

const initialState = {
  isFetching: false,
  error: null,
  listings: [],
  products: [],
  RecentData: [],
  RecentProducts: [],
  selectedSupplierOffer: '',
  isDetailsFetching: false,
  listingDetail: [],
};

export const reducer = (state = initialState, action) => {
  const {
    type,
    error,
    items,
    brand,
    products,
    details,
    RecentData,
    RecentProducts,
  } = action;

  switch (type) {
    case types.FETCH_Recent_Listings_SUCCESS: {
      //  //console.log(JSON.stringify(items))

      return {
        ...state,
        isFetching: false,
        RecentData: action.fetchMore ? state.RecentData : RecentData,
        RecentProducts: action.fetchMore
          ? state.RecentProducts.concat(RecentProducts)
          : RecentProducts,
        error: null,
      };
    }

    case types.FETCH_LISTINGS_PENDING: {
      // //console.log("yazeed")
      return {
        ...state,
        isFetching: action.fetchMore ? false : true,
        error: null,
      };
    }
    case types.FETCH_Listings_SUCCESS: {
      //  //console.log(JSON.stringify(items))

      return {
        ...state,
        isFetching: false,
        listings: action.fetchMore ? state.listings : items,
        products: action.fetchMore ? state.products.concat(products) : products,
        error: null,
      };
    }

    case types.FETCH_LISTING_GET_PENDING: {
      // //console.log("yazeed")
      return {
        ...state,
        isDetailsFetching: true,
        error: null,
      };
    }
    case types.FETCH_LISTING_GET_SUCCESS: {
      //  //console.log(JSON.stringify(items))

      return {
        ...state,
        isDetailsFetching: false,
        listingDetail: details,
        error: null,
      };
    }

    case types.FETCH_Listings_FAILURE: {
      return {
        ...state,
        isFetching: false,
        listings: [],
        error: error,
      };
    }
    case types.SET_SELECTED_SupplierOffer: {
      return {
        ...state,
        selectedSupplierOffer: SupplierOffer,
      };
    }
    default: {
      return state;
    }
  }
};
