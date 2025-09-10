import React, { useState } from "react";
import ButtonLoader from "../utils/ButtonLoader";
import { auth, db } from "../firebase/Config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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
        createdAt: serverTimestamp(),
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
    <div>
      <h2>Register</h2>
      <div>
        <form onSubmit={handleRegister}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

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

          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
            />
          </div>

          <button type="submit" disabled={registerLoading}>
            {registerLoading ? (
              <>
                Registering... <ButtonLoader />
              </>
            ) : (
              "Register"
            )}
          </button>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>

          {error && <div className="alert alert-danger mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Register;
