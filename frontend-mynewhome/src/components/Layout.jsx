import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import LoginModal from "./LoginModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children }) {
  const { loginOpen } = useAuth();
  const { pathname } = useLocation();

  // Start each page at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {loginOpen && <LoginModal />}
    </div>
  );
}
