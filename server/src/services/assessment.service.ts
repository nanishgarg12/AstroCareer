import { AssessmentAttempt, Question } from "../models/index.js";

export const assessmentService = {
  questions(career: string) {
    return Question.find({ career }).select("-correctAnswer -explanation").lean();
  },
  async submit(user: string, career: string, answers: number[]) {
    const questions = await Question.find({ career });
    if (!questions.length) throw new Error("No questions available for this career");
    let earned = 0;
    let total = 0;
    const skills: Record<string, [number, number]> = {};
    const review = questions.map((question, index) => {
      total += question.marks;
      const correct = answers[index] === question.correctAnswer;
      if (correct) earned += question.marks;
      const score = skills[question.skill] || [0, 0];
      score[1] += question.marks;
      if (correct) score[0] += question.marks;
      skills[question.skill] = score;
      return {
        question: question.question,
        skill: question.skill,
        selectedAnswer: Number.isInteger(answers[index]) ? question.options[answers[index]] || null : null,
        correctAnswer: question.options[question.correctAnswer],
        explanation: question.explanation || "Review this topic and practise applying it in a small project.",
        correct
      };
    });
    const skillScores = Object.fromEntries(Object.entries(skills).map(([skill, [earnedMarks, possibleMarks]]) => [skill, Math.round((earnedMarks / possibleMarks) * 100)]));
    const score = Math.round((earned / total) * 100);
    await AssessmentAttempt.create({ user, career, answers, score, skillScores });
    return { score, skillScores, strengths: Object.keys(skillScores).filter((skill) => skillScores[skill] >= 70), improvementAreas: Object.keys(skillScores).filter((skill) => skillScores[skill] < 70), review };
  }
};
