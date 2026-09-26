import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { api, unwrap } from "../lib/api";
import { Link } from "react-router-dom";

export function Resume() {
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
          <article className="card"><p className="eyebrow">CAREER READINESS</p><h2>Your resume is ready for deeper analysis</h2><p>Choose a target role to see skill gaps, proof of skill, and a personalized plan.</p><Link className="button" to="/career-readiness">Open Career Readiness</Link></article>
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
