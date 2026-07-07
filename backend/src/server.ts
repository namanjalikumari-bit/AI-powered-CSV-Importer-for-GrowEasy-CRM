import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase, disconnectDatabase } from "./config/db";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`GrowEasy CSV Importer API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  server.requestTimeout = 5 * 60 * 1000;
  server.headersTimeout = 5 * 60 * 1000 + 1000;

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
