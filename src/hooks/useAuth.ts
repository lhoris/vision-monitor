import { useState } from 'react';
import type { AuthState } from '../types/index';

const AUTH_STORAGE_KEY = 'visionMonitor:auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return { isLoggedIn: false, userName: '' };
  });

  const login = (username: string, password: string): boolean => {
    if (username === 'tester' && password === 'tester123') {
      const newState: AuthState = { isLoggedIn: true, userName: username };
      setAuthState(newState);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setAuthState({ isLoggedIn: false, userName: '' });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return { ...authState, login, logout };
}
