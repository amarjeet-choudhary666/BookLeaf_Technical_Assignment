import { app } from "./app.ts";
import dotenv from "dotenv";
import { connectionDB } from "./db/index.ts";
import { createServer } from "node:http";
import { attachRealtime } from "./service/realtime.ts";
import { validateEnvironment } from "./config/env.ts";

dotenv.config();

const environment = validateEnvironment();
const server = createServer(app);
attachRealtime(server);

connectionDB()
.then(() => {
  server.listen(environment.PORT, () => {
    console.log(`BookLeaf API listening on port ${environment.PORT}`);
  });
})
.catch((err: unknown) => {
  console.error(
    "Error connecting to the database:",
    err instanceof Error ? err.message : "Unknown error",
  );
  process.exitCode = 1;
})

