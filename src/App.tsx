import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";

import { Dashboard, JobList, Login, OpportunityRadar } from "./pages";
import {
  FiltersProvider,
  CollectionsProvider,
  LoadingProvider,
  useGlobalLoading,
} from "./features";
import RequireAuth from "./features/auth/RequireAuth";
import { PageLoadingBar } from "./components/ui";
import { Header, PageContainer, Sidebar } from "./layout";

const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading } = useGlobalLoading();
  return <PageLoadingBar loading={isLoading} />;
};

const AppShell: React.FC = () => (
  <FiltersProvider>
    <CollectionsProvider>
      <div className="relative flex h-screen bg-[#fafafc]">
        <Sidebar />
        <div className="flex-1 ml-[68px] flex flex-col overflow-hidden">
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
    <LoadingProvider>
      <GlobalLoadingIndicator />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/upwork-dashboard" element={<Dashboard />} />
              <Route path="/upwork-dashboard/jobs" element={<JobList />} />
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
      </Router>
    </LoadingProvider>
  );
}

export default App;
