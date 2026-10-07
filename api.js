import axios from 'axios';

import { clearSession } from '../utils/storage';
import { getStoredSession } from '../utils/storage';

const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
const normalizedBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, '')
  : '/api';

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const session = getStoredSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error?.response?.data?.message;
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isAuthMutation = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (
      status === 401 &&
      !isAuthMutation &&
      (backendMessage === 'Invalid token' || backendMessage === 'The session is no longer valid')
    ) {
      clearSession();
      window.dispatchEvent(new Event('session-expired'));
    }

    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data.data;

export default api;
