import React, { createContext, useState, useContext } from 'react';

interface AuthContextProps {
  token: string | null;
  roles: string[];
  login: (token: string, roles: string[]) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const login = (newToken: string, newRoles: string[]) => {
    setToken(newToken);
    setRoles(newRoles);
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ token, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
