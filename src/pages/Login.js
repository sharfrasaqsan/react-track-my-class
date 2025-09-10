import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { ButtonToolbar } from "react-bootstrap";
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
    <div>
      <h2>Login</h2>
      <div>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </div>

          <button type="submit" disabled={loginLoading}>
            {loginLoading ? (
              <>
                Logging in...
                <ButtonToolbar />
              </>
            ) : (
              "Login"
            )}
          </button>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>

          <p>
            <Link to="/forgot-password">Forgot Password</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
