const types = {
  SET_RECENT_SEEN_LISTINGS: 'SET_RECENT_OPEN_LISTINGS',
  SET_RECENT_SEARCHED: 'SET_RECENT_KEYWORD_SEARCHED',
  SET_RECENT_FILTER_SEARCHED: 'SET_RECENT_FILTER_SEARCHED',
  SET_RECENT_SEARCHED_LISTINGS: 'SET_RECENT_KEYWORD_SEARCHED_LISTINGS',
  SET_RECENT_FILTER_SEARCHED_LISTINGS: 'SET_RECENT_FILTER_SEARCHED_LISTINGS',
};

const initialState = {
  recentOpenListings: [], // {id , title , type , mainImage }
  recentFreeSeach: [], // keywords
  recentFreeSeachListings: [], // Listings
  recentFilterSeach: [], // type , make , model , section , fueltypes
  recentFilterSeachListings: [], // Listings
};

export const recentOpenListings = obj => {
  if (!obj) return;
  return {
    type: types.SET_RECENT_SEEN_LISTINGS,
    payload: {
      id: obj.id,
      // title: obj.type === 32 ? obj.title : obj.name,
      // type: obj.type,
      // imagesCount: obj.images?.length,
      // mainImage: obj.images?.[0],
      // imageBasePath: obj.imageBasePath,
    },
  };
};
export const recentFreeSeach = keyword => {
  if (!keyword) return;
  return {
    type: types.SET_RECENT_SEARCHED,
    payload: {
      keyword,
    },
  };
};
export const recentFilterSeach = obj => {
  if (!obj) return;
  return {
    type: types.SET_RECENT_FILTER_SEARCHED,
    payload: {
      type: obj.type,
      make: obj.make,
      model: obj.model,
      section: obj.section,
      fueltype: obj.fueltype,
    },
  };
};

export const reducer = (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case types.SET_RECENT_SEEN_LISTINGS: {
      let tempRecentSeen = state.recentOpenListings;
      if (tempRecentSeen.length >= 16) {
        tempRecentSeen = tempRecentSeen.slice(0, 15);
      }
      tempRecentSeen = [payload, ...tempRecentSeen];

      return {
        ...state,
        recentOpenListings: tempRecentSeen,
      };
    }

    case types.SET_RECENT_SEARCHED: {
      let tempRecentSeen = state.recentFreeSeach.filter(item => item.keyword !== payload.keyword);
      if (tempRecentSeen.length >= 6) {
        tempRecentSeen = tempRecentSeen.slice(0, 5);
      }
      tempRecentSeen = [payload, ...tempRecentSeen];

      return {
        ...state,
        recentFreeSeach: tempRecentSeen,
      };
    }
    case types.SET_RECENT_FILTER_SEARCHED: {
      let tempRecentSeen = state.recentFilterSeach;
      if (tempRecentSeen.length >= 3) {
        tempRecentSeen = tempRecentSeen.slice(0, 2);
      }
      tempRecentSeen = [payload, ...tempRecentSeen];

      return {
        ...state,
        recentFilterSeach: tempRecentSeen,
      };
    }

    default: {
      return state;
    }
  }
};
