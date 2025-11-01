import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { AuthUser } from "../../models";
import {
  login as loginRequest,
  setApiAuthToken,
  getApiAuthToken,
} from "../../services";

const AUTH_USER_STORAGE_KEY = "authUser";

type LoginFunction = (username: string, password: string) => Promise<void>;

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: LoginFunction;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = getApiAuthToken();
    let storedUser: AuthUser | null = null;

    if (typeof window !== "undefined") {
      const storedUserRaw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (storedUserRaw) {
        try {
          storedUser = JSON.parse(storedUserRaw) as AuthUser;
        } catch (error) {
          console.warn("Failed to parse stored auth user", error);
        }
      }
    }

    setToken(storedToken);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = useCallback<LoginFunction>(async (username, password) => {
    try {
      const response = await loginRequest({ username, password });
      setApiAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          AUTH_USER_STORAGE_KEY,
          JSON.stringify(response.user),
        );
      }
    } catch (error) {
      let message = "Unable to sign in. Please check your credentials.";

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { detail?: string; non_field_errors?: string[]; errors?: string[] }
          | undefined;

        if (data?.detail) {
          message = data.detail;
        } else if (data?.non_field_errors?.length) {
          message = data.non_field_errors[0];
        } else if (data?.errors?.length) {
          message = data.errors[0];
        } else if (error.message) {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    setApiAuthToken(null);
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      login,
      logout,
      isLoading,
    }),
    [token, user, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
