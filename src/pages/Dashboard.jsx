import { signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MetricCard from "../components/dashboard/MetricCard";
import SubjectTabs from "../components/dashboard/SubjectTabs";
import UnitCard from "../components/dashboard/UnitCard";
import { useAuth } from "../context/AuthContext";
import syllabusData from "../data/syllabusData";
import { auth } from "../firebase";
import { getAllTopicProgress, saveTopicProgress } from "../services/firestoreService";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [progress, setProgress] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("physics");
  const [openUnit, setOpenUnit] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("neet-dashboard-dark") === "true";
  });

  const currentSubject = syllabusData[selectedSubject];

  const allTopics = useMemo(() => currentSubject.units.flatMap((unit) => unit.topics), [currentSubject]);
  const totalTopics = allTopics.length;

  const completedTopics = allTopics.filter((topic) => progress[topic.id]?.completed === true).length;
  const revisionTopics = allTopics.filter((topic) => progress[topic.id]?.revision === true).length;
  const remainingTopics = totalTopics - completedTopics;

  const progressPercentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  const completedPercentage = totalTopics === 0 ? 0 : (completedTopics / totalTopics) * 100;
  const revisionPercentage = totalTopics === 0 ? 0 : (revisionTopics / totalTopics) * 100;
  const remainingPercentage = totalTopics === 0 ? 0 : (remainingTopics / totalTopics) * 100;

  const getUnitProgress = (unit) => {
    const total = unit.topics.length;
    const completed = unit.topics.filter((topic) => progress[topic.id]?.completed === true).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
    };
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (!currentUser) {
        return;
      }

      try {
        const savedProgress = await getAllTopicProgress(currentUser.uid);
        setProgress(savedProgress);
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();
  }, [currentUser]);

  useEffect(() => {
    window.localStorage.setItem("neet-dashboard-dark", darkMode ? "true" : "false");
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleTopicUpdate = async (topicId, completed, revision) => {
    if (!currentUser) {
      return;
    }

    try {
      const currentProgress = progress[topicId] || { completed: false, revision: false };
      await saveTopicProgress(currentUser.uid, topicId, completed, revision);

      setProgress((previousProgress) => ({
        ...previousProgress,
        [topicId]: {
          completed,
          revision,
        },
      }));
    } catch (error) {
      console.error("Progress update error:", error);
      alert(`Firestore Error: ${error.code} - ${error.message}`);
    }
  };

  const handleComplete = async (topicId) => {
    const currentProgress = progress[topicId] || { completed: false, revision: false };
    await handleTopicUpdate(topicId, !currentProgress.completed, currentProgress.revision);
  };

  const handleRevision = async (topicId) => {
    const currentProgress = progress[topicId] || { completed: false, revision: false };
    await handleTopicUpdate(topicId, currentProgress.completed, !currentProgress.revision);
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Student";

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <p className="eyebrow">NEET PREPARATION HUB</p>
          <h1>NEET Syllabus Tracker</h1>
          <p className="dashboard-user">Welcome back, {displayName}</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((current) => !current)}
            aria-pressed={darkMode}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <section className="progress-section">
        <div className="progress-card">
          <div className="progress-card-heading">
            <div>
              <p className="eyebrow">CURRENT SUBJECT</p>
              <h2>{currentSubject.name} Progress</h2>
            </div>
            <p className="progress-summary">{completedTopics}/{totalTopics} topics completed</p>
          </div>

          <div className="progress-stats">
            <MetricCard label="Total Topics" value={totalTopics} tone="water-total" level={100} />
            <MetricCard label="Completed" value={completedTopics} tone="water-completed" level={completedPercentage} />
            <MetricCard label="Revision" value={revisionTopics} tone="water-revision" level={revisionPercentage} />
            <MetricCard label="Remaining" value={remainingTopics} tone="water-remaining" level={remainingPercentage} />
          </div>

          <div className="progress-bar-container">
            <div className="progress-info">
              <span>{currentSubject.name} Progress</span>
              <span>{progressPercentage}%</span>
            </div>

            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="subject-section">
        <SubjectTabs
          subjects={syllabusData}
          selectedSubject={selectedSubject}
          onSelect={(subjectId) => {
            setSelectedSubject(subjectId);
            setOpenUnit(null);
          }}
        />

        <div className="subject-panel">
          <div className="subject-panel-heading">
            <h2>{currentSubject.name}</h2>
            <p>Track every unit and topic with independent completion and revision states.</p>
          </div>

          {currentSubject.units.map((unit) => {
            const unitProgress = getUnitProgress(unit);

            return (
              <UnitCard
                key={unit.id}
                unit={unit}
                unitProgress={unitProgress}
                openUnit={openUnit}
                onToggleUnit={(unitId) => setOpenUnit((current) => (current === unitId ? null : unitId))}
                progress={progress}
                onToggleComplete={handleComplete}
                onToggleRevision={handleRevision}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;