import { productionConfig } from "./config.js";
import { startServer } from "./infrastructure/server.js";

productionConfig();
void startServer().catch((error) => {
  console.error("Database connection failed.");
  console.error(error instanceof Error ? error.message : String(error));
  console.error("Check your MongoDB URI, Atlas Network Access and internet connection.");
  process.exit(1);
});
