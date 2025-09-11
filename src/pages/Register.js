import React, { useState } from "react";
import ButtonLoader from "../utils/ButtonLoader";
import { auth, db } from "../firebase/Config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const { setUser } = useAuth();
  const { setUsers } = useData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Name is required");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
    setRegisterLoading(true);
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = userCredentials.user;
      const newUser = {
        id: uid,
        name,
        email,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", uid), newUser);
      setUsers((prev) => [...prev, { id: uid, ...newUser }]);
      setUser({ id: uid, ...newUser });
      toast.success("User registered successfully");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/");
    } catch (err) {
      console.error("Firestore Error:", err.code, err.message);
      toast.error(err.message || "Failed to register");
      setError(err.message || "Failed to register");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="container auth-form-wrapper">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="auth-form">
            <h2 className="text-center mb-4 text-primary">Register</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>

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

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={registerLoading}
              >
                {registerLoading ? (
                  <>
                    Registering... <ButtonLoader />
                  </>
                ) : (
                  "Register"
                )}
              </button>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
