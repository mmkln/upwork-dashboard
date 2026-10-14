import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";

import {
  Dashboard,
  JobList,
  Login,
  MarketSignalsBoard,
  OpportunityRadar,
  ProfilesPage,
} from "./pages";
import {
  FiltersProvider,
  CollectionsProvider,
} from "./features";
import { AuthProvider } from "./features/auth/AuthProvider";
import ApiAuthFailureHandler from "./features/auth/ApiAuthFailureHandler";
import RequireAuth from "./features/auth/RequireAuth";
import { PageLoadingBar } from "./components/ui";
import { useIsFetching } from "@tanstack/react-query";
import {
  Header,
  HeaderActionsProvider,
  PageContainer,
  Sidebar,
} from "./layout";
import { ThemeProvider } from "./shared/theme";
import { ToastProvider } from "./shared/toast/ToastProvider";
import { AppRouter, ROUTE_PATHS } from "./shared/routing";

// TanStack Query (added for clean request management, automatic cancellation, and proper loading states)
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";




/**
 * Global loading bar powered by TanStack Query.
 * This replaces the old global request counter hack.
 * It will show while any queries (including background ones) are fetching.
 *
 * Later we can make it more selective, e.g.:
 *   useIsFetching({ queryKey: ['jobs'] })
 */
const GlobalLoadingIndicator: React.FC = () => {
  const isFetching = useIsFetching();
  return <PageLoadingBar loading={isFetching > 0} />;
};

const AppShell: React.FC = () => (
  <FiltersProvider>
    <CollectionsProvider>
      <div className="relative flex h-screen bg-background">
        <Sidebar />
        <div className="ml-app-rail flex flex-1 flex-col overflow-hidden">
          <HeaderActionsProvider>
            <Header />
            <div className="flex-1 overflow-y-auto">
              <PageContainer>
                <Outlet />
              </PageContainer>
            </div>
          </HeaderActionsProvider>
        </div>
      </div>
    </CollectionsProvider>
  </FiltersProvider>
);

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <GlobalLoadingIndicator />
          <AppRouter>
            <AuthProvider>
              <ApiAuthFailureHandler />
              <Routes>
                <Route path={ROUTE_PATHS.login} element={<Login />} />
                <Route element={<RequireAuth />}>
                  <Route element={<AppShell />}>
                    <Route path={ROUTE_PATHS.home} element={<Dashboard />} />
                    <Route path={ROUTE_PATHS.jobs} element={<JobList />} />
                    <Route
                      path={ROUTE_PATHS.profiles}
                      element={<ProfilesPage />}
                    />
                    <Route
                      path={ROUTE_PATHS.marketSignals}
                      element={<MarketSignalsBoard />}
                    />
                    <Route
                      path={ROUTE_PATHS.radar}
                      element={<OpportunityRadar />}
                    />
                  </Route>
                </Route>
                <Route
                  path="*"
                  element={<Navigate to={ROUTE_PATHS.home} replace />}
                />
              </Routes>
            </AuthProvider>
          </AppRouter>

          {/* Devtools — only visible in development */}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
