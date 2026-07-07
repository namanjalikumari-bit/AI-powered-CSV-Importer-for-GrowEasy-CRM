import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AiRowResult, ImportOptions, ImportRowInput } from "../../types/crm";
import { buildMappingPrompt, RESULT_ITEM_DESCRIPTION } from "./prompt";
import { AIProvider } from "./types";
import { extractJsonResultsArray, normalizeAiResults, withRetries } from "./utils";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 90_000;

export class DeepSeekProvider implements AIProvider {
  readonly name = "deepseek";

  async mapBatch(rows: ImportRowInput[], options: ImportOptions): Promise<AiRowResult[]> {
    if (!env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const prompt = buildMappingPrompt(rows, options);

    return withRetries(
      async () => {
        const response = await axios.post(
          DEEPSEEK_ENDPOINT,
          {
            model: env.DEEPSEEK_MODEL,
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are a strict JSON-only data mapping API. You never include prose, explanations, or markdown code fences in your response — only a single valid JSON object.",
              },
              {
                role: "user",
                content: `${prompt}\n\nRespond with a single JSON object of the exact shape: { "results": AiRowResult[] } where each entry of "results" is: ${RESULT_ITEM_DESCRIPTION}`,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: REQUEST_TIMEOUT_MS,
          }
        );

        const content: string | undefined = response.data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from DeepSeek");
        }

        const parsed = JSON.parse(content);
        const results = extractJsonResultsArray(parsed);
        return normalizeAiResults(results, rows);
      },
      MAX_RETRIES,
      RETRY_BASE_DELAY_MS,
      (err, attempt) => {
        logger.warn({ err: serializeError(err), attempt }, "DeepSeek batch call failed, retrying");
      }
    );
  }
}

function serializeError(err: unknown): unknown {
  if (axios.isAxiosError(err)) {
    return { status: err.response?.status, data: err.response?.data, message: err.message };
  }
  return err;
}
