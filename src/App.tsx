import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import "./App.css";

import { AnalyticsPage, JobsPage, PublicAnalyticsPage, BlogListPage, BlogPostPage, LoginPage } from "./pages";
import { Sidebar } from "./features";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/upwork-dashboard/login";
  if (isLogin) {
    return (
      <Routes>
        <Route path="/upwork-dashboard/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/upwork-dashboard/login" replace />} />
      </Routes>
    );
  }
  return (
    <div className="relative flex h-screen bg-[#fafafc]">
      <Sidebar />
      <div className="flex-1 ml-20 overflow-y-auto p-6">
        <Routes>
          <Route path="/upwork-dashboard" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/upwork-dashboard/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/upwork-dashboard/public" element={<PublicAnalyticsPage />} />
          <Route path="/upwork-dashboard/blog" element={<BlogListPage />} />
          <Route path="/upwork-dashboard/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<Navigate to="/upwork-dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
