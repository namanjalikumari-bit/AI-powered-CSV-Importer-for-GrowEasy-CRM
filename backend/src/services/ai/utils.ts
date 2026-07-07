import { AiRowResult, ImportRowInput } from "../../types/crm";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetries<T>(
  fn: (attempt: number) => Promise<T>,
  maxRetries: number,
  baseDelayMs: number,
  onRetryError: (err: unknown, attempt: number) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      onRetryError(err, attempt);
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * (attempt + 1));
      }
    }
  }

  throw lastError;
}

/** Ensures exactly one result per input row, filling gaps with a safe skip. */
export function normalizeAiResults(
  results: AiRowResult[],
  rows: ImportRowInput[]
): AiRowResult[] {
  const byIndex = new Map(results.map((r) => [r.rowIndex, r]));

  return rows.map((row) => {
    const found = byIndex.get(row.rowIndex);
    if (!found) {
      return {
        rowIndex: row.rowIndex,
        status: "SKIPPED",
        skipReason: "AI did not return a result for this row",
        data: null,
      };
    }
    return found;
  });
}

export function extractJsonResultsArray(parsed: unknown): AiRowResult[] {
  if (Array.isArray(parsed)) return parsed as AiRowResult[];
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).results)) {
    return (parsed as { results: AiRowResult[] }).results;
  }
  throw new Error("AI response did not contain a results array");
}
