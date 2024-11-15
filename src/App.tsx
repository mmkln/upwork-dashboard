import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import { Dashboard, JobList } from "./pages";
import { Sidebar } from "./features";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="w-full h-[100vh] overflow-y-scroll">
          <div className="container">
            <Routes>
              <Route path="/upwork-dashboard" element={<Dashboard />} />
              <Route path="/upwork-dashboard/jobs" element={<JobList />} />
              {/* Add more routes as needed */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
