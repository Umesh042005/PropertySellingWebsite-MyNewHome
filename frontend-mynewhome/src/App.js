// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import EditProperty from "./components/EditProperty";
import AddProperty from "./pages/AddProperty";
import PropertyList from "./pages/PropertyList";
import PropertyDetail from "./pages/PropertyDetail";
import BackgroundScene from "./components/BackgroundScene";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import AOS from "aos";
import "aos/dist/aos.css";
import "./App.css";

// Google OAuth
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const [properties, setProperties] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Load saved properties on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("properties")) || [];
    setProperties(stored);
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Persist properties to local storage
  useEffect(() => {
    localStorage.setItem("properties", JSON.stringify(properties));
  }, [properties]);

  const handleAdd = (newProperty) => {
    setProperties((prev) => [...prev, newProperty]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <GoogleOAuthProvider clientId="69312397707-7g5e1c06e57ebn1akoj37cgmtcrt03qo.apps.googleusercontent.com">
      <Router>
        <div className="app-background">
          <BackgroundScene />
          <div className="app-content">
            <Navbar token={token} onLogout={handleLogout} />
            {/* Routes */}
            <Routes>
              <Route path="/" element={<PropertyList />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:category" element={<PropertyList />} />
              <Route path="/edit-property/:id" element={<EditProperty />} />
              <Route
                path="/property/add"
                element={<AddProperty token={token} onAdd={handleAdd} />}
              />
              <Route path="/property/:id" element={<PropertyDetail />} />
            </Routes>
          </div>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
