import { signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import syllabusData from "../data/syllabusData";

import MetricCard from "../components/dashboard/MetricCard";
import SubjectTabs from "../components/dashboard/SubjectTabs";
import UnitCard from "../components/dashboard/UnitCard";

import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";

import {
  getAllTopicProgress,
  saveTopicProgress,
} from "../services/firestoreService";

import "./Dashboard.css";


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();


  /* =======================================================
     STATE
  ======================================================= */

  const [progress, setProgress] = useState({});

  const [selectedSubject, setSelectedSubject] =
    useState("physics");

  const [classFilter, setClassFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [openUnit, setOpenUnit] =
    useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.localStorage.getItem(
        "neet-dashboard-dark"
      ) === "true"
    );
  });


  /* =======================================================
     CURRENT SUBJECT
  ======================================================= */

  const currentSubject =
    syllabusData[selectedSubject];


  /* =======================================================
     FILTER TOPICS
     ======================================================= */

  const filterTopics = (subjectId, unit) => {
    let topics = [...unit.topics];

    /* -------------------------------------------------------
       CLASS FILTER

       IMPORTANT:
       Class is determined topic-by-topic from syllabusData.
       This allows one unit to contain Class 11 and Class 12
       topics at the same time.
    ------------------------------------------------------- */

    if (classFilter !== "all") {
      topics = topics.filter((topic) =>
        Array.isArray(topic.classLevels) &&
        topic.classLevels.includes(classFilter)
      );
    }

    /* -------------------------------------------------------
       SEARCH FILTER
    ------------------------------------------------------- */

    const search =
      searchTerm.trim().toLowerCase();

    if (search) {
      topics = topics.filter((topic) =>
        topic.name
          .toLowerCase()
          .includes(search)
      );
    }

    return topics;
  };


  /* =======================================================
     SEARCH RESULTS
     
     Search across all subjects.
  ======================================================= */

  const searchResults = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();


    if (!search) {
      return null;
    }


    return Object.entries(
      syllabusData
    )
      .map(
        ([subjectId, subject]) => {

          const matchedUnits =
            subject.units
              .map((unit) => {

                const unitMatches =
                  unit.name
                    .toLowerCase()
                    .includes(search);


                let topics;


                /*
                 * If unit name matches,
                 * show all topics from that unit
                 * after class filtering.
                 */
                if (unitMatches) {

                  topics = filterTopics(
                    subjectId,
                    {
                      ...unit,
                      topics: [
                        ...unit.topics,
                      ],
                    }
                  );

                } else {

                  topics =
                    filterTopics(
                      subjectId,
                      unit
                    );

                }


                if (
                  topics.length === 0
                ) {
                  return null;
                }


                return {
                  ...unit,
                  topics,
                };

              })
              .filter(Boolean);


          if (
            matchedUnits.length === 0
          ) {
            return null;
          }


          return {
            subjectId,
            subjectName:
              subject.name,
            units:
              matchedUnits,
          };
        }
      )
      .filter(Boolean);

  }, [
    searchTerm,
    classFilter,
  ]);


  /* =======================================================
     NORMAL FILTERED UNITS
  ======================================================= */

  const filteredUnits =
    useMemo(() => {

      if (searchResults) {
        return null;
      }


      return currentSubject.units
        .map((unit) => {

          const topics =
            filterTopics(
              selectedSubject,
              unit
            );


          if (
            topics.length === 0
          ) {
            return null;
          }


          return {
            ...unit,
            topics,
          };

        })
        .filter(Boolean);

    }, [
      currentSubject,
      selectedSubject,
      classFilter,
      searchTerm,
      searchResults,
    ]);


  /* =======================================================
     DISPLAY GROUPS
  ======================================================= */

  const displayGroups =
    searchResults || [
      {
        subjectId:
          selectedSubject,

        subjectName:
          currentSubject.name,

        units:
          filteredUnits,
      },
    ];


  /* =======================================================
     ALL DISPLAYED TOPICS
  ======================================================= */

  const allTopics =
    useMemo(
      () =>
        displayGroups.flatMap(
          (group) =>
            group.units.flatMap(
              (unit) =>
                unit.topics
            )
        ),
      [displayGroups]
    );


  /* =======================================================
     PROGRESS COUNTS
  ======================================================= */

  const totalTopics =
    allTopics.length;


  const completedTopics =
    allTopics.filter(
      (topic) =>
        progress[topic.id]
          ?.completed === true
    ).length;


  const revisionTopics =
    allTopics.filter(
      (topic) =>
        progress[topic.id]
          ?.revision === true
    ).length;


  const remainingTopics =
    totalTopics -
    completedTopics;


  const progressPercentage =
    totalTopics === 0
      ? 0
      : Math.round(
          (completedTopics /
            totalTopics) *
            100
        );


  const completedPercentage =
    totalTopics === 0
      ? 0
      : (completedTopics /
          totalTopics) *
        100;


  const revisionPercentage =
    totalTopics === 0
      ? 0
      : (revisionTopics /
          totalTopics) *
        100;


  const remainingPercentage =
    totalTopics === 0
      ? 0
      : (remainingTopics /
          totalTopics) *
        100;


  /* =======================================================
     UNIT PROGRESS
  ======================================================= */

  const getUnitProgress =
    (unit) => {

      const total =
        unit.topics.length;


      const completed =
        unit.topics.filter(
          (topic) =>
            progress[topic.id]
              ?.completed === true
        ).length;


      const percentage =
        total === 0
          ? 0
          : Math.round(
              (completed /
                total) *
                100
            );


      return {
        total,
        completed,
        percentage,
      };
    };


  /* =======================================================
     LOAD FIRESTORE PROGRESS
  ======================================================= */

  useEffect(() => {

    const loadProgress =
      async () => {

        if (!currentUser) {
          return;
        }


        try {

          const savedProgress =
            await getAllTopicProgress(
              currentUser.uid
            );


          setProgress(
            savedProgress
          );

        } catch (error) {

          console.error(
            "Error loading progress:",
            error
          );

        }
      };


    loadProgress();

  }, [currentUser]);


  /* =======================================================
     DARK MODE
  ======================================================= */

  useEffect(() => {

    window.localStorage.setItem(
      "neet-dashboard-dark",
      darkMode
        ? "true"
        : "false"
    );

  }, [darkMode]);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    async () => {

      try {

        await signOut(auth);

        navigate("/login");

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }
    };


  /* =======================================================
     TOPIC UPDATE
  ======================================================= */

  const handleTopicUpdate =
    async (
      topicId,
      completed,
      revision
    ) => {

      if (!currentUser) {
        return;
      }


      try {

        await saveTopicProgress(
          currentUser.uid,
          topicId,
          completed,
          revision
        );


        setProgress(
          (previousProgress) => ({
            ...previousProgress,

            [topicId]: {
              completed,
              revision,
            },
          })
        );

      } catch (error) {

        console.error(
          "Progress update error:",
          error
        );


        alert(
          `Firestore Error: ${error.code} - ${error.message}`
        );

      }
    };


  /* =======================================================
     COMPLETE / UNCOMPLETE
  ======================================================= */

  const handleComplete =
    async (topicId) => {

      const currentProgress =
        progress[topicId] || {
          completed: false,
          revision: false,
        };


      await handleTopicUpdate(
        topicId,

        /*
         * Toggle completed
         */
        !currentProgress.completed,

        /*
         * Keep revision unchanged
         */
        currentProgress.revision
      );
    };


  /* =======================================================
     REVISION TOGGLE
  ======================================================= */

  const handleRevision =
    async (topicId) => {

      const currentProgress =
        progress[topicId] || {
          completed: false,
          revision: false,
        };


      await handleTopicUpdate(
        topicId,

        /*
         * Keep completed unchanged
         */
        currentProgress.completed,

        /*
         * Toggle revision
         */
        !currentProgress.revision
      );
    };


  /* =======================================================
     USER DISPLAY
  ======================================================= */

  const displayName =
    currentUser?.displayName ||
    currentUser?.email
      ?.split("@")[0] ||
    "Student";

  // const SPECIAL_USER_EMAIL = "vishwakarmaniva@gmail.com";
  // const SPECIAL_USER_EMAIL = "nandinivish01@gmail.com"
  
  const SPECIAL_USER_EMAIL = "rudrabaghel68@gmail.com";

  const isSpecialUser =
    currentUser?.email?.toLowerCase() ===
    SPECIAL_USER_EMAIL.toLowerCase();


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div
      className={`dashboard ${
        darkMode
          ? "dark"
          : ""
      }`}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div className="dashboard-title">

          <div className="dashboard-brand">

            <span className="brand-icon">
              📚
            </span>


            <div>

              <p className="eyebrow">
                NEET Syllabus Tracker
              </p>

              <h1>
                Study Progress
              </h1>

            </div>

          </div>


          {/* USER */}

          <div className="dashboard-userbox">
            <p className="dashboard-user">
              {displayName}
            </p>
          </div>


          {/* SEARCH */}

          <div className="search-controls">

            <input
              type="search"
              className="search-input"
              placeholder="Search chapters or topics..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              aria-label="Search chapters or topics"
            />

          </div>

        </div>


        {/* HEADER ACTIONS */}

        <div className="header-actions">

          <button
            type="button"
            className="theme-toggle"
            onClick={() =>
              setDarkMode(
                (current) =>
                  !current
              )
            }
            aria-pressed={
              darkMode
            }
          >
            {darkMode
              ? "☀️"
              : "🌙"}
          </button>


          <button
            type="button"
            className="logout-btn"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </div>


      {/* =================================================
          PROGRESS SECTION
      ================================================= */}

      <section className="progress-section">

        <div className="progress-card">

          {/* PROGRESS HEADING */}

          <div className="progress-card-heading compact">

            <div>

              <p className="eyebrow">
                CURRENT SUBJECT
              </p>

              <h2>
                {currentSubject.name}
              </h2>

            </div>


            <div className="progress-summary-box">

              <p className="progress-summary">
                {completedTopics}
                /
                {totalTopics}
                {" "}
                topics done
              </p>


              <span className="progress-badge">
                {progressPercentage}%
              </span>

            </div>

          </div>


          {/* =================================================
              CLASS FILTER
          ================================================= */}

          <div className="filters-row">

            <div className="filter-pill-row">

              {[
                {
                  id: "all",
                  label: "All",
                },

                {
                  id: "11",
                  label: "Class 11",
                },

                {
                  id: "12",
                  label: "Class 12",
                },

              ].map(
                (filter) => (

                  <button
                    key={
                      filter.id
                    }
                    type="button"
                    className={`filter-pill ${
                      classFilter ===
                      filter.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {

                      setClassFilter(
                        filter.id
                      );

                      setOpenUnit(
                        null
                      );

                    }}
                  >
                    {filter.label}
                  </button>

                )
              )}

            </div>

          </div>


          {/* =================================================
              METRIC CARDS
          ================================================= */}

          <div className="progress-stats mobile-grid">

            <MetricCard
              label="Total"
              value={
                totalTopics
              }
              tone="water-total"
              level={100}
            />


            <MetricCard
              label="Done"
              value={
                completedTopics
              }
              tone="water-completed"
              level={
                completedPercentage
              }
            />


            <MetricCard
              label="Revision"
              value={
                revisionTopics
              }
              tone="water-revision"
              level={
                revisionPercentage
              }
            />


            <MetricCard
              label="Left"
              value={
                remainingTopics
              }
              tone="water-remaining"
              level={
                remainingPercentage
              }
            />

          </div>


          {/* =================================================
              OVERALL PROGRESS
          ================================================= */}

          <div className="progress-bar-container slim">

            <div className="progress-info">

              <span>
                Overall completion
              </span>

              <span>
                {progressPercentage}%
              </span>

            </div>


            <div className="progress-bar">

              <div
                className="progress-bar-fill"
                style={{
                  width:
                    `${progressPercentage}%`,
                }}
              />

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          SUBJECT SECTION
      ================================================= */}

      {isSpecialUser && (
        <section className="special-member-banner-section">
          <button
            type="button"
            className="special-member-banner"
            onClick={() => navigate("/special-member")}
            aria-label="Open Special Member page"
          >
            <span className="special-member-banner-icon">✨</span>
            <span className="special-member-banner-text">
              <strong>Special Member</strong>
              <small>Exclusive features are waiting for you</small>
            </span>
            <span className="special-member-banner-arrow">→</span>
          </button>
        </section>
      )}

      <section className="subject-section">

        <SubjectTabs
          subjects={
            syllabusData
          }

          selectedSubject={
            selectedSubject
          }

          onSelect={(
            subjectId
          ) => {

            setSelectedSubject(
              subjectId
            );

            setOpenUnit(
              null
            );

            setSearchTerm("");

          }}
        />


        {/* =================================================
            SUBJECT PANEL
        ================================================= */}

        <div className="subject-panel">

          <div className="subject-panel-heading">

            <h2>
              {currentSubject.name}
            </h2>


            <p>
              {totalTopics} topics
              {" · "}
              {progressPercentage}%
              {" "}
              complete
            </p>

          </div>


          {/* =================================================
              NO RESULTS
          ================================================= */}

          {displayGroups.length === 0 ||
          displayGroups.every(
            (group) =>
              group.units.length ===
              0
          ) ? (

            <div className="empty-results">

              <p>
                No matching chapters or
                topics were found.
              </p>

            </div>

          ) : (

            /* =================================================
               DISPLAY GROUPS
            ================================================= */

            displayGroups.map(
              (group) => (

                <div
                  key={
                    group.subjectId
                  }
                  className="search-group"
                >

                  {/* SEARCH SUBJECT HEADING */}

                  {searchResults &&
                  group.subjectId !==
                    selectedSubject && (

                    <div className="search-group-heading">

                      <h3>
                        {
                          group.subjectName
                        }
                      </h3>

                    </div>

                  )}


                  {/* =================================================
                     UNITS
                  ================================================= */}

                  {group.units.map(
                    (unit) => {

                      const unitProgress =
                        getUnitProgress(
                          unit
                        );


                      return (

                        <UnitCard
                          key={
                            unit.id
                          }

                          unit={
                            unit
                          }

                          unitProgress={
                            unitProgress
                          }

                          openUnit={
                            openUnit
                          }

                          onToggleUnit={(
                            unitId
                          ) =>
                            setOpenUnit(
                              (
                                current
                              ) =>
                                current ===
                                unitId
                                  ? null
                                  : unitId
                            )
                          }

                          progress={
                            progress
                          }

                          onToggleComplete={
                            handleComplete
                          }

                          onToggleRevision={
                            handleRevision
                          }
                        />

                      );

                    }
                  )}

                </div>

              )
            )

          )}

        </div>

      </section>

    </div>
  );
}


export default Dashboard;