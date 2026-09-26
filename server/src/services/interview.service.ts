import { Career, Interview, InterviewEvaluation, InterviewMessage } from "../models/index.js";

type InterviewQuestion = { category: "Technical" | "Project" | "Problem Solving" | "Behavioral" | "Role knowledge"; prompt: string; expectedPoints: string[]; keywords: string[] };

const buildQuestions = (career: string, skills: string[]): InterviewQuestion[] => {
  const primary = skills[0] || "the core technical skill";
  const secondary = skills[1] || "a related tool";
  const skillWords = skills.flatMap((skill) => skill.toLowerCase().split(/[^a-z0-9+#.]+/)).filter(Boolean);
  return [
    { category: "Technical", prompt: `For a ${career} role, explain a core concept in ${primary} and when you would use it.`, expectedPoints: [`Define or describe ${primary}`, "Explain when it is useful", "Mention a practical example or trade-off"], keywords: [...skillWords, "example", "use", "because", "tradeoff", "performance"] },
    { category: "Project", prompt: `Tell me about a project where you used ${primary} or ${secondary}. What was your contribution and result?`, expectedPoints: ["Name the project or context", "Describe your own actions", "State the outcome with evidence or a metric"], keywords: ["project", "built", "implemented", "developed", "result", "improved", "users", "percent", "team"] },
    { category: "Problem Solving", prompt: `A feature using ${primary} is not working as expected. How would you investigate and fix it?`, expectedPoints: ["Clarify or reproduce the issue", "Inspect evidence such as logs, data, or tests", "Test a fix and verify the result"], keywords: ["reproduce", "debug", "log", "test", "inspect", "verify", "root cause", "fix"] },
    { category: "Behavioral", prompt: "Describe a time you received difficult feedback or faced a setback. What did you do and what did you learn?", expectedPoints: ["Give a specific situation", "Explain your action", "Share the outcome and learning"], keywords: ["situation", "feedback", "challenge", "action", "learn", "result", "improved", "team"] },
    { category: "Role knowledge", prompt: `Which ${career} skill would you develop next, and what 30-day plan would you follow to demonstrate it?`, expectedPoints: ["Choose a role-relevant skill", "Give concrete learning or project steps", "Describe measurable proof of progress"], keywords: [...skillWords, "learn", "practice", "project", "week", "portfolio", "measure", "milestone"] }
  ];
};

const evaluateAnswer = (answer: string, question: InterviewQuestion) => {
  const words = answer.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text = ` ${answer.toLowerCase()} `;
  const matchedKeywords = [...new Set(question.keywords.filter((keyword) => text.includes(keyword.toLowerCase())))];
  const hasExample = /\b(example|project|built|implemented|when i|situation)\b/.test(text);
  const hasOutcome = /\b(result|improved|reduced|increased|learned|%|users|impact)\b/.test(text);
  const score = Math.min(100, Math.min(40, Math.round((words.length / 80) * 40)) + Math.min(40, matchedKeywords.length * 5) + (hasExample ? 10 : 0) + (hasOutcome ? 10 : 0) + 10);
  const missingPoints = question.expectedPoints.filter((_, index) => index === 0 ? matchedKeywords.length < 1 : index === 1 ? !hasExample : !hasOutcome);
  const meetsExpectedPoints = score >= 60 && words.length >= 25;
  return { score, matchedKeywords, meetsExpectedPoints, missingPoints, feedback: meetsExpectedPoints ? "This answer addresses the key points for this question. Make it even stronger by keeping the example specific and measurable." : "This answer does not yet cover enough expected points. Use a concrete example, explain your actions, and finish with a measurable result or learning." };
};

export const interviewService = {
  async start(user: string, careerName: string) {
    const career = await Career.findOne({ name: careerName }).lean();
    if (!career) throw new Error("Choose a career from the available career list.");
    const questions = buildQuestions(career.name, career.requiredSkills || []);
    const interview = await Interview.create({ user, career: career.name, round: "Technical" });
    await InterviewMessage.create({ interview: interview.id, role: "assistant", content: questions[0].prompt });
    return { interview, question: questions[0].prompt, category: questions[0].category, questionNumber: 1, totalQuestions: questions.length };
  },

  async reply(user: string, interviewId: string, answer: string) {
    const interview = await Interview.findOne({ _id: interviewId, user });
    if (!interview) throw new Error("Interview not found.");
    if (interview.status === "completed") throw new Error("This interview is already complete. Start a new interview to practise again.");
    const career = await Career.findOne({ name: interview.career }).lean();
    const questions = buildQuestions(interview.career, career?.requiredSkills || []);
    const answeredCount = await InterviewMessage.countDocuments({ interview: interview.id, role: "student" });
    const currentQuestion = questions[answeredCount];
    if (!currentQuestion) throw new Error("This interview is already complete.");
    const answerEvaluation = evaluateAnswer(answer, currentQuestion);
    await InterviewMessage.create({ interview: interview.id, role: "student", content: answer });
    const previous = await InterviewEvaluation.findOne({ interview: interview.id }).lean();
    const completedAnswers = answeredCount + 1;
    const overallScore = Math.round(((previous?.overallScore || 0) * answeredCount + answerEvaluation.score) / completedAnswers);
    const evaluation = { technicalScore: currentQuestion.category === "Technical" ? answerEvaluation.score : previous?.technicalScore || 0, problemSolvingScore: currentQuestion.category === "Problem Solving" ? answerEvaluation.score : previous?.problemSolvingScore || 0, communicationScore: Math.min(100, Math.max(30, Math.round(answer.trim().split(/\s+/).length * 1.2))), relevanceScore: answerEvaluation.score, overallScore, strengths: answerEvaluation.matchedKeywords.length ? [`Matched: ${answerEvaluation.matchedKeywords.join(", ")}`] : ["You submitted a response."], weaknesses: answerEvaluation.missingPoints, feedback: answerEvaluation.feedback, improvements: ["Use STAR: situation, task, action, result.", "Name the tools or concepts you used and explain why.", "Quantify the result where possible."] };
    await InterviewEvaluation.findOneAndUpdate({ interview: interview.id }, evaluation, { upsert: true, new: true });
    const nextQuestion = questions[completedAnswers];
    if (!nextQuestion) { interview.status = "completed"; await interview.save(); return { evaluation, answerEvaluation, completed: true, questionNumber: completedAnswers, totalQuestions: questions.length }; }
    await InterviewMessage.create({ interview: interview.id, role: "assistant", content: nextQuestion.prompt });
    return { evaluation, answerEvaluation, nextQuestion: nextQuestion.prompt, nextCategory: nextQuestion.category, completed: false, questionNumber: completedAnswers + 1, totalQuestions: questions.length };
  }
};
