import { roleRequirementService, type RoleRequirement } from "./role-requirement.service.js";

type ResumeData = { skills?: string[]; projects?: string[]; education?: string[]; experience?: string[]; certifications?: string[]; text?: string };
type ProfileData = { skills?: string[]; projects?: number; experience?: number; course?: string };
type Evidence = "Resume Evidence" | "Project Evidence" | "Experience Evidence" | "Certification Evidence" | "Simulated Project Evidence";

const aliases: Record<string, string[]> = { "node.js": ["node", "nodejs"], "rest api": ["rest", "api"], "ci/cd": ["cicd", "continuous integration"], "scikit-learn": ["sklearn"], "power bi": ["powerbi"], "data visualization": ["visualization"], "machine learning": ["ml"], "authentication": ["auth"], "system design": ["system architecture"] };
const normalise = roleRequirementService.normalise;
const includesSkill = (content: string, skill: string) => { const source = normalise(content); const target = normalise(skill); return source.includes(target) || (aliases[target] || []).some((alias) => source.includes(alias)); };
const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const categoryWeight = (category: string) => category === "Required" ? 3 : category === "Important" ? 2 : 1;

export const extractStructuredResume = (text: string, detectedSkills: string[]) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const section = (terms: string[]) => lines.filter((line) => terms.some((term) => normalise(line).includes(term))).slice(0, 6);
  // Preserve only resume evidence that is actually written in the uploaded file.
  return { name: lines[0] || "", skills: unique(detectedSkills), projects: section(["project", "developed", "built", "implemented", "github"]), education: section(["education", "b.tech", "btech", "bca", "mca", "degree", "university", "college"]), experience: section(["experience", "intern", "worked", "employment"]), certifications: section(["certification", "certificate", "certified"]) };
};

const evidenceFor = (skill: string, resume: ResumeData, profile: ProfileData, simulated: Set<string>) => {
  const evidence: Evidence[] = [];
  const resumeMentioned = [...(resume.skills || []), resume.text || ""].some((item) => includesSkill(item, skill));
  const profileMentioned = (profile.skills || []).some((item) => includesSkill(item, skill));
  if (resumeMentioned || profileMentioned) evidence.push("Resume Evidence");
  if ((resume.projects || []).some((project) => includesSkill(project, skill))) evidence.push("Project Evidence");
  if ((resume.experience || []).some((entry) => includesSkill(entry, skill))) evidence.push("Experience Evidence");
  if ((resume.certifications || []).some((entry) => includesSkill(entry, skill))) evidence.push("Certification Evidence");
  if (simulated.has(normalise(skill))) evidence.push("Simulated Project Evidence");
  return { evidence, resumeMentioned, profileMentioned };
};

const projectRecommendation = (skill: string, role: string) => ({ skill, reason: `${skill} is a ${role} requirement that currently has no supporting evidence.`, project: skill === "Docker" ? "Containerize your existing AstroCareer backend." : skill === "AWS" ? "Deploy a full-stack application using AWS." : skill === "REST API" ? "Build a CRUD REST API with authentication and MongoDB." : `Build a focused ${skill} feature and document the technical decisions in its project description.`, expectedOutcome: `A portfolio artefact that provides visible evidence of ${skill}.`, difficulty: "Intermediate", estimatedEffort: "6-10 hours" });
const priorityFor = (skill: string, role: RoleRequirement) => role.requiredSkills.some((item) => normalise(item) === normalise(skill)) ? "High" : role.importantSkills.some((item) => normalise(item) === normalise(skill)) ? "Medium" : "Low";
const planStep = (skill: string, week: number, role: string) => {
  const docker = ["Learn Docker images, containers, and volumes.", "Dockerize an existing backend with a Dockerfile.", "Run the database and backend together with Docker Compose.", "Deploy the containerized application and add usage instructions."];
  const generic = [`Learn the essentials of ${skill}.`, `Build the core ${skill} implementation.`, `Extend it into a role-relevant project and test it.`, `Document the completed ${skill} work in your resume or profile.`];
  return { week, skill, title: `Week ${week}: Build evidence for ${skill}`, steps: [skill === "Docker" ? docker[week - 1] : generic[week - 1], projectRecommendation(skill, role).project] };
};

