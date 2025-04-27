import KS from '../services/KSAPI';
import {Languages} from '../common';
const types = {
  FETCH_DATA_FOR_HOME_PAGE_SUCCESS: 'FETCH_DATA_FOR_HOME_PAGE_SUCCESS',
  FETCH_DATA_FOR_HOME_PAGE_PENDING: 'FETCH_DATA_FOR_HOME_PAGE_PENDING',
  FETCH_CITIES_SUCCESS: 'FETCH_CITIES_SUCCESS',
  FETCH_CITIES_PENDING: 'FETCH_CITIES_PENDING',
  FETCH_Categories_PENDING: 'FETCH_Categories_PENDING',
  FETCH_Categories_SUCCESS: 'FETCH_Categories_SUCCESS',
  FETCH_LISTINGS_PENDING: 'FETCH_LISTINGS_PENDING',
  FETCH_LISTINGS_SUCCESS: 'FETCH_LISTINGS_SUCCESS',

  FETCH_Sub_Categories_PENDING: 'FETCH_Sub_Categories_PENDING',
  FETCH_Sub_Categories_SUCCESS: 'FETCH_Sub_Categories_SUCCESS',
  FETCH_CATEGORY_DETAILS_SUCCESS: 'FETCH_CATEGORY_DETAILS_SUCCESS',
  FETCH_Sub_Categories_Type_SUCCESS: 'FETCH_Sub_Categories_Type_SUCCESS',
  FETCH_Sub_Categories_Kind_SUCCESS: 'FETCH_Sub_Categories_Kind_SUCCESS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
};
const initialState = {
  isFetching: true,
  isCitiesFetching: true,
  isListingsFetching: false,
  isSubCategoriesFetching: false,
  isCategoriesFetching: true,
  finished: false,
  categoryDetails: [],
  cities: [],
  listingsSearch: '',
  categories: [],
  subCategories: [],
  homePageData: null,
  SubCategoriesType: [],
  SubCategoriesKind: [],
  searchTotalPages: null,
};
export const actions = {
  HomeScreenGet: (
    dispatch,
    langid,
    isoCode,
    count,
    cur,
    callback,
    userID = null,
  ) => {
    dispatch({type: types.FETCH_DATA_FOR_HOME_PAGE_PENDING});

    KS.HomeScreenGet({
      langid: langid,
      isoCode,
      count,
      cur: cur ? cur : '',
      userID,
    }).then(data => {
      if (callback) {
        callback(data);
      }

      dispatch({type: types.FETCH_DATA_FOR_HOME_PAGE_SUCCESS, payload: data});
    });
  },

  getCommunication: (userID, targetID, sessionID, entityID, callback) => {
    KS.getCommunication({
      userID: userID,
      targetID: targetID,
      sessionID: sessionID,
      langid: Languages.langID,
      entityID: entityID,
      page: 1,
      pageSize: 200,
    }).then(data => {
      if (callback) {
        callback(data);
      }
    });
  },

  fetchCities: (dispatch, langid, callback) => {
    dispatch({type: types.FETCH_CITIES_PENDING});
    KS.fetchCities({
      langid: Languages.langID,
    }).then(data => {
      if (callback) {
        callback(data);
      }
      dispatch({type: types.FETCH_CITIES_SUCCESS, cities: data});
    });
  },

  fetchTowns: (id, langid, callback) => {
    KS.fetchTowns({
      id: id || '',
      langid: Languages.langID,
    }).then(data => {
      if (callback) {
        callback(data);
      }
    });
  },
  fetchCategories: (dispatch, langid) => {
    dispatch({type: types.FETCH_Categories_PENDING});
    KS.fetchCategories({
      langid: Languages.langID,
    }).then(data => {
      // alert(JSON.stringify(data))
      dispatch({type: types.FETCH_Categories_SUCCESS, Categories: data});
    });
  },

  fetchSubCategories: (dispatch, langid, id, level, callback) => {
    dispatch({type: types.FETCH_Sub_Categories_PENDING});
    KS.fetchSubCategories({
      langid: Languages.langID,
      parentid: id,
    }).then(data => {
      if (callback) {
        callback(data);
      }
      if (level == 'sub') {
        dispatch({
          type: types.FETCH_Sub_Categories_SUCCESS,
          SubCategories: data,
        });
      } else if (level == 'type') {
        dispatch({
          type: types.FETCH_Sub_Categories_Type_SUCCESS,
          SubCategoriesType: data,
        });
      } else if (level == 'kind') {
        dispatch({
          type: types.FETCH_Sub_Categories_Kind_SUCCESS,
          SubCategoriesKind: data,
        });
      }
    });
  },

  fetchCategoryDetails: (dispatch, langid, id, callback) => {
    KS.fetchCategoryDetails({
      langid: Languages.langID,
      id: id,
    }).then(data => {
      // alert(JSON.stringify(data))
      if (callback) {
        callback(data);
      }
      dispatch({
        type: types.FETCH_CATEGORY_DETAILS_SUCCESS,
        catDetails: data.category,
      });
    });
  },

  QuickSearch: (dispatch, text, langid, callback) => {
    dispatch({
      type: types.FETCH_LISTINGS_PENDING,
    });
    KS.QuickSearch({
      keyword: text,
      langid: Languages.langID,
    }).then(data => {
      if (callback) {
        callback(data);
      }
      dispatch({
        type: types.FETCH_LISTINGS_SUCCESS,
        Listings: data.Results,
      });
    });
  },
  clearSearch: dispatch => {
    dispatch({type: types.CLEAR_SEARCH});
  },
};
export const reducer = (state = initialState, action) => {
  const {
    type,
    cities,
    Categories,
    Listings,
    SubCategories,
    SubCategoriesKind,
    catDetails,
    SubCategoriesType,
  } = action;

  switch (type) {
    case types.FETCH_DATA_FOR_HOME_PAGE_PENDING: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case types.CLEAR_SEARCH: {
      return {
        ...state,
        isListingsFetching: false,
        listingsSearch: [],
      };
    }

    case types.FETCH_CATEGORY_DETAILS_SUCCESS: {
      return {
        ...state,
        categoryDetails: catDetails,
      };
    }

    case types.FETCH_DATA_FOR_HOME_PAGE_SUCCESS: {
      //  alert(JSON.stringify(action.payload));
      return {
        ...state,
        isFetching: false,
        homePageData: action.payload,
      };
    }
    case types.FETCH_CITIES_PENDING: {
      return {
        ...state,
        isCitiesFetching: true,
      };
    }
    case types.FETCH_CITIES_SUCCESS: {
      return {
        ...state,
        isCitiesFetching: false,
        cities: cities,
        finished: true,
      };
    }
    case types.FETCH_Categories_PENDING: {
      return {
        ...state,
        isCategoriesFetching: true,
      };
    }
    case types.FETCH_Categories_SUCCESS: {
      return {
        ...state,
        isCategoriesFetching: false,
        categories: Categories,
      };
    }

    case types.FETCH_Sub_Categories_PENDING: {
      return {
        ...state,
        isSubCategoriesFetching: true,
      };
    }
    case types.FETCH_Sub_Categories_SUCCESS: {
      return {
        ...state,
        isSubCategoriesFetching: false,
        subCategories: SubCategories.categories,
      };
    }

    case types.FETCH_Sub_Categories_Type_SUCCESS: {
      return {
        ...state,
        isSubCategoriesFetching: false,

        SubCategoriesType: SubCategoriesType.categories,
      };
    }

    case types.FETCH_Sub_Categories_Kind_SUCCESS: {
      return {
        ...state,
        isSubCategoriesFetching: false,

        SubCategoriesKind: SubCategoriesKind.categories,
      };
    }

    case types.FETCH_LISTINGS_PENDING: {
      return {
        ...state,

        isListingsFetching: action.fetchMore ? false : true,
      };
    }
    case types.FETCH_LISTINGS_SUCCESS: {
      return {
        ...state,
        isListingsFetching: false,

        listingsSearch: action.fetchMore
          ? state.listingsSearch.concat(Listings)
          : Listings,

        searchTotalPages: action.searchTotalPages,
      };
    }

    default: {
      return state;
    }
  }
};
