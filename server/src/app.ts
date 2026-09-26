import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import resumeRouter from "./resume.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import catalogRouter from "./routes/catalog.js";
import assessmentRouter from "./routes/assessment.js";
import interviewsRouter from "./routes/interviews.js";
import progressRouter from "./routes/progress.js";
import roadmapRouter from "./routes/roadmap.js";
import adminRouter from "./routes/admin.js";
import careerReadinessRouter from "./routes/career-readiness.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], fontSrc: ["'self'", "https://fonts.gstatic.com"], imgSrc: ["'self'", "data:"], connectSrc: ["'self'"] } } }));
app.use(cors({ origin: config.client, credentials: true }));
app.use(express.json());
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use("/api/resume", resumeRouter);
app.use(healthRouter, authRouter, profileRouter, catalogRouter, assessmentRouter, interviewsRouter, progressRouter, roadmapRouter, adminRouter, careerReadinessRouter);
app.use(errorHandler);

const clientDist = join(dirname(fileURLToPath(import.meta.url)), "../../client/dist");
// Render deploys the API and Vite frontend as separate services. Serve the SPA
// only when its build output is actually included with this server deployment.
if (existsSync(join(clientDist, "index.html"))) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(join(clientDist, "index.html")));
}
