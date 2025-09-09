import React, { useState } from "react";
import ButtonLoader from "../utils/ButtonLoader";
import { auth } from "../firebase/Config";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setRegisterLoading(true);
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { id } = userCredentials.uid;

      console.log(userCredentials);
    } catch (err) {
      console.log("Error Code: ", err.code, "Error Message: ", err.message);
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

            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
            />

            <button type="submit">
              {registerLoading ? (
                <>
                  Registering... <ButtonLoader />
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
