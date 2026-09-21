import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { backendApi } from '../services/api';

type Role = 'ADMIN' | 'ANALYST' | 'OFFICER' | 'VIEWER';

type SessionUser = {
  name: string;
  username: string;
  role: Role;
};

type SessionState = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const SESSION_STORAGE_KEY = 'bhoomiraksha.session';

const ACCOUNTS: Array<{ username: string; password: string; name: string; role: Role }> = [
  { username: 'admin', password: 'admin123', name: 'Administrator', role: 'ADMIN' },
  { username: 'analyst', password: 'analyst123', name: 'Analytics Desk', role: 'ANALYST' },
  { username: 'officer', password: 'officer123', name: 'Field Officer', role: 'OFFICER' },
  { username: 'viewer', password: 'viewer123', name: 'Read Only User', role: 'VIEWER' },
];

const AuthContext = createContext<SessionState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return;
      const session = JSON.parse(stored) as { user?: SessionUser };
      if (session?.user) setUser(session.user);
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const account = ACCOUNTS.find(entry => entry.username === username.trim() && entry.password === password);
    if (!account) {
      throw new Error('Invalid username or password');
    }
    const sessionUser: SessionUser = {
      name: account.name,
      username: account.username,
      role: account.role,
    };
    setUser(sessionUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: sessionUser }));
    await backendApi.recordAuditEvent({
      action: 'LOGIN',
      details: 'User signed in',
      metadata: { username: sessionUser.username, role: sessionUser.role },
    });
  };

  const logout = () => {
    if (user) {
      backendApi.recordAuditEvent({
        action: 'LOGOUT',
        details: 'User signed out',
        metadata: { username: user.username, role: user.role },
      });
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo<SessionState>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const SESSION_STORAGE_NAME = SESSION_STORAGE_KEY;