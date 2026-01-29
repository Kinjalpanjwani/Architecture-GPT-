/*import React from "react";
import ArchitectGPT from "./ArchitectGPT";

function App() {
  return (
    <div>
      <ArchitectGPT />
    </div>
  );
}

export default App;*/

import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ArchitectGPT from "./ArchitectGPT";
import LoginPage from "./LoginPage";

function App() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <Routes location={location}>
      <Route path="/" element={isLoggedIn ? <ArchitectGPT /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;

