import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// Shows a login prompt (and opens the login modal) instead of the page for guests
export default function RequireAuth({ children, message = "Log in to continue" }) {
  const { isLoggedIn, openLogin } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) openLogin();
  }, [isLoggedIn, openLogin]);

  if (isLoggedIn) return children;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-5xl" aria-hidden="true">🔐</div>
      <h1 className="mt-4 text-2xl font-bold">{message}</h1>
      <p className="mt-2 text-cocoa-500">You need an account to post and manage listings.</p>
      <button type="button" className="btn-primary mt-6" onClick={() => openLogin()}>
        Log in or sign up
      </button>
    </div>
  );
}
