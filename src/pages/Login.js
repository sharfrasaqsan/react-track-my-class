import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/Config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password.length > 20) {
      setError("Password must be less than 20 characters");
      return;
    }

    setError("");
    setLoginLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const currentUser = userCredentials.user;
      const res = await getDoc(doc(db, "users", currentUser.uid));
      if (!res.exists()) {
        setError("User data not found");
        return;
      }
      const userData = res.data();
      setUser({ id: currentUser.uid, ...userData });
      setEmail("");
      setPassword("");
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      setError("Failed to login");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="container auth-form-wrapper">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="auth-form">
            <h2 className="text-center mb-4 text-primary">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              <div className="text-center mt-3">
                <Link to="/forgot-password" className="d-block">
                  Forgot Password?
                </Link>
                <span>
                  Don’t have an account? <Link to="/register">Register</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
