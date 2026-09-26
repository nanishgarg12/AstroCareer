import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Layout } from "../components/Layout";
import { api, unwrap } from "../lib/api";

export function Careers() {
  const [careers, setCareers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/careers")
      .then(unwrap)
      .then((data) => setCareers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Unable to load careers:", err);
        setCareers([]);
        setError("Unable to load careers. Please make sure the API server is running and try again.");
      });

    api
      .get("/recommendations")
      .then(unwrap)
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]));
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

      {error && <p className="error">{error}</p>}

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
