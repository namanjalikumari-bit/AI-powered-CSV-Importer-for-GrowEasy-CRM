import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

// Some local/corporate DNS resolvers fail SRV lookups (mongodb+srv://) with
// ECONNREFUSED even though the records resolve fine elsewhere. Prefer public
// resolvers first, falling back to whatever the OS already had configured.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);

mongoose.set("strictQuery", true);

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB connection disconnected");
  });

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
