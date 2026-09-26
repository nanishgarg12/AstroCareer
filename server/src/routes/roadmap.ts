import { Router } from "express";
import { z } from "zod";
import { Career, CareerReadiness, RoadmapTask } from "../models/index.js";
import { roadmapService } from "../services/index.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();
router.post('/api/roadmap/:career', auth, asyncRoute(async (req: Authed, res) => {
  const user = id(req);
  const saved = await CareerReadiness.findOne({ user, targetRole: req.params.career }).lean();
  // A readiness-derived plan only contains current gaps, so already-strong skills are not promoted again.
  if (saved?.analysis?.actionPlan) return res.json({ success: true, data: await roadmapService.createFromReadiness(user, saved.analysis) });
  const career = await Career.findOne({ name: req.params.career });
  if (!career) return res.status(404).json({ success: false, error: { code: "CAREER_NOT_FOUND", message: "Run a career readiness analysis for this role first." } });
  res.json({ success: true, data: await roadmapService.create(user, career) });
}));

router.patch('/api/roadmap/tasks/:taskId', auth, asyncRoute(async (req: Authed, res) => {
  const completed = z.object({ completed: z.boolean() }).parse(req.body).completed;
  const task = await RoadmapTask.findOneAndUpdate({ _id: req.params.taskId, user: id(req) }, { completed }, { new: true });
  res.json({ success: true, data: task });
}));
export default router;
