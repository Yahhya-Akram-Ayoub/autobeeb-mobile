import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistCombineReducers} from 'redux-persist';

// You have to import every reducers and combine them.
import {reducer as NetInfoReducer} from './NetInfoRedux';
import {reducer as ToastReducer} from './ToastRedux';
import {reducer as ChatReducer} from './ChatRedux';
import {reducer as MenuRedux} from './MenuRedux';
import {reducer as UserRedux} from './UserRedux';
import {reducer as HomeRedux} from './HomeRedux';
import {reducer as RecentListingsRedux} from './RecentListingsRedux';

const config = {
  key: 'primary',
  storage: AsyncStorage,
  blacklist: ['netInfo', 'user', 'home', 'toast', 'chat'],
};

export default persistCombineReducers(config, {
  netInfo: NetInfoReducer,
  toast: ToastReducer,
  chat: ChatReducer,
  menu: MenuRedux,
  user: UserRedux,
  home: HomeRedux,
  recentListings: RecentListingsRedux,
});
