import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import router from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/api/health" } }));

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use("/api", router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
