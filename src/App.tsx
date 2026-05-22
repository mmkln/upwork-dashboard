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
  LoadingProvider,
  useGlobalLoading,
} from "./features";
import { AuthProvider } from "./features/auth/AuthProvider";
import ApiAuthFailureHandler from "./features/auth/ApiAuthFailureHandler";
import RequireAuth from "./features/auth/RequireAuth";
import { PageLoadingBar } from "./components/ui";
import { Header, PageContainer, Sidebar } from "./layout";
import { ThemeProvider } from "./shared/theme";

const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading } = useGlobalLoading();
  return <PageLoadingBar loading={isLoading} />;
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
      <LoadingProvider>
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
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
