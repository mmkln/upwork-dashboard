import React from "react";
import {
  BrowserRouter as Router,
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
import { Header, PageContainer, Sidebar } from "./layout";
import { ThemeProvider } from "./shared/theme";

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
          <Header />
          <div className="flex-1 overflow-y-auto">
            <PageContainer>
              <Outlet />
            </PageContainer>
          </div>
        </div>
      </div>
    </CollectionsProvider>
  </FiltersProvider>
);

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
          <GlobalLoadingIndicator />
          <Router>
            <AuthProvider>
              <ApiAuthFailureHandler />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<RequireAuth />}>
                  <Route element={<AppShell />}>
                    <Route path="/upwork-dashboard" element={<Dashboard />} />
                    <Route path="/upwork-dashboard/jobs" element={<JobList />} />
                    <Route
                      path="/upwork-dashboard/market-signals"
                      element={<MarketSignalsBoard />}
                    />
                    <Route
                      path="/upwork-dashboard/radar"
                      element={<OpportunityRadar />}
                    />
                  </Route>
                </Route>
                <Route
                  path="*"
                  element={<Navigate to="/upwork-dashboard" replace />}
                />
              </Routes>
            </AuthProvider>
          </Router>

        {/* Devtools — only visible in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
