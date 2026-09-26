import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { api, unwrap } from "../lib/api";

export function Home() {
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
