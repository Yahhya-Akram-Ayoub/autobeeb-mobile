import {Languages} from '../../../common';

export const AllMakes = {
  id: '',
  all: true,
  image: require('../../../images/SellTypes/BlueAll.png'),
  get name() {
    return Languages.AllMakes;
  },
};

export const AllCategories = {
  id: '',
  all: true,
  image: require('../../../images/SellTypes/BlueAll.png'),
  get name() {
    return Languages.All;
  },
};

export const MoreData = {
  id: '',
  more: true,
  image: require('../../../images/SellTypes/BlueAll.png'),
  get name() {
    return Languages.See_more;
  },
};

export const arrayOfNull = length => Array.from({length}, () => null);

export const deepClone = obj => JSON.parse(JSON.stringify(obj));
