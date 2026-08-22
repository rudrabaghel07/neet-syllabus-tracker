import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveComplaint } from "../services/firestoreService";
import "./SpecialMember.css";
const SPECIAL_USER_NAME = "Nandini";

// const SPECIAL_USER_EMAIL = "vishwakarmaniva@gmail.com";

const SPECIAL_USER_EMAIL = "nandinivish01@gmail.com";
// const SPECIAL_USER_EMAIL = "rudrabaghel68@gmail.com";

function SpecialMember() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const [complaint, setComplaint] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loveLevel, setLoveLevel] = useState(82);

  const isSpecialUser =
    currentUser?.email?.toLowerCase() ===
    SPECIAL_USER_EMAIL.toLowerCase();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (!loading && currentUser && !isSpecialUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, loading, isSpecialUser, navigate]);

  if (loading || !currentUser || !isSpecialUser) {
    return null;
  }

  const userName = SPECIAL_USER_NAME;

  const getLoveMessage = () => {
    if (loveLevel <= 20) {
      return "A little spark is glowing ✨";
    }

    if (loveLevel <= 40) {
      return "Something sweet is growing 💗";
    }

    if (loveLevel <= 60) {
      return "Getting warmer... 🥰";
    }

    if (loveLevel <= 80) {
      return "Lots of love in the air 💕";
    }

    if (loveLevel <= 95) {
      return "So much love! 💖";
    }

    return "Infinite love! ❤️‍🔥";
  };

  const handleComplaintSubmit = async (event) => {
    event.preventDefault();

    const complaintText = complaint.trim();

    if (!complaintText || saving) {
      return;
    }

    setSaving(true);
    setSubmitted(false);
    setErrorMessage("");

    try {
      await saveComplaint({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName,
        complaint: complaintText,
      });

      setComplaint("");
      setSubmitted(true);
    } catch (error) {
      console.error("Complaint save error:", error);

      setErrorMessage(
        `Firestore Error: ${error.code || "unknown"} - ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="special-page">

      {/* Animated romantic background */}
      <div className="romantic-background">
        <span className="floating-heart heart-1">❤️</span>
        <span className="floating-heart heart-2">💗</span>
        <span className="floating-heart heart-3">💕</span>
        <span className="floating-heart heart-4">💖</span>
        <span className="floating-heart heart-5">💘</span>
        <span className="floating-heart heart-6">💝</span>

        <span className="sparkle sparkle-1">✨</span>
        <span className="sparkle sparkle-2">✦</span>
        <span className="sparkle sparkle-3">✨</span>
        <span className="sparkle sparkle-4">✧</span>

        <div className="romantic-orb orb-1" />
        <div className="romantic-orb orb-2" />
      </div>

      <section className="special-container">

        {/* Back */}
        <button
          type="button"
          className="special-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* ================================
            ROMANTIC WELCOME
        ================================= */}
        <section className="romantic-welcome">

          <div className="heart-rings">
            <span />
            <span />
            <span />
          </div>

          <div className="main-heart">
            ❤️
          </div>

          <p className="romantic-kicker">
            ✨ A LITTLE PLACE MADE JUST FOR YOU ✨
          </p>

          <h1>
            Hello, <span>{userName}</span>! 💕
          </h1>

          <p className="romantic-message">
            Welcome to your special space.
            <br />
            Take a breath, smile a little,
            and enjoy this little corner made with love. 🫶
          </p>

          <div className="romantic-divider">
            <span>♡</span>
            <span>♡</span>
            <span>♡</span>
          </div>

          <div className="love-quote">
            "Some moments are small,
            but they deserve a little extra love." 💗
          </div>

          <div className="welcome-emojis">
            🌹 &nbsp; ✨ &nbsp; 💕 &nbsp; 🦋 &nbsp; 💖
          </div>
        </section>

        {/* ================================
            LOVE METER
        ================================= */}
        <section className="love-meter-card">

          <div className="love-meter-heading">
            <span className="love-meter-icon">💗</span>

            <div>
              <p className="feature-label">
                SPECIAL INTERACTION
              </p>

              <h2>
                Love Meter
              </h2>
            </div>
          </div>

          <p className="love-meter-subtitle">
            How much love should we send your way today? 🥰
          </p>

          <div
            className="love-heart-display"
            style={{
              "--love-scale": `${0.9 + loveLevel / 250}`,
            }}
          >
            <div className="meter-heart">
              {loveLevel >= 96 ? "❤️‍🔥" : "💗"}
            </div>

            <div className="heart-glow" />
          </div>

          <div className="love-percentage">
            {loveLevel}%
          </div>

          <div className="love-progress-track">
            <div
              className="love-progress-fill"
              style={{
                width: `${loveLevel}%`,
              }}
            />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={loveLevel}
            onChange={(event) =>
              setLoveLevel(Number(event.target.value))
            }
            className="love-slider"
            aria-label="Love Meter"
          />

          <div className="love-meter-labels">
            <span>✨ Little</span>
            <span>💕 More</span>
            <span>❤️ Infinite</span>
          </div>

          <div className="love-message">
            {getLoveMessage()}
          </div>

          <button
            type="button"
            className="love-button"
            onClick={() =>
              setLoveLevel(
                Math.floor(Math.random() * 21) + 80
              )
            }
          >
            Send More Love 💖
          </button>
        </section>

        {/* ================================
            FEATURE GRID
        ================================= */}
        <section className="special-feature-grid">

          {/* Complaint */}
          <article className="special-feature-card complaint-card">

            <div className="feature-icon">
              📝
            </div>

            <p className="feature-label">
              YOUR VOICE MATTERS
            </p>

            <h2>
              Complaint Box
            </h2>

            <p className="feature-description">
              Found something that needs attention?
              Tell us directly. 💌
            </p>

            <form
              className="complaint-form"
              onSubmit={handleComplaintSubmit}
            >
              <label htmlFor="special-complaint">
                What would you like to report?
              </label>

              <textarea
                id="special-complaint"
                value={complaint}
                onChange={(event) => {
                  setComplaint(event.target.value);
                  setSubmitted(false);
                  setErrorMessage("");
                }}
                placeholder="Write your complaint or feedback here..."
                rows={5}
                disabled={saving}
              />

              <button
                type="submit"
                className="special-submit-button"
                disabled={!complaint.trim() || saving}
              >
                {saving
                  ? "Saving... ⏳"
                  : "Send Complaint ➜"}
              </button>
            </form>

            {submitted && (
              <div
                className="complaint-success"
                role="status"
              >
                ✅ Thank you, {userName}! Your complaint
                has been submitted successfully.
              </div>
            )}

            {errorMessage && (
              <div
                className="complaint-error"
                role="alert"
              >
                ❌ {errorMessage}
              </div>
            )}
          </article>

          {/* Coming Soon */}
          <article className="special-feature-card coming-card">

            <div className="feature-icon">
              🎁
            </div>

            <p className="feature-label">
              MADE WITH LOVE
            </p>

            <h2>
              More Special Things
            </h2>

            <p className="feature-description">
              This little space is waiting for more
              surprises created specially for you. 🌈
            </p>

            <div className="coming-badge">
              ✨ Coming Soon
            </div>

            <div className="mini-hearts">
              💗 💕 💖 💘
            </div>
          </article>

        </section>

        <footer className="special-footer">
          Made with <span>♥</span> for{" "}
          <strong>{userName}</strong>
        </footer>

      </section>
    </main>
  );
}

export default SpecialMember;