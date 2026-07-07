"use client";

import { useCallback, useState } from "react";

export interface ParsedCsvRow {
  rowIndex: number;
  raw: Record<string, string>;
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedCsvRow[];
}

const MAX_FILE_SIZE_MB = 10;
const MAX_ROWS = 20_000;

export function validateCsvFile(file: File): string | null {
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  if (!isCsv) {
    return "Only .csv files are supported.";
  }
  if (file.size === 0) {
    return "This file is empty.";
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
  }
  return null;
}

interface UseCsvParserState {
  isParsing: boolean;
  error: string | null;
  result: CsvParseResult | null;
}

export function useCsvParser() {
  const [state, setState] = useState<UseCsvParserState>({
    isParsing: false,
    error: null,
    result: null,
  });

  const parse = useCallback(async (file: File) => {
    const validationError = validateCsvFile(file);
    if (validationError) {
      setState({ isParsing: false, error: validationError, result: null });
      return;
    }

    setState({ isParsing: true, error: null, result: null });

    try {
      const Papa = (await import("papaparse")).default;
      const text = await file.text();

      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (header) => header.trim(),
        transform: (value) => (typeof value === "string" ? value.trim() : value),
      });

      const fatalErrors = parsed.errors.filter((e) => e.type !== "FieldMismatch");
      if (fatalErrors.length > 0) {
        setState({
          isParsing: false,
          error: fatalErrors[0]?.message ?? "Failed to parse CSV file.",
          result: null,
        });
        return;
      }

      const headers = parsed.meta.fields ?? [];
      if (headers.length === 0) {
        setState({ isParsing: false, error: "CSV file has no header row.", result: null });
        return;
      }
      if (parsed.data.length === 0) {
        setState({ isParsing: false, error: "CSV file contains no data rows.", result: null });
        return;
      }
      if (parsed.data.length > MAX_ROWS) {
        setState({
          isParsing: false,
          error: `CSV file has ${parsed.data.length.toLocaleString()} rows, exceeding the ${MAX_ROWS.toLocaleString()} row limit.`,
          result: null,
        });
        return;
      }

      const rows: ParsedCsvRow[] = parsed.data.map((raw, index) => ({
        rowIndex: index,
        raw,
      }));

      setState({ isParsing: false, error: null, result: { headers, rows } });
    } catch (err) {
      setState({
        isParsing: false,
        error: err instanceof Error ? err.message : "Failed to parse CSV file.",
        result: null,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isParsing: false, error: null, result: null });
  }, []);

  return { ...state, parse, reset };
}
