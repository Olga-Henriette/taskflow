import axios from './axios';

export const searchUserByEmail = async (email) => {
  const response = await axios.get(`/users/search`, { params: { email } });
  return response;
};