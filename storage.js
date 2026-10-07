const TOKEN_KEY = 'stadionhub-token';
const USER_KEY = 'stadionhub-user';

export const persistSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  return {
    token: token || '',
    user: rawUser ? JSON.parse(rawUser) : null,
  };
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
