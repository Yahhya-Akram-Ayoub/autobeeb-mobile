import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

export const setCache = async (cacheKey, key, data) => {
  const item = {
    key,
    data,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(cacheKey, JSON.stringify(item));
};

export const getCache = async (cacheKey, key) => {
  const json = await AsyncStorage.getItem(cacheKey);
  if (!json) return null;

  const item = JSON.parse(json);
  if (item.key !== key) return null;

  const isExpired = Date.now() - item.timestamp > CACHE_TTL;
  return isExpired ? null : item.data;
};

export const clearCache = async key => {
  await AsyncStorage.removeItem(key);
};
