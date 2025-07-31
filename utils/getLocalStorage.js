// utils/getLocalStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLocalStorage = async () => {
  const access_token = await AsyncStorage.getItem('access_token');
  const user_id = await AsyncStorage.getItem('user_id');
  const email = await AsyncStorage.getItem('user_email');

  return {
    access_token,
    user_id,
    email,
  };
};
