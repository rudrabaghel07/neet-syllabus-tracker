import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

import "./Auth.css";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [showResend, setShowResend] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(0);

  const [loginSuccess, setLoginSuccess] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const navigate = useNavigate();

  const {
    currentUser,
    loading: authLoading,
  } = useAuth();


  // --------------------------------
  // Navigate after successful login
  // --------------------------------

  useEffect(() => {
    if (
      loginSuccess &&
      !authLoading &&
      currentUser
    ) {
      navigate("/dashboard");
    }
  }, [
    loginSuccess,
    authLoading,
    currentUser,
    navigate,
  ]);


  // --------------------------------
  // Resend Timer
  // --------------------------------

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(
        (previous) =>
          previous <= 1
            ? 0
            : previous - 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [resendTimer]);


  // --------------------------------
  // Login
  // --------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");
    setShowResend(false);
    setLoginSuccess(false);
    setLoading(true);

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;


      // Get latest verification status

      await user.reload();


      if (!user.emailVerified) {

        setMessage(
          "Please verify your email before logging in. Check your inbox or spam folder."
        );

        setShowResend(true);

        return;
      }


      console.log(
        "Verified user UID:",
        user.uid
      );


      setLoginSuccess(true);

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        setMessage(
          "Invalid email or password."
        );

      } else if (
        error.code ===
        "auth/user-not-found"
      ) {

        setMessage(
          "No account found with this email."
        );

      } else if (
        error.code ===
        "auth/wrong-password"
      ) {

        setMessage(
          "Incorrect password."
        );

      } else {

        setMessage(
          error.message
        );
      }

    } finally {

      setLoading(false);

    }
  };


  // --------------------------------
  // Resend Verification Email
  // --------------------------------

  const handleResendVerification =
    async () => {

      if (resendTimer > 0) {
        return;
      }

      try {

        const user =
          auth.currentUser;


        if (!user) {

          setMessage(
            "Please login first."
          );

          return;
        }


        await sendEmailVerification(
          user
        );


        setMessage(
          "Verification email sent successfully. Please check your inbox or spam folder."
        );


        setResendTimer(15);

      } catch (error) {

        console.error(
          "Resend verification error:",
          error
        );


        setMessage(
          error.message
        );
      }
    };


  // --------------------------------
  // UI
  // --------------------------------

  return (

    <div className="auth-page">

      <div className="auth-orb orb-one" />
      <div className="auth-orb orb-two" />

      <div className="auth-grid" />


      <div className="auth-card">

        {/* Logo */}

        <div className="auth-logo">
          <span>📚</span>
        </div>


        {/* Heading */}

        <div className="auth-heading">

          <p className="auth-kicker">
            NEET SYLLABUS TRACKER
          </p>

          <h1>
            Welcome Back
          </h1>

          <p>
            Continue your preparation
            and track your progress.
          </p>

        </div>


        {/* Form */}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          {/* Email */}

          <div className="input-group">

            <label>
              Email Address
            </label>

            <div className="input-wrap">

              <span>✉</span>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* Password */}

          <div className="input-group">

            <label>
              Password
            </label>

            <div className="input-wrap">

              <span>🔒</span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

              {/* Show / Hide Password */}

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>


          {/* Login Button */}

          <button
            className="auth-button"
            type="submit"
            disabled={
              loading ||
              loginSuccess
            }
          >

            <span>
              {loading ||
              loginSuccess
                ? "Signing in..."
                : "Login"}
            </span>

            {!loading &&
              !loginSuccess && (
                <span>→</span>
              )}

          </button>

        </form>


        {/* Message */}

        {message && (

          <div
            className={`auth-message ${
              showResend
                ? "warning"
                : ""
            }`}
          >

            <span>
              ⓘ
            </span>

            <p>
              {message}
            </p>

          </div>

        )}


        {/* Resend Verification */}

        {showResend && (

          <div className="resend-box">

            {resendTimer > 0 ? (

              <p>
                Resend available in{" "}
                <strong>
                  {resendTimer}s
                </strong>
              </p>

            ) : (

              <button
                type="button"
                className="resend-button"
                onClick={
                  handleResendVerification
                }
              >
                Resend Verification Email
              </button>

            )}

          </div>

        )}


        {/* Divider */}

        <div className="auth-divider">

          <span>
            NEW HERE?
          </span>

        </div>


        {/* Register */}

        <p className="auth-switch">

          Don't have an account?

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
          >
            Create Account
          </button>

        </p>

      </div>

    </div>

  );
}


export default Login;