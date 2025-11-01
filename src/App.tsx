import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";

import { Dashboard, JobList, Login } from "./pages";
import { Sidebar } from "./features";
import RequireAuth from "./features/auth/RequireAuth";

const AppShell: React.FC = () => (
  <div className="relative flex h-screen bg-[#fafafc]">
    <Sidebar />
    <div className="flex-1 ml-20 overflow-y-auto p-6">
      <Outlet />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/upwork-dashboard" element={<Dashboard />} />
            <Route path="/upwork-dashboard/jobs" element={<JobList />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/upwork-dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
