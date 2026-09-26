import { Career, StudentProfile } from "../models/index.js";

export const careerService = {
  async list(userId?: string) {
    if (!userId) return Career.find().lean();
    const profile = await StudentProfile.findOne({ user: userId }).lean();
    if (!profile) return Career.find().lean();

    const course = (profile.course || "").toLowerCase();
    const specialization = (profile.specialization || "").toLowerCase();
    const skills = (profile.skills || []).map((skill) => skill.toLowerCase());
    const interests = (profile.interests || []).map((interest) => interest.toLowerCase());
    const careers = await Career.find().lean();

    return careers.map((career) => {
      const text = `${career.name} ${career.description} ${(career.requiredSkills || []).join(" ")}`.toLowerCase();
      const matchScore =
        (course && text.includes(course) ? 50 : 0) +
        (specialization && text.includes(specialization) ? 30 : 0) +
        skills.filter((skill) => text.includes(skill)).length * 10 +
        interests.filter((interest) => text.includes(interest)).length * 5;
      return { ...career, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  },
  detail(name: string) {
    return Career.findOne({ name }).lean();
  }
};
