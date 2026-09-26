import { useState } from "react";
import { Layout } from "../components/Layout";
import { api, unwrap } from "../lib/api";

const careers = ["Software Developer", "Full Stack Developer", "AI/ML Engineer", "Data Scientist", "Data Analyst", "Cybersecurity Analyst", "Cloud Engineer", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Business Analyst", "Digital Marketing", "Financial Analyst", "HR", "Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Electronics Engineer"];

export function Assessment() {
  const [career, setCareer] = useState("Software Developer");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadQuestions = async () => {
    try {
      setLoading(true); setError(""); setResult(undefined);
      const data = unwrap(await api.get(`/assessment/${encodeURIComponent(career)}/questions`));
      if (!Array.isArray(data) || !data.length) throw new Error("No questions are available for this career. Run the seed command to add them.");
      setQuestions(data); setAnswers(Array(data.length).fill(-1));
    } catch (err: any) { setQuestions([]); setError(err.response?.data?.error?.message || err.message || "Unable to load assessment questions."); }
    finally { setLoading(false); }
  };

  const submit = async () => {
    if (answers.some((answer) => answer < 0)) return setError("Answer every question before submitting.");
    try { setLoading(true); setError(""); setResult(unwrap(await api.post(`/assessment/${encodeURIComponent(career)}/submit`, { answers }))); }
    catch (err: any) { setError(err.response?.data?.error?.message || "Unable to submit the assessment."); }
    finally { setLoading(false); }
  };

  return <Layout>
    <h1>Skill Assessment</h1>
    <p>Choose a career, answer scenario-based questions, then review every correct answer and explanation.</p>
    <div className="form">
      <label>Career role<select value={career} onChange={(e) => setCareer(e.target.value)}>{careers.map((item) => <option key={item}>{item}</option>)}</select></label>
      <button onClick={loadQuestions} disabled={loading}>{loading ? "Loading…" : "Load assessment"}</button>
    </div>
    {error && <p className="error">{error}</p>}
    {questions.map((q, i) => <article className="card" key={q._id}>
      <p className="eyebrow">{q.skill} · {q.category}</p><b>{i + 1}. {q.question}</b>
      {q.options.map((option: string, j: number) => <label className="option" key={option}><input type="radio" name={q._id} checked={answers[i] === j} onChange={() => { const next = [...answers]; next[i] = j; setAnswers(next); }} />{option}</label>)}
    </article>)}
    {questions.length > 0 && !result && <button onClick={submit} disabled={loading}>{loading ? "Scoring…" : `Submit assessment (${answers.filter((answer) => answer >= 0).length}/${questions.length})`}</button>}
    {result && <><article className="card"><p className="eyebrow">ASSESSMENT RESULT</p><h2>{result.score}%</h2><h3>Strengths</h3><p>{result.strengths?.length ? result.strengths.join(", ") : "No strong areas yet"}</p><h3>Improvement Areas</h3><p>{result.improvementAreas?.length ? result.improvementAreas.join(", ") : "Great job! Keep practising."}</p></article>
      <section><h2>Answer review</h2>{result.review?.map((item: any, index: number) => <article className="card" key={`${item.question}-${index}`}><p className="eyebrow">{item.correct ? "Correct" : "Review needed"} · {item.skill}</p><b>{item.question}</b><p>Your answer: {item.selectedAnswer || "Not answered"}</p>{!item.correct && <p><b>Correct answer:</b> {item.correctAnswer}</p>}<p>{item.explanation}</p></article>)}</section></>}
  </Layout>;
}
