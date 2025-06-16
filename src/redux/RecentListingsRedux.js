import {Languages} from '../common';

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
  recentFilterSeach: null, // type , make , model , section , fueltypes
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
      date: new Date(),
      langId: Languages.langID,
    },
  };
};

const toNullableNumber = value => {
  const num = Number(value);
  return isNaN(num) || num === 0 ? null : num;
};

export const recentFilterSeach = obj => {
  if (!obj) return;
  return {
    type: types.SET_RECENT_FILTER_SEARCHED,
    payload: {
      filter: {
        asc: obj.asc,
        sortBy: obj.sortBy,
        typeId: toNullableNumber(obj.typeID) ?? 1,
        pageNum: obj.PageNum,
        pageSize: obj.pagesize,
        makeId: toNullableNumber(obj.makeID),
        modelId: toNullableNumber(obj.modelid),
        cityId: toNullableNumber(obj.cityID),
        color: obj.color || null,
        sellType: toNullableNumber(obj.sellType) ?? 1,
        categoryId: toNullableNumber(obj.categoryid),
        fuelType: toNullableNumber(obj.fuelType),
        minYear: toNullableNumber(obj.minyear),
        maxYear: toNullableNumber(obj.maxYear),
        minPrice: toNullableNumber(obj.minPrice),
        maxPrice: toNullableNumber(obj.maxPrice),
        minConsumption: toNullableNumber(obj.minConsumption),
        maxConsumption: toNullableNumber(obj.maxConsumption),
        condition: toNullableNumber(obj.condition),
        gearBox: toNullableNumber(obj.gearBox),
        paymentMethod: toNullableNumber(obj.paymentMethod),
        rentPeriod: toNullableNumber(obj.rentPeriod),
        section: toNullableNumber(obj.section),
        isoCode: obj.isocode || null,
        cur: obj.cur || null,
        partNumber: obj.partNumber || null,
      },
      date: new Date(),
      langId: Languages.langID,
    },
  };
};

export const reducer = (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case types.SET_RECENT_SEEN_LISTINGS: {
      if (payload.id) {
        let tempRecentSeen = state.recentOpenListings.filter(
          x => x.id !== payload.id && !!x.id,
        );
        if (tempRecentSeen.length >= 100) {
          tempRecentSeen = tempRecentSeen.slice(0, 99);
        }
        tempRecentSeen = [payload, ...tempRecentSeen];

        return {
          ...state,
          recentOpenListings: tempRecentSeen,
        };
      } else {
        return {
          ...state,
        };
      }
    }

    case types.SET_RECENT_SEARCHED: {
      let tempRecentSeen = state.recentFreeSeach.filter(
        item => item.keyword !== payload.keyword,
      );
      if (tempRecentSeen.length >= 20) {
        tempRecentSeen = tempRecentSeen.slice(0, 19);
      }
      tempRecentSeen = [payload, ...tempRecentSeen];

      return {
        ...state,
        recentFreeSeach: tempRecentSeen,
      };
    }
    case types.SET_RECENT_FILTER_SEARCHED: {
      return {
        ...state,
        recentFilterSeach: payload,
      };
    }

    default: {
      return state;
    }
  }
};
