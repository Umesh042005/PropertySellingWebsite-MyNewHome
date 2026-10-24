import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Layout from "./components/Layout.jsx";
import PropertyList from "./pages/PropertyList.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import AddProperty from "./pages/AddProperty.jsx";
import EditProperty from "./pages/EditProperty.jsx";
import MyListings from "./pages/MyListings.jsx";
import NotFound from "./pages/NotFound.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { GOOGLE_CLIENT_ID } from "./config";

// Old URL format: /edit-property/:id
function LegacyEditRedirect() {
  const { id } = useParams();
  return <Navigate to={`/property/${id}/edit`} replace />;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PropertyList />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:category" element={<PropertyList />} />
        <Route path="/property/add" element={<AddProperty />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property/:id/edit" element={<EditProperty />} />
        <Route path="/edit-property/:id" element={<LegacyEditRedirect />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/my-ads" element={<Navigate to="/my-listings" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const app = (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );

  // Google sign-in is optional: only enabled when a client id is configured
  return GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider> : app;
}
