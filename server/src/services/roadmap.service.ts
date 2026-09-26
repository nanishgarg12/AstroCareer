import { RoadmapTask } from "../models/index.js";

const save = async (user: string, career: string, tasks: any[]) => {
  await RoadmapTask.deleteMany({ user, career });
  if (tasks.length) await RoadmapTask.insertMany(tasks.map((task, index) => ({ user, career, title: task.title, skill: task.skill, description: task.description, difficulty: task.difficulty, estimatedTime: task.estimatedTime, week: task.week || index + 1, order: task.order || index + 1, completed: false })));
  return RoadmapTask.find({ user, career }).sort({ order: 1 }).lean();
};

export const roadmapService = {
  async create(user: string, career: any) {
    return save(user, career.name, (career.roadmap || []).map((task: any) => ({ ...task })));
  },
  // Reuse the saved readiness action plan so missing skills are prioritised over generic career tasks.
  async createFromReadiness(user: string, analysis: any) {
    return save(user, analysis.targetRole, (analysis.actionPlan || []).map((step: any) => ({ title: step.title, skill: step.skill, description: step.steps.join(" "), difficulty: "Intermediate", estimatedTime: "6-10 hours", week: step.week, order: step.week })));
  }
};
