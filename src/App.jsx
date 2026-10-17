
import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "ecoquest-progress-v1";

const lessons = [
  {
    id: 1,
    title: "Ocean Guardian",
    category: "OCEAN LIFE",
    icon: "🌊",
    description: "Protect our oceans from pollution.",
    xp: 30,
    question: "Which action helps reduce ocean pollution?",
    options: [
      "Throwing plastic into rivers",
      "Using reusable bags and bottles",
      "Leaving waste on beaches",
      "Pouring chemicals into drains",
    ],
    correct: 1,
    explanation:
      "Reusable products reduce single-use plastic waste that can reach our oceans.",
  },
  {
    id: 2,
    title: "Waste Wizard",
    category: "WASTE MANAGEMENT",
    icon: "♻️",
    description: "Learn how to reduce, reuse and recycle.",
    xp: 40,
    question: "Where should a clean plastic bottle go when recycling is available?",
    options: [
      "Into a recycling bin",
      "Into a lake",
      "Into a food waste bin",
      "On the roadside",
    ],
    correct: 0,
    explanation:
      "Place accepted, clean plastic bottles in the correct recycling bin.",
  },
  {
    id: 3,
    title: "Forest Defender",
    category: "BIODIVERSITY",
    icon: "🌳",
    description: "Discover why forests and wildlife matter.",
    xp: 50,
    question: "Why are trees important for the environment?",
    options: [
      "They increase plastic waste",
      "They remove all water from Earth",
      "They absorb carbon dioxide and provide habitats",
      "They create air pollution",
    ],
    correct: 2,
    explanation:
      "Trees absorb carbon dioxide, support biodiversity and provide habitats for wildlife.",
  },
  {
    id: 4,
    title: "Climate Champion",
    category: "CLIMATE ACTION",
    icon: "🌍",
    description: "Understand climate change and clean energy.",
    xp: 60,
    question: "Which is a renewable energy source?",
    options: [
      "Coal",
      "Diesel",
      "Petrol",
      "Solar energy",
    ],
    correct: 3,
    explanation:
      "Solar energy comes from sunlight and is a renewable energy source.",
  },
  {
    id: 5,
    title: "Eco Hero",
    category: "SUSTAINABLE LIVING",
    icon: "🌱",
    description: "Put your environmental knowledge into action.",
    xp: 100,
    question: "Which habit is best for saving electricity?",
    options: [
      "Leaving every light switched on",
      "Switching off unused lights and appliances",
      "Keeping devices charging all day",
      "Using electricity without need",
    ],
    correct: 1,
    explanation:
      "Switching off unused lights and appliances helps conserve electricity.",
  },
];

const dailyMissions = [
  {
    id: "water",
    title: "Water Saver",
    description: "Save water while brushing your teeth.",
    icon: "💧",
    xp: 20,
  },
  {
    id: "plastic",
    title: "Plastic-Free Hero",
    description: "Avoid a single-use plastic item today.",
    icon: "🛍️",
    xp: 25,
  },
  {
    id: "green",
    title: "Green Steps",
    description: "Choose walking or cycling for a short trip when practical.",
    icon: "🚲",
    xp: 15,
  },
];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      completed: Array.isArray(saved.completed)
        ? saved.completed
        : [],
      xp: Number.isFinite(saved.xp) ? saved.xp : 0,
      coins: Number.isFinite(saved.coins) ? saved.coins : 0,
      missionDone:
        saved.date === getToday() && Array.isArray(saved.missionDone)
          ? saved.missionDone
          : [],
      date: getToday(),
    };
  } catch {
    return {
      completed: [],
      xp: 0,
      coins: 0,
      missionDone: [],
      date: getToday(),
    };
  }
}

