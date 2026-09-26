import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { api, unwrap } from "../lib/api";

export function Astrology() {
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
