import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AiRowResult, CRM_STATUSES, DATA_SOURCES, ImportOptions, ImportRowInput } from "../../types/crm";
import { buildMappingPrompt } from "./prompt";
import { AIProvider } from "./types";
import { extractJsonResultsArray, normalizeAiResults, withRetries } from "./utils";

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;

const leadFieldSchema = {
  type: Type.OBJECT,
  nullable: true,
  properties: {
    created_at: { type: Type.STRING, nullable: true, description: "ISO 8601 date string if present in the row" },
    name: { type: Type.STRING, nullable: true },
    email: { type: Type.STRING, nullable: true, description: "First/primary email only" },
    country_code: { type: Type.STRING, nullable: true, description: "Phone country code, e.g. +91" },
    mobile_without_country_code: {
      type: Type.STRING,
      nullable: true,
      description: "Primary phone digits without country code",
    },
    company: { type: Type.STRING, nullable: true },
    city: { type: Type.STRING, nullable: true },
    state: { type: Type.STRING, nullable: true },
    country: { type: Type.STRING, nullable: true },
    lead_owner: { type: Type.STRING, nullable: true },
    crm_status: { type: Type.STRING, nullable: true, enum: [...CRM_STATUSES] },
    crm_note: { type: Type.STRING, nullable: true, description: "Additional emails/phones and any unmapped context" },
    data_source: { type: Type.STRING, nullable: true, enum: [...DATA_SOURCES] },
    possession_time: { type: Type.STRING, nullable: true },
    description: { type: Type.STRING, nullable: true },
  },
  propertyOrdering: [
    "created_at", "name", "email", "country_code", "mobile_without_country_code",
    "company", "city", "state", "country", "lead_owner", "crm_status",
    "crm_note", "data_source", "possession_time", "description",
  ],
};

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      rowIndex: { type: Type.INTEGER },
      status: { type: Type.STRING, enum: ["MAPPED", "SKIPPED"] },
      skipReason: { type: Type.STRING, nullable: true },
      data: leadFieldSchema,
    },
    required: ["rowIndex", "status"],
    propertyOrdering: ["rowIndex", "status", "skipReason", "data"],
  },
};

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
    return this.client;
  }

  async mapBatch(rows: ImportRowInput[], options: ImportOptions): Promise<AiRowResult[]> {
    const client = this.getClient();
    const prompt = buildMappingPrompt(rows, options);

    return withRetries(
      async () => {
        const response = await client.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema as unknown as Record<string, unknown>,
            temperature: 0,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        const parsed = JSON.parse(text);
        const results = extractJsonResultsArray(parsed);
        return normalizeAiResults(results, rows);
      },
      MAX_RETRIES,
      RETRY_BASE_DELAY_MS,
      (err, attempt) => {
        logger.warn({ err, attempt }, "Gemini batch call failed, retrying");
      }
    );
  }
}