export default function App() {
  const [progressData, setProgressData] = useState(loadProgress);
  const [page, setPage] = useState("Adventure");
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [finished, setFinished] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [notice, setNotice] = useState("");

  const { completed, xp, coins, missionDone } = progressData;

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...progressData,
          date: getToday(),
        })
      );
    } catch {
      // The app can still be used if browser storage is unavailable.
    }
  }, [progressData]);

  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) || null;

  const activeMission =
    dailyMissions.find((mission) => mission.id === activeMissionId) || null;

  const unlockedCount = Math.min(completed.length + 1, lessons.length);
  const journeyProgress = Math.round(
    (completed.length / lessons.length) * 100
  );

  function showNotice(message) {
    setNotice(message);
  }

  function openLesson(lesson) {
    if (completed.includes(lesson.id)) {
      showNotice("You have already completed this lesson. Great work!");
      return;
    }

    if (lesson.id > unlockedCount) {
      showNotice("Complete the previous lesson to unlock this adventure.");
      return;
    }

    setActiveLessonId(lesson.id);
    setAnswer(null);
    setFinished(false);
    setPage("Adventure");
    setNotice("");
  }

  function closeLesson() {
    setActiveLessonId(null);
    setAnswer(null);
    setFinished(false);
  }

  function chooseAnswer(index) {
    if (answer === activeLesson?.correct) {
      return;
    }

    setAnswer(index);
  }

  function finishLesson() {
    if (!activeLesson || answer !== activeLesson.correct || finished) {
      return;
    }

    setProgressData((old) => {
      if (old.completed.includes(activeLesson.id)) {
        return old;
      }

      return {
        ...old,
        completed: [...old.completed, activeLesson.id],
        xp: old.xp + activeLesson.xp,
        coins: old.coins + 10,
      };
    });

    setFinished(true);
    showNotice(`Mission complete! You earned ${activeLesson.xp} XP and 10 coins.`);
  }

  function completeDailyMission(mission) {
    if (missionDone.includes(mission.id)) {
      return;
    }

    setProgressData((old) => {
      if (old.missionDone.includes(mission.id)) {
        return old;
      }

      return {
        ...old,
        missionDone: [...old.missionDone, mission.id],
        xp: old.xp + mission.xp,
        coins: old.coins + 5,
        date: getToday(),
      };
    });

    setActiveMissionId(null);
    showNotice(`Daily mission complete! You earned ${mission.xp} XP and 5 coins.`);
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Reset all EcoQuest progress, XP, coins and completed missions?"
    );

    if (!confirmed) {
      return;
    }

    const cleanProgress = {
      completed: [],
      xp: 0,
      coins: 0,
      missionDone: [],
      date: getToday(),
    };

    setProgressData(cleanProgress);
    setActiveLessonId(null);
    setActiveMissionId(null);
    setAnswer(null);
    setFinished(false);
    setNotice("Your EcoQuest progress has been reset.");
  }

  function renderAdventure() {
    return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR PLANET NEEDS YOU</span>
            <h1>Small actions.<br />Big impact.</h1>
            <p>
              Learn about our planet, complete eco missions, and become
              an environmental hero.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                const nextLesson = lessons.find(
                  (lesson) =>
                    !completed.includes(lesson.id) &&
                    lesson.id <= unlockedCount
                );

                if (nextLesson) {
                  openLesson(nextLesson);
                } else {
                  showNotice("Amazing! You have completed every lesson.");
                }
              }}
            >
              {completed.length === lessons.length
                ? "ALL LESSONS COMPLETED ✓"
                : "CONTINUE ADVENTURE →"}
            </button>
          </div>

          <div className="hero-art" aria-label="Planet Earth illustration">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="planet">🌎</div>
            <span className="floating-leaf">🍃</span>
            <span className="floating-star">✦</span>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard icon="⚡" label="TOTAL XP" value={xp} />
          <StatCard icon="🪙" label="LEAF COINS" value={coins} />
          <StatCard
            icon="🏆"
            label="LESSONS DONE"
            value={`${completed.length}/${lessons.length}`}
          />
          <StatCard icon="🌿" label="JOURNEY" value={`${journeyProgress}%`} />
        </section>

        <section className="section-heading">
          <div>
            <span className="eyebrow">LEVEL UP YOUR KNOWLEDGE</span>
            <h2>Your Adventures</h2>
            <p>Complete each lesson to unlock your next challenge.</p>
          </div>
          <span className="progress-label">{journeyProgress}% complete</span>
        </section>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${journeyProgress}%` }}
          />
        </div>

        <section className="lesson-grid">
          {lessons.map((lesson) => {
            const isDone = completed.includes(lesson.id);
            const isLocked = lesson.id > unlockedCount;

            return (
              <article
                className={`lesson-card ${isLocked ? "locked" : ""}`}
                key={lesson.id}
              >
                <div className="lesson-card-top">
                  <span className="lesson-icon">{lesson.icon}</span>
                  <span className={`status-pill ${isDone ? "done" : ""}`}>
                    {isDone ? "✓ COMPLETED" : isLocked ? "🔒 LOCKED" : "● AVAILABLE"}
                  </span>
                </div>
                <span className="lesson-category">{lesson.category}</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className="lesson-card-footer">
                  <span>⚡ {lesson.xp} XP</span>
                  <button
                    className="text-button"
                    disabled={isLocked || isDone}
                    onClick={() => openLesson(lesson)}
                  >
                    {isDone ? "DONE ✓" : isLocked ? "LOCKED" : "START →"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </>
    );
  }

  function renderMissions() {
    const completedMissionsToday = missionDone.length;

    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">YOUR DAILY ECO CHALLENGE</span>
          <h1>Daily Missions 🎯</h1>
          <p>
            Small real-world actions can make a meaningful difference.
            Complete a mission after you have done the activity.
          </p>
          <div className="mission-summary">
            <strong>{completedMissionsToday}/{dailyMissions.length}</strong>
            <span>missions completed today</span>
          </div>
        </section>

        <section className="mission-list">
          {dailyMissions.map((mission) => {
            const done = missionDone.includes(mission.id);

            return (
              <article className="mission-card" key={mission.id}>
                <div className="mission-icon">{mission.icon}</div>
                <div className="mission-copy">
                  <h3>{mission.title}</h3>
                  <p>{mission.description}</p>
                  <span className="reward-text">
                    ⚡ {mission.xp} XP &nbsp; · &nbsp; 🪙 5 coins
                  </span>
                </div>
                <button
                  className={done ? "secondary-button" : "primary-button"}
                  disabled={done}
                  onClick={() => setActiveMissionId(mission.id)}
                >
                  {done ? "COMPLETED ✓" : "VIEW MISSION"}
                </button>
              </article>
            );
          })}
        </section>
      </>
    );
  }

  function renderEcoLab() {
    const tips = [
      {
        icon: "💧",
        title: "Save Water",
        text: "Turn off the tap while brushing and fix leaking taps.",
      },
      {
        icon: "♻️",
        title: "Reduce Waste",
        text: "Reuse items where possible and sort waste correctly.",
      },
      {
        icon: "🌳",
        title: "Protect Nature",
        text: "Care for local plants and respect wildlife habitats.",
      },
      {
        icon: "⚡",
        title: "Save Energy",
        text: "Switch off unused lights and choose efficient appliances.",
      },
      {
        icon: "🛍️",
        title: "Skip Single-Use Plastic",
        text: "Carry a reusable bag or bottle when practical.",
      },
      {
        icon: "🚶",
        title: "Travel Smarter",
        text: "Walk, cycle or use public transport when practical.",
      },
    ];

    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">KNOWLEDGE GROWS HERE</span>
          <h1>Eco Lab 🧪</h1>
          <p>Discover easy ways to make your everyday routine greener.</p>
        </section>

        <section className="tip-grid">
          {tips.map((tip) => (
            <article className="tip-card" key={tip.title}>
              <span className="tip-icon">{tip.icon}</span>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
            </article>
          ))}
        </section>
      </>
    );
  }

  function renderCollection() {
    const badges = [
      {
        icon: "🌊",
        title: "Ocean Protector",
        description: "Complete Ocean Guardian.",
        unlocked: completed.includes(1),
      },
      {
        icon: "♻️",
        title: "Recycling Ranger",
        description: "Complete Waste Wizard.",
        unlocked: completed.includes(2),
      },
      {
        icon: "🌳",
        title: "Forest Friend",
        description: "Complete Forest Defender.",
        unlocked: completed.includes(3),
      },
      {
        icon: "🌍",
        title: "Climate Champion",
        description: "Complete Climate Champion.",
        unlocked: completed.includes(4),
      },
      {
        icon: "🌱",
        title: "Eco Legend",
        description: "Complete Eco Hero.",
        unlocked: completed.includes(5),
      },
    ];

    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">YOUR ACHIEVEMENTS</span>
          <h1>My Collection 🏆</h1>
          <p>Every completed lesson brings you one step closer to becoming an Eco Hero.</p>
        </section>

        <section className="badge-grid">
          {badges.map((badge) => (
            <article
              className={`badge-card ${badge.unlocked ? "badge-unlocked" : "badge-locked"}`}
              key={badge.title}
            >
              <div className="badge-icon">
                {badge.unlocked ? badge.icon : "🔒"}
              </div>
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>
              <span>{badge.unlocked ? "UNLOCKED ✓" : "NOT UNLOCKED"}</span>
            </article>
          ))}
        </section>
      </>
    );
  }

  function renderImpact() {
    const missionXp = dailyMissions.reduce(
      (total, mission) =>
        total + (missionDone.includes(mission.id) ? mission.xp : 0),
      0
    );

    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">LOOK HOW FAR YOU HAVE COME</span>
          <h1>My Impact 🌍</h1>
          <p>Your learning journey and eco achievements in one place.</p>
        </section>

        <section className="impact-panel">
          <div className="impact-planet">🌎</div>
          <h2>{journeyProgress === 100 ? "You're an Eco Legend!" : "Every Step Counts!"}</h2>
          <p>
            {completed.length} of {lessons.length} lessons completed.
            Keep learning and taking positive environmental actions.
          </p>
          <div className="progress-track impact-progress">
            <div
              className="progress-fill"
              style={{ width: `${journeyProgress}%` }}
            />
          </div>
          <strong>{journeyProgress}% journey complete</strong>
        </section>

        <section className="stats-grid impact-stats">
          <StatCard icon="⚡" label="TOTAL XP" value={xp} />
          <StatCard icon="🪙" label="LEAF COINS" value={coins} />
          <StatCard icon="📚" label="LESSONS DONE" value={completed.length} />
          <StatCard icon="🎯" label="MISSIONS TODAY" value={missionDone.length} />
        </section>

        <section className="impact-note">
          <h3>🌱 Your learning matters</h3>
          <p>
            You earned {missionXp} XP from today's completed daily missions.
            Remember: rewards track your progress in this app; they do not
            measure actual carbon savings.
          </p>
        </section>

        <button className="secondary-button reset-button" onClick={resetProgress}>
          RESET MY PROGRESS
        </button>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🌿</div>
          <div>
            <h2>EcoQuest</h2>
            <span>LEARN · PLAY · PROTECT</span>
          </div>
        </div>

        <div className="profile-card">
          <div className="avatar">🌱</div>
          <div className="profile-copy">
            <strong>Eco Explorer</strong>
            <span>Planet Protector</span>
          </div>
          <span className="profile-level">LVL {Math.floor(xp / 100) + 1}</span>
        </div>

        <span className="nav-heading">YOUR JOURNEY</span>
        <nav className="navigation">
          {[
            { label: "Adventure", icon: "🧭" },
            { label: "Missions", icon: "🎯" },
            { label: "Eco Lab", icon: "🧪" },
            { label: "Collection", icon: "🏆" },
            { label: "My Impact", icon: "🌍" },
          ].map((item) => (
            <button
              key={item.label}
              className={`nav-item ${page === item.label ? "nav-active" : ""}`}
              onClick={() => {
                setPage(item.label);
                closeLesson();
                setActiveMissionId(null);
                setNotice("");
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.label === "Missions" && missionDone.length > 0 && (
                <span className="nav-count">{missionDone.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-leaf">🍃</div>
          <strong>Be kind to Earth.</strong>
          <p>Every small action helps create a greener tomorrow.</p>
          <div className="sidebar-progress">
            <span>YOUR PROGRESS</span>
            <strong>{journeyProgress}%</strong>
          </div>
          <div className="mini-progress-track">
            <div style={{ width: `${journeyProgress}%` }} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>EcoQuest</span>
            <span>/</span>
            <strong>{activeLesson ? activeLesson.title : page}</strong>
          </div>
          <div className="topbar-right">
            <span className="streak-pill">🔥 {completed.length} lessons</span>
            <span className="coin-pill">🪙 {coins}</span>
            <div className="top-avatar">🌱</div>
          </div>
        </header>

        <div className="content-area">
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}

          {activeLesson ? (
            <section className="quiz-panel">
              <button className="back-button" onClick={closeLesson}>
                ← Back to Adventures
              </button>

              {finished ? (
                <div className="quiz-result">
                  <div className="result-icon">🎉</div>
                  <span className="eyebrow">MISSION COMPLETED</span>
                  <h1>Wonderful work, Eco Hero!</h1>
                  <p>
                    You completed {activeLesson.title} and earned{" "}
                    {activeLesson.xp} XP plus 10 Leaf Coins.
                  </p>
                  <div className="result-rewards">
                    <span>⚡ +{activeLesson.xp} XP</span>
                    <span>🪙 +10 coins</span>
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => {
                      const next = lessons.find(
                        (lesson) =>
                          !completed.includes(lesson.id) &&
                          lesson.id <= unlockedCount
                      );

                      closeLesson();

                      if (next) {
                        openLesson(next);
                      } else {
                        setPage("Adventure");
                      }
                    }}
                  >
                    CONTINUE JOURNEY →
                  </button>
                </div>
              ) : (
                <>
                  <div className="quiz-hero-icon">{activeLesson.icon}</div>
                  <span className="eyebrow">{activeLesson.category}</span>
                  <h1>{activeLesson.title}</h1>
                  <p className="quiz-description">{activeLesson.description}</p>

                  <div className="quiz-reward-line">
                    <span>⚡ Reward: {activeLesson.xp} XP</span>
                    <span>🪙 +10 Leaf Coins</span>
                  </div>

                  <div className="question-card">
                    <span className="question-number">KNOWLEDGE CHECK</span>
                    <h2>{activeLesson.question}</h2>
                    <div className="answer-list">
                      {activeLesson.options.map((option, index) => {
                        const isSelected = answer === index;
                        const isCorrect = index === activeLesson.correct;
                        let className = "answer-option";

                        if (answer !== null && isSelected && isCorrect) {
                          className += " answer-correct";
                        } else if (
                          answer !== null &&
                          isSelected &&
                          !isCorrect
                        ) {
                          className += " answer-wrong";
                        }

                        return (
                          <button
                            key={option}
                            className={className}
                            disabled={answer === activeLesson.correct}
                            onClick={() => chooseAnswer(index)}
                          >
                            <span className="answer-letter">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span>{option}</span>
                            {answer !== null && isSelected && (
                              <span className="answer-indicator">
                                {isCorrect ? "✓" : "✕"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {answer !== null && (
                      <div
                        className={`answer-feedback ${
                          answer === activeLesson.correct ? "feedback-correct" : "feedback-wrong"
                        }`}
                      >
                        <strong>
                          {answer === activeLesson.correct
                            ? "Correct! 🎉"
                            : "Not quite. Try again!"}
                        </strong>
                        {answer === activeLesson.correct && (
                          <p>{activeLesson.explanation}</p>
                        )}
                      </div>
                    )}

                    <button
                      className="primary-button complete-button"
                      disabled={answer !== activeLesson.correct}
                      onClick={finishLesson}
                    >
                      COMPLETE MISSION ✓
                    </button>
                    <p className="reward-hint">
                      Your XP and coins are awarded once, after completing the mission.
                    </p>
                  </div>
                </>
              )}
            </section>
          ) : (
            <>
              {page === "Adventure" && renderAdventure()}
              {page === "Missions" && renderMissions()}
              {page === "Eco Lab" && renderEcoLab()}
              {page === "Collection" && renderCollection()}
              {page === "My Impact" && renderImpact()}
            </>
          )}
        </div>

        <footer className="app-footer">
          <span>🌿 EcoQuest · Learn today, protect tomorrow.</span>
          <span>One planet. One mission at a time.</span>
        </footer>
      </main>

      {activeMission && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveMissionId(null)}
          role="presentation"
        >
          <section
            className="mission-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setActiveMissionId(null)}
              aria-label="Close mission"
            >
              ×
            </button>
            <div className="modal-icon">{activeMission.icon}</div>
            <span className="eyebrow">DAILY ECO CHALLENGE</span>
            <h2 id="mission-modal-title">{activeMission.title}</h2>
            <p>{activeMission.description}</p>
            <div className="modal-reward">
              <span>⚡ {activeMission.xp} XP</span>
              <span>🪙 5 Leaf Coins</span>
            </div>
            <p className="modal-reminder">
              Complete the real-world activity first, then mark this mission as done.
            </p>
            <button
              className="primary-button modal-complete-button"
              disabled={missionDone.includes(activeMission.id)}
              onClick={() => completeDailyMission(activeMission)}
            >
              MARK AS COMPLETED ✓
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
