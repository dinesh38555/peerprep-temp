import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    user_password: "",
    first_name: "",
    last_name: "",
  });
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/sheets");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await api.post("/auth/login", {
          usernameOrEmail,
          user_password: formData.user_password,
        });

        if (res.data.token) {
          login(res.data.token, res.data.user);
        }

        setMessage("Login successful! Redirecting to home page...");
        setTimeout(() => navigate("/sheets"), 1000);
      } else {
        const res = await api.post("/auth/signup", {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          user_password: formData.user_password,
        });

        setMessage(res.data.message || "Signup successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Please enter your credentials to continue"
              : "Fill in your details to get started"}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}
        
        {message && (
          <div className="alert alert-success">
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          {isLogin ? (
            <>
              <div className="form-group">
                <label htmlFor="usernameOrEmail" className="form-label">
                  Username or Email
                </label>
                <input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="Enter your username or email"
                  className="form-input"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  name="user_password"
                  className="form-input"
                  value={formData.user_password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    placeholder="First name"
                    name="first_name"
                    className="form-input"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    placeholder="Last name"
                    name="last_name"
                    className="form-input"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup_password" className="form-label">
                  Password
                </label>
                <input
                  id="signup_password"
                  type="password"
                  placeholder="Create a password"
                  name="user_password"
                  className="form-input"
                  value={formData.user_password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? (
              <span className="spinner-container">
                <span className="spinner"></span>
                Processing...
              </span>
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="toggle-section">
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
              setFormData({
                username: "",
                email: "",
                user_password: "",
                first_name: "",
                last_name: "",
              });
              setUsernameOrEmail("");
            }}
            className="toggle-btn"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
