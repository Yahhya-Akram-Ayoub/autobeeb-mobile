const types = {
  SET_RECENT_SEEN_LISTINGS: "SET_RECENT_SEEN_LISTINGS",
  SET_RECENT_SEARCHED: "SET_RECENT_SEARCHED",
};

const initialState = {
  recentSeenListings: [],
  recentSearched: [],
};

export const actions = {
  updateRecentlySeenListings: (dispatch, listing, callback) => {
    //alert (JSON.stringify (country));
    dispatch({ type: types.SET_RECENT_SEEN_LISTINGS, payload: { listing } });
    if (callback) {
      callback();
    }
  },

  updateRecentlySearched: (dispatch, searchStatement, callback) => {
    dispatch({ type: types.SET_RECENT_SEARCHED, payload: { searchStatement } });
    if (callback) {
      callback();
    }
  },
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.SET_RECENT_SEEN_LISTINGS: {
      let tempRecentSeen = [...state.recentSeenListings];
      // console.log("recent seen before update:", tempRecentSeen);
      if (tempRecentSeen.some((item) => item?.ID == payload.listing.ID)) {
        //item already there
        let index = tempRecentSeen.findIndex(
          (item) => item?.ID == payload.listing.ID
        );
        let existingItem = tempRecentSeen.splice(index, 1)[0];
        tempRecentSeen.unshift(existingItem);
        // console.log(index);
        // console.log(existingItem);

        // console.log(tempRecentSeen);

        return {
          ...state,
          recentSeenListings: tempRecentSeen,
        };
      }

      if (tempRecentSeen.length >= 100) {
        tempRecentSeen.pop();
        tempRecentSeen.unshift(payload.listing);
      } else {
        tempRecentSeen.unshift(payload.listing);
      }
      // console.log("recent seen ((after)) update:", tempRecentSeen);

      //  alert(JSON.stringify(tempRecentSeen));

      return {
        ...state,
        recentSeenListings: tempRecentSeen,
      };
    }
    case types.SET_RECENT_SEARCHED: {
      let tempRecentSearch = [...state.recentSearched];
      // console.log("recent search before update:", tempRecentSearch);
      if (
        tempRecentSearch.some(
          (item) =>
            item?.toLowerCase().replace(/ /g, "") ==
            payload.searchStatement.toLowerCase().replace(/ /g, "")
        )
      ) {
        //item already there
        // return state;
        let index = tempRecentSearch.findIndex(
          (item) =>
            item?.toLowerCase().replace(/ /g, "") ==
            payload.searchStatement.toLowerCase().replace(/ /g, "")
        );
        let existingItem = tempRecentSearch.splice(index, 1)[0];
        tempRecentSearch.unshift(existingItem);
        // console.log(index);
        // console.log(existingItem);

        // console.log(tempRecentSearch);

        return {
          ...state,
          recentSearched: tempRecentSearch,
        };
      }

      if (tempRecentSearch.length >= 20) {
        tempRecentSearch.pop();
        tempRecentSearch.unshift(payload.searchStatement);
      } else {
        tempRecentSearch.unshift(payload.searchStatement);
      }
      // console.log("recent search ((after)) update:", tempRecentSearch);

      //  alert(JSON.stringify(tempRecentSearch));

      return {
        ...state,
        recentSearched: tempRecentSearch,
      };
    }

    default: {
      return state;
    }
  }
};
