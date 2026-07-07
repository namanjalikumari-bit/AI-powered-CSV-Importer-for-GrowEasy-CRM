import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AiRowResult, CRM_STATUSES, DATA_SOURCES, ImportOptions, ImportRowInput, MappedLeadFields } from "../../types/crm";
import { DeepSeekProvider } from "./deepseek.provider";
import { GeminiProvider } from "./gemini.provider";
import { AIProvider } from "./types";

/**
 * Provider order = fallback chain: DeepSeek (primary) is tried first; if it fails
 * (missing key, invalid JSON, repeated transient errors) after its own retries,
 * the batch falls through to Gemini. Business logic never references a provider
 * directly — only this ordered list, so swapping/adding providers is a one-line change.
 */
const providers: AIProvider[] = [new DeepSeekProvider(), new GeminiProvider()];

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runNext(): Promise<void> {
    const current = cursor++;
    if (current >= items.length) return;
    results[current] = await worker(items[current], current);
    await runNext();
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runNext());
  await Promise.all(workers);
  return results;
}

async function processBatch(
  batch: ImportRowInput[],
  batchIndex: number,
  options: ImportOptions
): Promise<AiRowResult[]> {
  for (const provider of providers) {
    try {
      const result = await provider.mapBatch(batch, options);
      logger.info(
        { provider: provider.name, batchIndex, size: batch.length },
        "AI batch mapped successfully"
      );
      return result;
    } catch (err) {
      logger.warn(
        { provider: provider.name, batchIndex, err: err instanceof Error ? err.message : err },
        `${provider.name} failed for this batch, trying next provider`
      );
    }
  }

  logger.error({ batchIndex, size: batch.length }, "All AI providers failed for batch — skipping rows");
  return batch.map((r) => ({
    rowIndex: r.rowIndex,
    status: "SKIPPED",
    skipReason: "AI processing failed across all providers",
    data: null,
  }));
}

export async function mapRowsWithAi(
  rows: ImportRowInput[],
  options: ImportOptions
): Promise<AiRowResult[]> {
  const batches = chunk(rows, env.AI_BATCH_SIZE);

  logger.info(
    { totalRows: rows.length, batchCount: batches.length, batchSize: env.AI_BATCH_SIZE },
    "Starting AI field mapping"
  );

  const batchResults = await mapWithConcurrency(batches, env.AI_CONCURRENCY, (batch, i) =>
    processBatch(batch, i, options)
  );

  return batchResults.flat();
}

export function isValidCrmStatus(value: unknown): value is MappedLeadFields["crm_status"] {
  return typeof value === "string" && (CRM_STATUSES as readonly string[]).includes(value);
}

export function isValidDataSource(value: unknown): value is MappedLeadFields["data_source"] {
  return typeof value === "string" && (DATA_SOURCES as readonly string[]).includes(value);
}
