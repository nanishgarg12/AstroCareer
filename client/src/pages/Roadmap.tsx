import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Layout } from "../components/Layout";
import { api, unwrap } from "../lib/api";

export function Roadmap() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const requestedCareer = params.get("career");
  const [career, setCareer] = useState(requestedCareer || "");

  useEffect(() => {
    if (!career) {
      api.get("/career/readiness").then(unwrap).then((analysis) => setCareer(analysis?.targetRole || "Software Developer")).catch(() => setCareer("Software Developer"));
      return;
    }
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
