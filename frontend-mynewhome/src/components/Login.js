import React, { useState } from "react";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ closeModal, setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword((s) => !s);

  const showAlert = (message) => {
    alert(message);
  };

  // Handle standard email/password login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    // Construct payload based on mode
    const body = isLogin
      ? { username: email, password }
      : { username: email, email, password };

    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        if (!isLogin) {
          showAlert("Account created successfully! Please login with your credentials.");
          setIsLogin(true);
          setEmail("");
          setPassword("");
          return;
        }

        if (data.token) {
          // Check if backend sent a picture, otherwise check localStorage or leave undefined
          const picture = data.picture || localStorage.getItem("picture");

          setToken(data.token, email, picture);
          closeModal();
        } else {
          showAlert("Login failed: Token not received from server.");
        }

      } else {
        const errorReason = data.message || data.error || res.statusText;

        if (res.status === 401) {
          showAlert("Invalid email/username or password.");
        } else if (res.status === 409) {
          showAlert("This email/username is already registered.");
        } else if (res.status === 400) {
          showAlert("Invalid data format. Please check all fields.");
        } else {
          showAlert(`Error ${res.status}: ${errorReason}`);
        }
      }
    } catch (err) {
      setLoading(false);
      console.error("Network error:", err);
      showAlert("Network error: Could not connect to server.");
    }
  };

  // Handle Google Login
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Extract picture from response or Google credential
        const picture =
          data.picture ||
          JSON.parse(atob(credentialResponse.credential.split(".")[1]))?.picture ||
          "";

        setToken(data.token, data.email || "Google User", picture);
        closeModal();
      } else {
        const errorReason = data.error || data.message || res.statusText;
        showAlert(`Google login failed: ${errorReason}`);
      }
    } catch (err) {
      showAlert("Network error: Could not connect to Google login service.");
    }
  };

  const handleGoogleLoginError = () => {
    showAlert("Google login failed. Please try again.");
  };

  return (
    <div className="login-modal" onClick={(e) => {
      if (e.target === e.currentTarget) closeModal();
    }}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h2>{isLogin ? "Login" : "Sign Up"}</h2>
          <p className="login-subtitle">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label">Email / Username</label>
            <input
              type="text"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="login-password-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-google">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>

        <div className="login-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="login-switch-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}