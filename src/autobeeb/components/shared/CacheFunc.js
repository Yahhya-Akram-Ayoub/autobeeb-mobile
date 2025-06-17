import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

export const setCache = async (key, data) => {
  const item = {
    data,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(key, JSON.stringify(item));
};

export const getCache = async key => {
  const json = await AsyncStorage.getItem(key);
  if (!json) return null;

  const item = JSON.parse(json);
  const isExpired = Date.now() - item.timestamp > CACHE_TTL;
  return isExpired ? null : item.data;
};

export const clearCache = async key => {
  await AsyncStorage.removeItem(key);
};
