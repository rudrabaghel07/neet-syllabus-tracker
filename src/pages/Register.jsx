import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Auth.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((previous) =>
        previous <= 1 ? 0 : previous - 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setVerificationSent(false);
    setResendTimer(0);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await sendEmailVerification(user);

      setMessage(
        "Verification email sent successfully. Please check your inbox or spam folder."
      );
      setVerificationSent(true);
      setResendTimer(15);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        setMessage(
          "This email is already registered. Please login instead."
        );
      } else if (error.code === "auth/weak-password") {
        setMessage("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Please enter a valid email address.");
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendTimer > 0) return;

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("Please register first.");
        return;
      }

      await sendEmailVerification(user);

      setMessage(
        "Verification email sent again. Please check your inbox or spam folder."
      );
      setResendTimer(15);
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb orb-one" />
      <div className="auth-orb orb-two" />
      <div className="auth-grid" />

      <div className="auth-card register-card">
        <div className="auth-logo">
          <span>🚀</span>
        </div>

        <div className="auth-heading">
          <p className="auth-kicker">START YOUR JOURNEY</p>
          <h1>Create Account</h1>
          <p>Build your NEET preparation profile and track every step.</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <span>✉</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrap">
              <span>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading ? "Creating Account..." : "Create Account"}
            </span>
            {!loading && <span>→</span>}
          </button>
        </form>

        {message && (
          <div className="auth-message">
            <span>ⓘ</span>
            <p>{message}</p>
          </div>
        )}

        {verificationSent && (
          <div className="resend-box">
            {resendTimer > 0 ? (
              <p>
                Resend available in{" "}
                <strong>{resendTimer}s</strong>
              </p>
            ) : (
              <button
                type="button"
                className="resend-button"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        <div className="auth-divider">
          <span>ALREADY A MEMBER?</span>
        </div>

        <p className="auth-switch">
          Already have an account?
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;