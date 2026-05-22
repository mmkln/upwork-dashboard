import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient, isApiAuthFailureError } from "../../services/apiService";
import { useAuth } from "./AuthProvider";

const LOGIN_PATH = "/login";

const getRedirectState = (location: ReturnType<typeof useLocation>) => ({
  from: {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  },
});

const ApiAuthFailureHandler = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      undefined,
      (error) => {
        if (!isApiAuthFailureError(error)) {
          return Promise.reject(error);
        }

        logout();

        if (location.pathname !== LOGIN_PATH) {
          navigate(LOGIN_PATH, {
            replace: true,
            state: getRedirectState(location),
          });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, [location.hash, location.pathname, location.search, logout, navigate]);

  return null;
};

export default ApiAuthFailureHandler;