export const careerReadinessService = {
  // Compare the user's resume/profile evidence with the requirements of the selected target role.
  analyse(role: RoleRequirement, resume: ResumeData = {}, profile: ProfileData = {}, improvements: string[] = []) {
    const simulated = new Set(improvements.map(normalise));
    const requirements = [...role.requiredSkills.map((skill) => ({ skill, category: "Required" })), ...role.importantSkills.map((skill) => ({ skill, category: "Important" })), ...role.optionalSkills.map((skill) => ({ skill, category: "Optional" }))];
    const skills = requirements.map(({ skill, category }) => {
      const found = evidenceFor(skill, resume, profile, simulated);
      // Resume mentions are not treated as verified project evidence. Strong evidence requires project, experience, certification, or temporary simulation.
      const verified = found.evidence.some((source) => source !== "Resume Evidence");
      const status = verified ? "Strong" : found.resumeMentioned ? "Matching" : found.profileMentioned ? "Partial" : "Missing";
      return { skill, category, status, evidence: found.evidence.length ? found.evidence : ["No Evidence"], priority: priorityFor(skill, role) };
    });
    const totalWeight = requirements.reduce((total, item) => total + categoryWeight(item.category), 0) || 1;
    const weighted = (predicate: (item: typeof skills[number]) => number) => skills.reduce((total, item) => total + categoryWeight(item.category) * predicate(item), 0);
    const skillValue = (status: string) => status === "Strong" ? 1 : status === "Matching" ? .7 : status === "Partial" ? .45 : 0;
    const skillMatch = clamp(weighted((item) => skillValue(item.status)) / totalWeight * 100);
    const projectEvidence = clamp(weighted((item) => item.evidence.some((source) => source === "Project Evidence" || source === "Simulated Project Evidence") ? 1 : 0) / totalWeight * 100);
    const relevantExperience = (resume.experience || []).filter((entry) => requirements.some(({ skill }) => includesSkill(entry, skill)));
    // Relevant experience counts materially more than an unrelated entry; count-only profile data remains conservative.
    const experienceEvidence = resume.experience?.length ? clamp(relevantExperience.length * 35 + (relevantExperience.length / resume.experience.length) * 25) : clamp(Math.min(profile.experience || 0, 3) * 10);
    const educationCertification = clamp((resume.education?.length || profile.course ? 55 : 0) + Math.min(3, resume.certifications?.length || 0) * 15);
    const resumeEvidence = clamp(weighted((item) => item.evidence[0] !== "No Evidence" ? 1 : 0) / totalWeight * 100);
    // Calculate the final readiness score using transparent dimension weights.
    const overall = clamp(skillMatch * .45 + projectEvidence * .25 + experienceEvidence * .15 + educationCertification * .10 + resumeEvidence * .05);
    const gaps = skills.filter((item) => item.status === "Missing").sort((a, b) => ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority));
    const focus = gaps.slice(0, 4);
    const actionPlan = focus.length ? Array.from({ length: 4 }, (_, index) => planStep(focus[index % focus.length].skill, index + 1, role.name)) : [];
    return { targetRole: role.name, readiness: { overall, level: overall < 40 ? "Starting out" : overall < 65 ? "Developing" : overall < 80 ? "Nearly ready" : "Job ready", dimensions: { skillMatch, projectEvidence, experienceEvidence, educationCertification, resumeEvidence }, weights: { skillMatch: 45, projectEvidence: 25, experienceEvidence: 15, educationCertification: 10, resumeEvidence: 5 }, skillCategoryWeights: { required: 3, important: 2, optional: 1 } }, skills, gaps, actionPlan, recommendations: gaps.filter((gap) => gap.priority !== "Low").slice(0, 4).map((gap) => projectRecommendation(gap.skill, role.name)), interviewTopics: role.interviewTopics };
  },
  simulate(role: RoleRequirement, resume: ResumeData = {}, profile: ProfileData = {}, improvements: string[] = []) {
    const current = this.analyse(role, resume, profile);
    // Simulation temporarily adds selected skills as hypothetical evidence. It does not modify the stored profile.
    const simulated = this.analyse(role, resume, profile, unique(improvements));
    const newlySatisfiedSkills = simulated.skills.filter((item) => item.status === "Strong" && current.skills.find((before) => before.skill === item.skill)?.status !== "Strong").map((item) => item.skill);
    const simulationEvidence = simulated.skills.filter((item) => item.evidence.includes("Simulated Project Evidence")).map((item) => ({ skill: item.skill, before: current.skills.find((before) => before.skill === item.skill)?.status || "Missing", after: item.status, evidence: "Simulated Project Evidence" }));
    return { current, simulated, scoreChange: simulated.readiness.overall - current.readiness.overall, newlySatisfiedSkills, remainingGaps: simulated.gaps, simulationEvidence };
  }
};
