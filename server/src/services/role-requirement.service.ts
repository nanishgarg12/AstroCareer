export type RoleRequirement = {
  name: string;
  requiredSkills: string[];
  importantSkills: string[];
  optionalSkills: string[];
  projectExpectations: string[];
  interviewTopics: string[];
};

// This backend-owned catalogue keeps role expectations out of React and makes
// adding another role a data change rather than a UI rewrite.
const roles: RoleRequirement[] = [
  { name: "Backend Developer", requiredSkills: ["JavaScript", "Node.js", "REST API", "SQL"], importantSkills: ["Express", "MongoDB", "Authentication", "Git", "Testing", "Docker"], optionalSkills: ["AWS", "Redis", "Microservices"], projectExpectations: ["Build and document a secure CRUD API", "Use a database and authentication"], interviewTopics: ["HTTP and REST", "Databases", "Authentication", "Node.js" ] },
  { name: "Full Stack Developer", requiredSkills: ["JavaScript", "HTML", "CSS", "React", "Node.js"], importantSkills: ["TypeScript", "REST API", "MongoDB", "Git", "Authentication", "Testing"], optionalSkills: ["Docker", "AWS", "Redis"], projectExpectations: ["Ship a responsive full-stack application", "Connect a frontend to a secured API"], interviewTopics: ["React", "APIs", "Databases", "JavaScript" ] },
  { name: "Frontend Developer", requiredSkills: ["HTML", "CSS", "JavaScript", "React"], importantSkills: ["TypeScript", "Git", "REST API", "Testing", "Accessibility"], optionalSkills: ["Next.js", "Figma", "Docker"], projectExpectations: ["Build a responsive accessible interface", "Consume a production-style API"], interviewTopics: ["JavaScript", "React", "CSS", "Accessibility" ] },
  { name: "Data Analyst", requiredSkills: ["Python", "SQL", "Excel", "Statistics"], importantSkills: ["Pandas", "Power BI", "Tableau", "Data Visualization", "Git"], optionalSkills: ["NumPy", "Machine Learning"], projectExpectations: ["Analyze a real dataset and communicate findings", "Build a dashboard"], interviewTopics: ["SQL", "Statistics", "Data cleaning", "Visualization" ] },
  { name: "Data Scientist", requiredSkills: ["Python", "SQL", "Statistics", "Machine Learning"], importantSkills: ["Pandas", "NumPy", "Scikit-learn", "Data Visualization", "Git"], optionalSkills: ["TensorFlow", "PyTorch", "Docker"], projectExpectations: ["Train and evaluate a reproducible model", "Explain model results with data"], interviewTopics: ["Machine learning", "Statistics", "Python", "Model evaluation" ] },
  { name: "Machine Learning Engineer", requiredSkills: ["Python", "Machine Learning", "SQL", "Git"], importantSkills: ["Scikit-learn", "Docker", "REST API", "MLOps", "Cloud"], optionalSkills: ["TensorFlow", "PyTorch", "Kubernetes"], projectExpectations: ["Deploy a model behind an API", "Track model evaluation"], interviewTopics: ["ML systems", "Model evaluation", "Python", "Deployment" ] },
  { name: "DevOps Engineer", requiredSkills: ["Linux", "Git", "Docker", "CI/CD"], importantSkills: ["AWS", "Kubernetes", "Networking", "Testing", "Scripting"], optionalSkills: ["Terraform", "Azure", "Redis"], projectExpectations: ["Containerize and deploy an application", "Create a CI/CD pipeline"], interviewTopics: ["Containers", "Cloud", "Networking", "CI/CD" ] },
  { name: "Cybersecurity Engineer", requiredSkills: ["Linux", "Networking", "Security", "Python"], importantSkills: ["Git", "Authentication", "OWASP", "Cryptography", "Testing"], optionalSkills: ["Docker", "AWS", "SIEM"], projectExpectations: ["Perform a security review or build a secure API", "Document threat mitigation"], interviewTopics: ["Web security", "Networking", "Authentication", "Linux" ] },
  { name: "Software Engineer", requiredSkills: ["JavaScript", "Git", "Data Structures", "Algorithms"], importantSkills: ["OOP", "SQL", "Testing", "REST API", "Problem Solving"], optionalSkills: ["Docker", "AWS", "System Design"], projectExpectations: ["Build a tested software project", "Explain technical decisions"], interviewTopics: ["Data structures", "Algorithms", "System design", "OOP" ] }
];

const normalise = (value: string) => value.toLowerCase().replace(/\bnode\b/g, "node.js").replace(/\s+/g, " ").trim();
export const roleRequirementService = {
  list: () => roles,
  find: (name: string) => roles.find((role) => normalise(role.name) === normalise(name)),
  normalise
};
