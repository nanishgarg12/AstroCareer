import { Router } from "express";
import { z } from "zod";
import { CareerReadiness, ResumeProfile, StudentProfile } from "../models/index.js";
import { careerReadinessService } from "../services/career-readiness.service.js";
import { roleRequirementService } from "../services/role-requirement.service.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();
const roleInput = z.object({ targetRole: z.string().min(2).max(80) });
const profileData = async (req: Authed) => Promise.all([ResumeProfile.findOne({ user: id(req) }).lean(), StudentProfile.findOne({ user: id(req) }).lean()]);

router.get("/api/career/roles", auth, (_req, res) => res.json({ success: true, data: roleRequirementService.list() }));
router.get("/api/career/readiness", auth, asyncRoute(async (req: Authed, res) => {
  const readiness = await CareerReadiness.findOne({ user: id(req) }).lean();
  res.json({ success: true, data: readiness?.analysis || null });
}));

router.post("/api/career/analyze", auth, asyncRoute(async (req: Authed, res) => {
  const { targetRole } = roleInput.parse(req.body);
  const role = roleRequirementService.find(targetRole);
  if (!role) return res.status(400).json({ success: false, error: { code: "INVALID_ROLE", message: "Choose a supported target career role." } });
  const [resume, profile] = await profileData(req);
  if (!resume && !(profile?.skills?.length)) return res.status(400).json({ success: false, error: { code: "PROFILE_EMPTY", message: "Upload a resume or add skills to your profile before analysis." } });
  const analysis = careerReadinessService.analyse(role, (resume?.structured || {}) as any, profile || {});
  await CareerReadiness.findOneAndUpdate({ user: id(req) }, { user: id(req), targetRole: role.name, analysis }, { upsert: true, new: true });
  res.json({ success: true, data: analysis });
}));

router.post("/api/career/simulate", auth, asyncRoute(async (req: Authed, res) => {
  const { targetRole, improvements } = z.object({ targetRole: z.string(), improvements: z.array(z.string().min(1).max(80)).max(20) }).parse(req.body);
  const role = roleRequirementService.find(targetRole);
  if (!role) return res.status(400).json({ success: false, error: { code: "INVALID_ROLE", message: "Choose a supported target career role." } });
  const allowed = new Set([...role.requiredSkills, ...role.importantSkills, ...role.optionalSkills].map(roleRequirementService.normalise));
  if (improvements.some((skill) => !allowed.has(roleRequirementService.normalise(skill)))) return res.status(400).json({ success: false, error: { code: "INVALID_SKILL", message: "Simulation selections must belong to the target role." } });
  const [resume, profile] = await profileData(req);
  // This path deliberately does not write to CareerReadiness, ResumeProfile, or StudentProfile.
  const result = careerReadinessService.simulate(role, (resume?.structured || {}) as any, profile || {}, improvements);
  res.json({ success: true, data: { ...result, improvements, disclaimer: "Simulation only — no profile or resume data was changed." } });
}));

export default router;
