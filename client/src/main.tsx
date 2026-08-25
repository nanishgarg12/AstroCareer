import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./styles.css";


const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const unwrap = (response: any) => response.data.data;


function Layout({ children }: { children: any }) {
  const token = localStorage.getItem("token");

  return (
    <>
      <nav>
        <Link to="/">✦ AstroCareer</Link>

        <Link to="/profile">Profile</Link>
        <Link to="/resume">Resume</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/assessment">Assessment</Link>
        <Link to="/interview">Interview</Link>
        <Link to="/simulator">Simulator</Link>
        <Link to="/roadmap">Roadmap</Link>
        <Link to="/stars-vs-skills">Stars vs Skills</Link>

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        )}
      </nav>

      <main>{children}</main>
    </>
  );
}


function Card({
  title,
  value,
  text,
}: {
  title: string;
  value?: string;
  text?: string;
}) {
  return (
    <article className="card">
      <p className="eyebrow">{title}</p>
      <h2>{value}</h2>
      <p>{text}</p>
    </article>
  );
}


function Home() {
  const [readiness, setReadiness] = useState<any>();
  const [astro, setAstro] = useState<any>();

  useEffect(() => {
    api
      .get("/readiness")
      .then(unwrap)
      .then(setReadiness)
      .catch(() => {});

    api
      .get("/astrology")
      .then(unwrap)
      .then(setAstro)
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">
          COSMIC CLARITY · PRACTICAL ACTION
        </p>

        <h1>Build what comes next.</h1>

        <p>
          Know what the stars say. Discover what your skills say.
        </p>

        <Link className="button" to="/register">
          Begin your path
        </Link>
      </section>

      <div className="grid">
        <Card
          title="Today's zodiac"
          value={astro?.zodiac || "Complete your profile"}
          text={astro?.daily}
        />

        <Card
          title="Job readiness"
          value={
            readiness ? `${readiness.score}/100` : "—"
          }
          text={
            readiness?.level ||
            "Data-driven, not a hiring prediction."
          }
        />

        <Card
          title="Next action"
          value="Practice deliberately"
          text="Choose a career and take an assessment."
        />
      </div>
    </Layout>
  );
}


function Auth({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const go = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    try {
      const result = await api.post(
        `/auth/${register ? "register" : "login"}`,
        Object.fromEntries(form)
      );

      const data = unwrap(result);

      localStorage.setItem("token", data.token);

      // After registration/login go to profile
      navigate("/profile");
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.error?.message ||
          "Unable to continue"
      );
    }
  };

  return (
    <Layout>
      <form className="form" onSubmit={go}>
        <h1>
          {register ? "Create account" : "Welcome back"}
        </h1>

        {register && (
          <input
            name="name"
            placeholder="Name"
            required
          />
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password (8+ characters)"
          required
        />

        <button type="submit">
          {register ? "Register" : "Login"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </Layout>
  );
}


function Profile() {
  const navigate = useNavigate();

  const [p, setP] = useState<any>({
    interests: [],
    skills: [],
    languages: [],
    preferredCareers: [],
    projects: 0,
    experience: 0,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load existing profile
  useEffect(() => {
    api
      .get("/profile")
      .then(unwrap)
      .then((data: any) => {
        if (data) {
          setP({
            ...data,
            interests: data.interests || [],
            skills: data.skills || [],
            languages: data.languages || [],
            preferredCareers:
              data.preferredCareers || [],
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load profile");
      });
  }, []);

  // Save profile
  const save = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const profileData = {
        ...p,

        interests: String(p.interests)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),

        skills: String(p.skills)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),

        languages: String(p.languages)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),

        preferredCareers: String(p.preferredCareers)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),
      };

      const result = await api.put(
        "/profile",
        profileData
      );

      console.log("Profile saved:", result.data);

      setMessage(
        "Profile saved successfully! 🎉"
      );

      // Go to astrology after saving
      setTimeout(() => {
        navigate("/astrology");
      }, 1000);
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.error?.message ||
          "Unable to save profile"
      );
    }
  };

  return (
    <Layout>
      <form
        className="form wide"
        onSubmit={save}
      >
        <h1>Your Student Profile</h1>

        <label>
          Date of Birth
          <input
            type="date"
            value={p.dateOfBirth || ""}
            onChange={(e) =>
              setP({
                ...p,
                dateOfBirth: e.target.value,
              })
            }
          />
        </label>

        <label>
          Birth Time
          <input
            type="text"
            placeholder="10:30 AM"
            value={p.birthTime || ""}
            onChange={(e) =>
              setP({
                ...p,
                birthTime: e.target.value,
              })
            }
          />
        </label>

        <label>
          Birth Place
          <input
            type="text"
            placeholder="Shimla"
            value={p.birthPlace || ""}
            onChange={(e) =>
              setP({
                ...p,
                birthPlace: e.target.value,
              })
            }
          />
        </label>

        <label>
          College
          <input
            type="text"
            value={p.college || ""}
            onChange={(e) =>
              setP({
                ...p,
                college: e.target.value,
              })
            }
          />
        </label>

        <label>
          Course
          <input
            type="text"
            placeholder="B.Tech"
            value={p.course || ""}
            onChange={(e) =>
              setP({
                ...p,
                course: e.target.value,
              })
            }
          />
        </label>

        <label>
          Specialization
          <input
            type="text"
            placeholder="Computer Science"
            value={p.specialization || ""}
            onChange={(e) =>
              setP({
                ...p,
                specialization: e.target.value,
              })
            }
          />
        </label>

        <label>
          Semester
          <input
            type="text"
            placeholder="5"
            value={p.semester || ""}
            onChange={(e) =>
              setP({
                ...p,
                semester: e.target.value,
              })
            }
          />
        </label>

        <label>
          Interests
          <input
            type="text"
            placeholder="Coding, AI, Web Development"
            value={
              Array.isArray(p.interests)
                ? p.interests.join(", ")
                : p.interests || ""
            }
            onChange={(e) =>
              setP({
                ...p,
                interests: e.target.value,
              })
            }
          />
        </label>

        <label>
          Skills
          <input
            type="text"
            placeholder="Java, DSA, SQL"
            value={
              Array.isArray(p.skills)
                ? p.skills.join(", ")
                : p.skills || ""
            }
            onChange={(e) =>
              setP({
                ...p,
                skills: e.target.value,
              })
            }
          />
        </label>

        <label>
          Programming Languages
          <input
            type="text"
            placeholder="Java, Python, JavaScript"
            value={
              Array.isArray(p.languages)
                ? p.languages.join(", ")
                : p.languages || ""
            }
            onChange={(e) =>
              setP({
                ...p,
                languages: e.target.value,
              })
            }
          />
        </label>

        <label>
          Projects
          <input
            type="number"
            min="0"
            value={p.projects || 0}
            onChange={(e) =>
              setP({
                ...p,
                projects: Number(e.target.value),
              })
            }
          />
        </label>

        <label>
          Experience
          <input
            type="number"
            min="0"
            value={p.experience || 0}
            onChange={(e) =>
              setP({
                ...p,
                experience: Number(e.target.value),
              })
            }
          />
        </label>

        <button type="submit">
          Save Profile & Continue →
        </button>

        {message && (
          <p style={{ color: "#7cffb2" }}>
            {message}
          </p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}
      </form>
    </Layout>
  );
}


function Astrology() {
  const [a, setA] = useState<any>();
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/astrology")
      .then(unwrap)
      .then(setA)
      .catch((err) => {
        console.error(err);

        setError(
          err.response?.data?.error?.message ||
            "Unable to load astrology information"
        );
      });
  }, []);

  return (
    <Layout>
      <h1>Astrology Dashboard 🔮</h1>

      {error && (
        <p className="error">{error}</p>
      )}

      {a && (
        <>
          <div className="grid">
            <Card
              title="Your Zodiac"
              value={a.zodiac}
              text="Based on your birth information."
            />

            <Card
              title="Today's Horoscope"
              value="Daily Guidance"
              text={a.daily}
            />

            <Card
              title="Monthly Horoscope"
              value="This Month"
              text={a.monthly}
            />
          </div>

          <article className="card">
            <p className="eyebrow">
              PERSONALITY INSIGHT
            </p>

            <h2>{a.zodiac}</h2>

            <p>{a.personality}</p>

            <p className="eyebrow">
              ⚠️ {a.disclaimer}
            </p>
          </article>

          <button
            onClick={() => navigate("/careers")}
          >
            Explore Careers →
          </button>
        </>
      )}
    </Layout>
  );
}


