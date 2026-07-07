import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DEEPSEEK_API_KEY: z.string().optional().default(""),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(10),
  AI_BATCH_SIZE: z.coerce.number().int().positive().default(25),
  AI_CONCURRENCY: z.coerce.number().int().positive().default(3),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
