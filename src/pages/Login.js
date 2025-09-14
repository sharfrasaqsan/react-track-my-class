import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/Config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import ButtonLoader from "../utils/ButtonLoader";

const Login = () => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return setError("Email is required");
    if (!password) return setError("Password is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password.length > 20)
      return setError("Password must be less than 20 characters");

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
      if (!res.exists()) return setError("User data not found");

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
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div
        className="card shadow-sm border-0 rounded-4"
        style={{ maxWidth: 480, width: "100%" }}
      >
        <div
          className="rounded-top-4 p-4 text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,110,253,1) 0%, rgba(111,66,193,1) 100%)",
          }}
        >
          <h3 className="mb-0">Welcome back</h3>
          <div className="opacity-75 small">Sign in to continue</div>
        </div>
        <div className="card-body p-4">
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
              {loginLoading ? (
                <>
                  Logging in... <ButtonLoader />
                </>
              ) : (
                "Login"
              )}
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
  );
};

export default Login;
