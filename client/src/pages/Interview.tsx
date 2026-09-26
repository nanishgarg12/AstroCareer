import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { api, unwrap } from "../lib/api";

const careers = ["Software Developer", "Full Stack Developer", "AI/ML Engineer", "Data Scientist", "Data Analyst", "Cybersecurity Analyst", "Cloud Engineer", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Business Analyst", "Digital Marketing", "Financial Analyst", "HR", "Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Electronics Engineer"];

export function Interview() {
  const [career, setCareer] = useState("Software Developer");
  const [session, setSession] = useState<any>();
  const [answer, setAnswer] = useState("");
  const [reply, setReply] = useState<any>();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const start = async () => {
    try { setWorking(true); setError(""); setReply(undefined); setSession(unwrap(await api.post("/interviews", { career }))); }
    catch (err: any) { setError(err.response?.data?.error?.message || "Unable to start the interview."); }
    finally { setWorking(false); }
  };
  const send = async () => {
    if (answer.trim().split(/\s+/).length < 10) return setError("Write at least a few complete sentences so your answer can be evaluated.");
    try { setWorking(true); setError(""); const data = unwrap(await api.post(`/interviews/${session.interview._id}/respond`, { answer })); setReply(data); setAnswer(""); }
    catch (err: any) { setError(err.response?.data?.error?.message || "Unable to evaluate your response."); }
    finally { setWorking(false); }
  };

  const activeQuestion = reply?.nextQuestion || session?.question;
  const category = reply?.nextCategory || session?.category;
  return <Layout>
    <h1>Structured Mock Interview</h1>
    <p>Practise five role-specific rounds. Each response is checked against expected points; this is rubric feedback, not a claim of a single objectively correct open-ended answer.</p>
    {!session ? <div className="form"><label>Career role<select value={career} onChange={(e) => setCareer(e.target.value)}>{careers.map((item) => <option key={item}>{item}</option>)}</select></label><button onClick={start} disabled={working}>{working ? "Starting…" : "Start interview"}</button></div> : <div className="form">
      {!reply?.completed && <><p className="eyebrow">QUESTION {reply?.questionNumber || session.questionNumber} OF {reply?.totalQuestions || session.totalQuestions} · {category}</p><p>{activeQuestion}</p><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Use a specific example: situation, your action, tools or reasoning, and result." /><button onClick={send} disabled={working}>{working ? "Evaluating…" : "Submit response"}</button></>}
      {reply && <article className="card"><p className="eyebrow">RESPONSE FEEDBACK</p><h2>{reply.answerEvaluation.meetsExpectedPoints ? "Meets expected points" : "Needs more evidence"}</h2><p>{reply.answerEvaluation.feedback}</p><p><b>Detected relevant terms:</b> {reply.answerEvaluation.matchedKeywords.length ? reply.answerEvaluation.matchedKeywords.join(", ") : "None yet"}</p>{reply.answerEvaluation.missingPoints.length > 0 && <p><b>Add next time:</b> {reply.answerEvaluation.missingPoints.join(" · ")}</p>}</article>}
      {reply && <Card title={reply.completed ? "Final interview score" : "Running interview score"} value={`${reply.evaluation.overallScore}/100`} text={reply.completed ? "Interview complete. Review the feedback and practise the weak areas before trying another role." : "Your next question is ready below."} />}
      {reply?.completed && <button onClick={() => { setSession(undefined); setReply(undefined); }}>Start another interview</button>}
    </div>}
    {error && <p className="error">{error}</p>}
  </Layout>;
}
