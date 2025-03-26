import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import { Dashboard, JobList } from "./pages";
import { Sidebar } from "./features";

function App() {
  return (
    <Router>
      <div className="relative flex h-screen bg-[#fafafc]">
        <Sidebar />
        <div className="flex-1 ml-20 overflow-y-auto p-6">
          <Routes>
            <Route path="/upwork-dashboard" element={<Dashboard />} />
            <Route path="/upwork-dashboard/jobs" element={<JobList />} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
