import { createContext, useEffect, useState } from 'react';

import { authService } from '../services/authService';
import { clearSession, getStoredSession, persistSession } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const boot = async () => {
      const session = getStoredSession();

      if (!session?.token) {
        setIsBooting(false);
        return;
      }

      try {
        const currentUser = await authService.me();
        setToken(session.token);
        setUser(currentUser);
      } catch {
        clearSession();
        setToken('');
        setUser(null);
      } finally {
        setIsBooting(false);
      }
    };

    boot();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
      setToken('');
      setUser(null);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const applySession = (payload) => {
    persistSession(payload);
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const session = await authService.login(credentials);
    applySession(session);
    return session;
  };

  const register = async (payload) => {
    const session = await authService.register(payload);
    applySession(session);
    return session;
  };

  const logout = () => {
    clearSession();
    setToken('');
    setUser(null);
  };

  const refreshUser = async () => {
    const currentUser = await authService.me();
    setUser(currentUser);

    const session = getStoredSession();
    if (session?.token) {
      persistSession({
        token: session.token,
        user: currentUser,
      });
    }

    return currentUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isBooting,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
