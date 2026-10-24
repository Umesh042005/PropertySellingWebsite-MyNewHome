import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadAuth, saveAuth, setUnauthorizedHandler } from "../api/client";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [auth, setAuth] = useState(() => loadAuth());
  // Login modal state lives here so any page can ask the user to log in
  const [loginOpen, setLoginOpen] = useState(false);
  const afterLogin = useRef(null);

  const login = useCallback(({ token, user }) => {
    const next = { token, user };
    saveAuth(next);
    setAuth(next);
    setLoginOpen(false);
    const cb = afterLogin.current;
    afterLogin.current = null;
    if (cb) cb();
  }, []);

  const logout = useCallback(() => {
    saveAuth(null);
    setAuth(null);
  }, []);

  const openLogin = useCallback((onSuccess) => {
    afterLogin.current = onSuccess || null;
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    afterLogin.current = null;
    setLoginOpen(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (loadAuth() || auth) {
        logout();
        toast.info("Your session has expired. Please log in again.");
      }
    });
  }, [auth, logout, toast]);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      isLoggedIn: !!auth,
      login,
      logout,
      loginOpen,
      openLogin,
      closeLogin,
    }),
    [auth, login, logout, loginOpen, openLogin, closeLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
