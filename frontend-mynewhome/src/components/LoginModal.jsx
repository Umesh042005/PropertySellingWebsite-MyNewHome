import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Modal from "./Modal.jsx";
import { authApi, getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { GOOGLE_CLIENT_ID } from "../config";

export default function LoginModal() {
  const { login, closeLogin } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ identifier: "", username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = isLogin
        ? await authApi.login(form.identifier.trim(), form.password)
        : await authApi.register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      login(data);
      toast.success(isLogin ? `Welcome back, ${data.user.username}!` : "Account created. Welcome to MyNewHome!");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async ({ credential }) => {
    setError("");
    try {
      const data = await authApi.google(credential);
      login(data);
      toast.success(`Signed in as ${data.user.username}`);
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-in failed"));
    }
  };

  return (
    <Modal onClose={closeLogin} labelledBy="login-title">
      <div className="mb-6 text-center">
        <img src="/logo.png" alt="" width={48} height={48} className="mx-auto mb-3 h-12 w-12 rounded-xl" />
        <h2 id="login-title" className="m-0 text-2xl font-bold">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-1 text-sm text-cocoa-500">
          {isLogin ? "Log in to post and manage your listings" : "It's free and takes less than a minute"}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
        {isLogin ? (
          <div>
            <label htmlFor="identifier" className="label">
              Username or email
            </label>
            <input id="identifier" name="identifier" className="input" autoComplete="username" value={form.identifier} onChange={update} required />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                name="username"
                className="input"
                autoComplete="username"
                value={form.username}
                onChange={update}
                required
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_.\-]{3,30}"
                title="3-30 characters: letters, numbers, . _ -"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input id="email" name="email" type="email" className="input" autoComplete="email" value={form.email} onChange={update} required />
            </div>
          </>
        )}

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="input pr-16"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={update}
              required
              minLength={isLogin ? undefined : 6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-cocoa-500 hover:text-cocoa-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {!isLogin && <p className="mt-1 text-xs text-cocoa-500">At least 6 characters</p>}
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading && <span className="spinner" />}
          {isLogin ? "Log in" : "Create account"}
        </button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-cocoa-400">
            <span className="h-px flex-1 bg-sand-200" />
            or
            <span className="h-px flex-1 bg-sand-200" />
          </div>
          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Google sign-in failed. Please try again.")} shape="pill" />
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-cocoa-600">
        {isLogin ? "New to MyNewHome?" : "Already have an account?"}{" "}
        <button type="button" onClick={switchMode} className="font-semibold text-gold-700 underline-offset-2 hover:underline">
          {isLogin ? "Create an account" : "Log in"}
        </button>
      </p>
    </Modal>
  );
}
