// src/utils/authHeaders.ts
import Cookies from 'js-cookie';

export const getAuthHeaders = (): { [key: string]: string } => {
  const token = Cookies.get('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
