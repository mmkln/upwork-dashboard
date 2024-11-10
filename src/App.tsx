import React from "react";
import "./App.css";

import { Dashboard } from "./pages";
import { Sidebar } from "./features";

function App() {
  return (
    <>
      <div className="app-container">
        <Sidebar />
        <div className="w-full h-[100vh] overflow-y-scroll">
          <div className="container">
            <Dashboard />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
