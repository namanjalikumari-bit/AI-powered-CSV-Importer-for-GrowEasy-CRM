import Papa from "papaparse";
import { ApiError } from "../utils/ApiError";
import { ImportRowInput } from "../types/crm";

const MAX_ROWS = 20_000;

export interface ParsedCsv {
  headers: string[];
  rows: ImportRowInput[];
}

export function parseCsvBuffer(buffer: Buffer): ParsedCsv {
  const text = buffer.toString("utf-8");

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
    transform: (value) => (typeof value === "string" ? value.trim() : value),
  });

  if (result.errors.length > 0) {
    const fatalErrors = result.errors.filter((e) => e.type !== "FieldMismatch");
    if (fatalErrors.length > 0) {
      throw ApiError.badRequest("Failed to parse CSV file", {
        errors: fatalErrors.slice(0, 5),
      });
    }
  }

  const headers = result.meta.fields ?? [];
  if (headers.length === 0) {
    throw ApiError.badRequest("CSV file has no header row");
  }

  if (result.data.length === 0) {
    throw ApiError.badRequest("CSV file contains no data rows");
  }

  if (result.data.length > MAX_ROWS) {
    throw ApiError.unprocessable(
      `CSV file has ${result.data.length} rows, exceeding the ${MAX_ROWS} row limit`
    );
  }

  const rows: ImportRowInput[] = result.data.map((raw, index) => ({
    rowIndex: index,
    raw,
  }));

  return { headers, rows };
}