function Careers() {
  const [careers, setCareers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/careers")
      .then(unwrap)
      .then(setCareers)
      .catch((err) => {
        console.error("Unable to load careers:", err);
      });

    api
      .get("/recommendations")
      .then(unwrap)
      .then(setMatches)
      .catch(() => {});
  }, []);

  const createRoadmap = async (careerName: string) => {
    try {
      await api.post(
        `/roadmap/${encodeURIComponent(careerName)}`
      );

      window.location.href =
        `/roadmap?career=${encodeURIComponent(careerName)}`;

    } catch (error) {
      console.error(error);
      alert("Unable to generate roadmap");
    }
  };

  return (
    <Layout>
      <h1>Career Explorer</h1>

      <div className="grid">
        {careers.map((career) => (
          <article
            className="card"
            key={career._id}
          >
            <h2>{career.name}</h2>

            <p>{career.description}</p>

            <p className="tags">
              {career.requiredSkills?.join(" · ")}
            </p>

            <button
              onClick={() =>
                createRoadmap(career.name)
              }
            >
              Create Roadmap →
            </button>
          </article>
        ))}
      </div>

      {matches.length > 0 && (
        <section>
          <h2>Your Ranked Directions</h2>

          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <BarChart
              data={matches.slice(0, 6)}
            >
              <XAxis
                dataKey="career"
                hide
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="score"
                fill="#9b7bff"
                radius={8}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </Layout>
  );
}


function Assessment() {
  const [career, setCareer] =
    useState("Software Developer");

  const [questions, setQuestions] =
    useState<any[]>([]);

  const [answers, setAnswers] =
    useState<number[]>([]);

  const [result, setResult] =
    useState<any>();

  const loadQuestions = () => {
    api
      .get(
        `/assessment/${career}/questions`
      )
      .then(unwrap)
      .then((data: any[]) => {
        setQuestions(data);
        setAnswers(
          Array(data.length).fill(-1)
        );
      });
  };

  return (
    <Layout>
      <h1>Skill Assessment</h1>

      <div className="form">
        <input
          value={career}
          onChange={(e) =>
            setCareer(e.target.value)
          }
        />

        <button
          onClick={loadQuestions}
        >
          Load questions
        </button>
      </div>

      {questions.map((q, i) => (
        <article
          className="card"
          key={q._id}
        >
          <b>
            {i + 1}. {q.question}
          </b>

          {q.options.map(
            (option: string, j: number) => (
              <label
                className="option"
                key={option}
              >
                <input
                  type="radio"
                  checked={
                    answers[i] === j
                  }
                  onChange={() => {
                    const newAnswers = [
                      ...answers,
                    ];

                    newAnswers[i] = j;

                    setAnswers(
                      newAnswers
                    );
                  }}
                />

                {option}
              </label>
            )
          )}
        </article>
      ))}

      {questions.length > 0 && (
        <button
          onClick={() =>
            api
              .post(
                `/assessment/${career}/submit`,
                { answers }
              )
              .then(unwrap)
              .then(setResult)
          }
        >
          Submit Assessment
        </button>
      )}

      {result && (
  <article className="card">
    <p className="eyebrow">
      ASSESSMENT RESULT
    </p>

    <h2>{result.score}%</h2>

    <h3>💪 Strengths</h3>

    <p>
      {result.strengths?.length
        ? result.strengths.join(", ")
        : "No strong areas yet"}
    </p>

    <h3>📚 Improvement Areas</h3>

    <p>
      {result.improvementAreas?.length
        ? result.improvementAreas.join(", ")
        : "Great job! Keep practising."}
    </p>

    <h3>🎯 Recommendation</h3>

    <p>
      {result.improvementAreas?.length
        ? `Focus on ${result.improvementAreas.join(
            ", "
          )} before moving to the interview.`
        : "You are ready to practise interview questions."}
    </p>
  </article>
)}
    </Layout>
  );
}

function Interview() {
  const [career, setCareer] =
    useState("Software Developer");

  const [session, setSession] =
    useState<any>();

  const [answer, setAnswer] =
    useState("");

  const [reply, setReply] =
    useState<any>();

  const start = () => {
    api
      .post("/interviews", { career })
      .then(unwrap)
      .then(setSession);
  };

  const send = () => {
    api
      .post(
        `/interviews/${session.interview._id}/respond`,
        { answer }
      )
      .then(unwrap)
      .then(setReply);
  };

  return (
    <Layout>
      <h1>AI Mock Interview</h1>

      {!session ? (
        <div className="form">
          <input
            value={career}
            onChange={(e) =>
              setCareer(e.target.value)
            }
          />

          <button onClick={start}>
            Start interview
          </button>
        </div>
      ) : (
        <div className="form">
          <p>
            {reply?.nextQuestion ||
              session.question}
          </p>

          <textarea
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            placeholder="Give a complete answer with a concrete example."
          />

          <button onClick={send}>
            Submit response
          </button>

          {reply && (
            <Card
              title="Evaluation"
              value={`${reply.evaluation.overallScore}/100`}
              text={
                reply.evaluation.feedback
              }
            />
          )}
        </div>
      )}
    </Layout>
  );
}


function Simulator() {
  const [current, setCurrent] =
    useState("DSA:60, DBMS:55, OOP:80");

  const [projected, setProjected] =
    useState("DSA:80, DBMS:55, OOP:80");

  const [result, setResult] =
    useState<any>();

  const parseSkills = (value: string) => {
    return Object.fromEntries(
      value
        .split(",")
        .map((x) => x.trim().split(":"))
        .filter((x) => x.length === 2)
        .map(([name, score]) => [
          name,
          Number(score),
        ])
    );
  };

  return (
    <Layout>
      <h1>Career Simulator</h1>

      <p>
        Projected readiness based on the
        application's scoring model — not a
        guaranteed future prediction.
      </p>

      <div className="form">
        <label>
          Current skills

          <input
            value={current}
            onChange={(e) =>
              setCurrent(e.target.value)
            }
          />
        </label>

        <label>
          Projected skills

          <input
            value={projected}
            onChange={(e) =>
              setProjected(e.target.value)
            }
          />
        </label>

        <button
          onClick={() =>
            api
              .post("/simulator", {
                career:
                  "Software Developer",
                current:
                  parseSkills(current),
                projected:
                  parseSkills(projected),
              })
              .then(unwrap)
              .then(setResult)
          }
        >
          Run simulation
        </button>
      </div>

      {result && (
        <div className="grid">
          <Card
            title="Current"
            value={`${result.currentScore}/100`}
          />

          <Card
            title="Projected"
            value={`${result.projectedScore}/100`}
          />
        </div>
      )}
    </Layout>
  );
}

function Roadmap() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const career = params.get("career") || "Software Developer";

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.post(
          `/roadmap/${encodeURIComponent(career)}`
        );

        const data = unwrap(response);
        setTasks(data);
      } catch (err: any) {
        console.error("Roadmap error:", err);

        setError(
          err.response?.data?.error?.message ||
          "Unable to load roadmap"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [career]);

  const toggleTask = async (task: any) => {
    try {
      const response = await api.patch(
        `/roadmap/tasks/${task._id}`,
        {
          completed: !task.completed
        }
      );

      const updated = unwrap(response);

      setTasks((oldTasks) =>
        oldTasks.map((t) =>
          t._id === updated._id ? updated : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Unable to update task");
    }
  };

  // Calculate progress
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return (
    <Layout>
      <h1>{career} Roadmap 🚀</h1>

      <p>
        Follow these tasks step by step to build your skills for{" "}
        <b>{career}</b>.
      </p>

      {loading && <p>Loading roadmap...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>No roadmap tasks found.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <>
          {/* PROGRESS SECTION */}
          <section className="card">
            <p className="eyebrow">
              ROADMAP PROGRESS
            </p>

            <h2>{progress}% Complete</h2>

            <p>
              {completedTasks} of {totalTasks} tasks completed
            </p>

            <div
              style={{
                width: "100%",
                height: "20px",
                background: "#2a2a35",
                borderRadius: "10px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#9b7bff",
                  transition: "width 0.4s ease"
                }}
              />
            </div>
          </section>

          {/* PROGRESS GRAPH */}
          <section style={{ marginTop: "30px" }}>
            <h2>Roadmap Progress 📊</h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={[
                  {
                    status: "Completed",
                    count: completedTasks
                  },
                  {
                    status: "Remaining",
                    count: totalTasks - completedTasks
                  }
                ]}
              >
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#9b7bff"
                  radius={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* TASKS */}
          <div className="grid">
            {tasks.map((task, index) => (
              <article
                className="card"
                key={task._id}
              >
                <p className="eyebrow">
                  STEP {index + 1}
                </p>

                <h2>{task.title}</h2>

                <p>
                  {task.description}
                </p>

                <p>
                  <b>🧠 Skill:</b>{" "}
                  {task.skill}
                </p>

                <p>
                  <b>⏱ Time:</b>{" "}
                  {task.estimatedTime}
                </p>

                <p>
                  <b>📊 Difficulty:</b>{" "}
                  {task.difficulty}
                </p>

                <label className="option">
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() =>
                      toggleTask(task)
                    }
                  />

                  {task.completed
                    ? " Completed"
                    : " Mark as completed"}
                </label>
              </article>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}


function Stars() {
  const [astro, setAstro] = useState<any>();
  const [readiness, setReadiness] = useState<any>();
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/astrology"),
      api.get("/readiness")
    ])
      .then(([astroResponse, readinessResponse]) => {
        setAstro(unwrap(astroResponse));
        setReadiness(unwrap(readinessResponse));
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load career data");
      });
  }, []);

  return (
    <Layout>
      <h1>Stars vs Skills ⭐🧠</h1>

      <p>
        Compare self-reflection from astrology with
        measurable career progress.
      </p>

      {error && <p className="error">{error}</p>}

      <div className="grid">

        <Card
          title="🔮 Astrology Perspective"
          value={astro?.zodiac || "Your zodiac"}
          text={
            astro?.daily ||
            "Entertainment and self-reflection only."
          }
        />

        <Card
          title="🧠 Skill Perspective"
          value={
            readiness
              ? `${readiness.score}/100`
              : "Loading..."
          }
          text={
            readiness?.level ||
            "Measured from your career preparation."
          }
        />

        <Card
          title="🎯 Current Direction"
          value="Practical Data First"
          text="Career suggestions prioritise measurable skills, assessment and interview performance."
        />

      </div>

      <article className="card">
        <p className="eyebrow">
          YOUR CAREER APPROACH
        </p>

        <h2>
          Stars can inspire. Skills build careers.
        </h2>

        <p>
          Astrology is provided for entertainment and
          self-reflection. Your actual career preparation
          should be guided by skills, projects, assessments
          and interview performance.
        </p>
      </article>
    </Layout>
  );
}

function ProtectedRoute({ children }: { children: any }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Auth />} />

      <Route
        path="/register"
        element={<Auth register />}
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
  path="/resume"
  element={
    <ProtectedRoute>
      <Resume />
    </ProtectedRoute>
  }
/>

      <Route
        path="/astrology"
        element={
          <ProtectedRoute>
            <Astrology />
          </ProtectedRoute>
        }
      />

      <Route
        path="/careers"
        element={
          <ProtectedRoute>
            <Careers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessment"
        element={
          <ProtectedRoute>
            <Assessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulator"
        element={
          <ProtectedRoute>
            <Simulator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <Roadmap />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stars-vs-skills"
        element={
          <ProtectedRoute>
            <Stars />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Home />} />

    </Routes>
  );
}

function Resume() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a PDF or DOCX resume.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post(
        "/resume/upload",
        formData
      );

      const data = unwrap(response);

      setResult(data);
    } catch (err: any) {
      console.error("Resume analysis error:", err);

      setError(
        err.response?.data?.error?.message ||
        "Unable to analyze resume"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">
          RESUME ANALYZER 📄
        </p>

        <h1>AI Resume Analyzer</h1>

        <p>
          Upload your resume to discover your skills,
          suitable careers, job roles and areas for improvement.
        </p>
      </section>

      <div className="form">
        <label>
          Select Resume

          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
              setResult(null);
            }}
          />
        </label>

        {file && (
          <p>
            Selected file: <b>{file.name}</b>
          </p>
        )}

        <button
          type="button"
          onClick={uploadResume}
          disabled={loading || !file}
        >
          {loading
            ? "Analyzing Resume..."
            : "Analyze Resume"}
        </button>

        {error && (
          <p className="error">
            {error}
          </p>
        )}
      </div>

      {result && (
        <>
          <section className="grid">
            <Card
              title="RESUME SCORE 📊"
              value={`${result.resumeScore || 0}/100`}
              text="Overall resume strength based on structure, skills and content."
            />

            <Card
              title="TOP CAREER 🎯"
              value={
                result.topCareer?.career ||
                "Not detected"
              }
              text={
                result.topCareer
                  ? `${result.topCareer.matchPercentage}% skill match`
                  : "Add more relevant skills."
              }
            />

            <Card
              title="SKILLS DETECTED 🧠"
              value={`${result.skills?.length || 0}`}
              text="Technical skills found in your resume."
            />

            <Card
              title="JOB ROLES 💼"
              value={`${result.jobRecommendations?.length || 0}`}
              text="Recommended roles based on your skills."
            />
          </section>

          {result.skills?.length > 0 && (
            <article className="card">
              <p className="eyebrow">
                YOUR SKILLS 🧠
              </p>

              <h2>Detected Skills</h2>

              <p className="tags">
                {result.skills.join(" · ")}
              </p>
            </article>
          )}

          {result.jobRecommendations?.length > 0 && (
            <section>
              <h2>Recommended Job Roles 💼</h2>

              <div className="grid">
                {result.jobRecommendations.map(
                  (job: any) => (
                    <article
                      className="card"
                      key={job.role}
                    >
                      <p className="eyebrow">
                        JOB MATCH
                      </p>

                      <h2>{job.role}</h2>

                      <h3>
                        {job.matchPercentage}% Match
                      </h3>

                      <p>
                        {job.reason}
                      </p>
                    </article>
                  )
                )}
              </div>
            </section>
          )}

          {result.careerMatches?.length > 0 && (
            <section>
              <h2>Career Compatibility 🎯</h2>

              <div className="grid">
                {result.careerMatches
                  .slice(0, 5)
                  .map((career: any) => (
                    <article
                      className="card"
                      key={career.career}
                    >
                      <h2>
                        {career.career}
                      </h2>

                      <h3>
                        {career.matchPercentage}% Match
                      </h3>

                      <p>
                        <b>Matched Skills:</b>
                      </p>

                      <p className="tags">
                        {career.matchedSkills?.length
                          ? career.matchedSkills.join(
                              " · "
                            )
                          : "None yet"}
                      </p>

                      <p>
                        <b>Missing Skills:</b>
                      </p>

                      <p className="tags">
                        {career.missingSkills?.length
                          ? career.missingSkills.join(
                              " · "
                            )
                          : "No major gaps"}
                      </p>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {result.skillsToLearn?.length > 0 && (
            <article className="card">
              <p className="eyebrow">
                SKILLS TO LEARN 📚
              </p>

              <h2>
                Improve Your Top Career Match
              </h2>

              <p>
                Learning these skills can improve your
                compatibility with your recommended career.
              </p>

              <p className="tags">
                {result.skillsToLearn.join(" · ")}
              </p>
            </article>
          )}

          {result.suggestions?.length > 0 && (
            <article className="card">
              <p className="eyebrow">
                RESUME IMPROVEMENTS ✨
              </p>

              <h2>
                How to Improve Your Resume
              </h2>

              {result.suggestions.map(
                (suggestion: string, index: number) => (
                  <p key={index}>
                    {index + 1}. {suggestion}
                  </p>
                )
              )}
            </article>
          )}

          {result.text && (
            <article className="card">
              <p className="eyebrow">
                EXTRACTED RESUME TEXT
              </p>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  maxHeight: "400px",
                  overflowY: "auto"
                }}
              >
                {result.text}
              </pre>
            </article>
          )}
        </>
      )}
    </Layout>
  );
}

createRoot(
  document.getElementById("root")!
).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);