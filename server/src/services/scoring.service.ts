export const scoringService = {
  readiness(assessment = 0, interview = 0, skills = 0, projects = 0) {
    const score = Math.round(assessment * 0.35 + interview * 0.35 + skills * 0.2 + projects * 0.1);
    const level = score < 40 ? "Beginner" : score < 60 ? "Developing" : score < 75 ? "Almost Ready" : score < 90 ? "Job Ready" : "Strong Candidate";
    return { score, level, weights: { assessment: 35, interview: 35, skills: 20, projectsExperience: 10 } };
  }
};
