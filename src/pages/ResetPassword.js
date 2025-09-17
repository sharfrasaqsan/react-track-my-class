import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/Config";
import { toast } from "sonner";
import ButtonLoader from "../utils/ButtonLoader";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent. Check your email.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const message =
        err.code === "auth/user-not-found"
          ? "No account found with that email."
          : err.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Could not send reset email. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="text-center mb-3 text-primary">Reset Password</h3>
              <p className="text-muted text-center mb-4">
                Enter the email associated with your account and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? <>Sending <ButtonLoader /></> : "Send reset link"}
                </button>

                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <div className="d-flex justify-content-between mt-3">
                  <Link to="/login">Back to Login</Link>
                  <span>
                    Need an account? <Link to="/register">Register</Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
