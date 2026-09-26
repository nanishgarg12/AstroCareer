import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { api, unwrap } from "../lib/api";

export function Stars() {
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
