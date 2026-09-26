import type { Server } from "node:http";
import { app } from "../app.js";
import { config } from "../config.js";
import { mongoose } from "../models/index.js";

export async function startServer() {
  await mongoose.connect(config.mongo, { serverSelectionTimeoutMS: 10000 });
  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`AstroCareer API running on port ${config.port}`);
    console.log(`Frontend allowed from: ${config.client}`);
  });
  registerShutdown(server);
}

function registerShutdown(server: Server) {
  const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
}
