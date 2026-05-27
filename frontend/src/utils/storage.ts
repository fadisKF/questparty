const TOKEN_KEY = 'questparty_token';
const USER_KEY = 'questparty_user';
const AUTH_STORE_KEY = 'questparty-auth';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: <T>() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setUser: <T>(user: T) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
    localStorage.removeItem(AUTH_STORE_KEY);
  },
};
