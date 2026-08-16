import "./config";
import app from "./app";
import { logger } from "./lib/logger";
import { env } from "./config";

if (!env.port || Number.isNaN(env.port) || env.port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

app.listen(env.port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port: env.port }, "Server listening");
});
