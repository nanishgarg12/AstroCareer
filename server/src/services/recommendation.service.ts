import { Career, StudentProfile } from "../models/index.js";

export const recommendationService = {
  async match(user: string) {
    const profile = await StudentProfile.findOne({ user }).lean();
    const careers = await Career.find().lean();
    const skills = (profile?.skills || []).map((skill) => skill.toLowerCase());
    return careers.map((career) => {
      const requiredSkills = career.requiredSkills || [];
      const matched = requiredSkills.filter((skill) => skills.includes(skill.toLowerCase())).length;
      const interestMatch = (profile?.interests || []).some((interest) => career.name.toLowerCase().includes(interest.toLowerCase()));
      const score = Math.min(100, Math.round((requiredSkills.length ? matched / requiredSkills.length : 0) * 65 + (interestMatch ? 15 : 0) + 10 + (profile?.projects || 0) * 2));
      return { career: career.name, score, reason: `${matched}/${requiredSkills.length} required skills currently listed${interestMatch ? " and an interest alignment" : ""}.` };
    }).sort((a, b) => b.score - a.score);
  }
};
