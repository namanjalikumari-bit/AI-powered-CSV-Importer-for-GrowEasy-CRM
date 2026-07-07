import axios, { AxiosError } from "axios";
import { DataSource, ImportDetail, PaginatedImports, RunImportResult } from "@/types/crm";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5 * 60 * 1000,
});

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  details?: unknown;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function toApiError(err: unknown): ApiRequestError {
  if (err instanceof AxiosError) {
    const payload = err.response?.data as ApiEnvelope<unknown> | undefined;
    return new ApiRequestError(
      payload?.message ?? err.message ?? "Request failed",
      err.response?.status,
      payload?.details
    );
  }
  return new ApiRequestError(err instanceof Error ? err.message : "Unknown error");
}

export interface ConfirmImportOptions {
  defaultDataSource?: DataSource;
  defaultLeadOwner?: string;
  onUploadProgress?: (percent: number) => void;
}

export async function confirmImportRequest(
  file: File,
  options: ConfirmImportOptions
): Promise<RunImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.defaultDataSource) {
    formData.append("defaultDataSource", options.defaultDataSource);
  }
  if (options.defaultLeadOwner) {
    formData.append("defaultLeadOwner", options.defaultLeadOwner);
  }

  try {
    const response = await httpClient.post<ApiEnvelope<RunImportResult>>("/imports", formData, {
      onUploadProgress: (event) => {
        if (!options.onUploadProgress || !event.total) return;
        options.onUploadProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function fetchImportHistory(page = 1, limit = 20): Promise<PaginatedImports> {
  try {
    const response = await httpClient.get<ApiEnvelope<PaginatedImports>>("/imports", {
      params: { page, limit },
    });
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function fetchImportDetail(importId: string): Promise<ImportDetail> {
  try {
    const response = await httpClient.get<ApiEnvelope<ImportDetail>>(`/imports/${importId}`);
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export interface OverallStats {
  totalImports: number;
  totalLeads: number;
  totalSkipped: number;
}

export async function fetchOverallStats(): Promise<OverallStats> {
  try {
    const response = await httpClient.get<ApiEnvelope<OverallStats>>("/imports/stats/summary");
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export interface ImportMeta {
  crmStatuses: string[];
  dataSources: string[];
}

export async function fetchImportMeta(): Promise<ImportMeta> {
  try {
    const response = await httpClient.get<ApiEnvelope<ImportMeta>>("/imports/meta/options");
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

/**
 * Lightweight, independent client used only to detect a cold-starting Render
 * backend so the UI can show honest "waking up" messaging instead of a bare
 * skeleton. Kept separate from `httpClient` so its shorter timeout never
 * affects real data requests (which may legitimately take longer to warm up).
 */
const healthClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

export async function pingHealth(): Promise<boolean> {
  try {
    await healthClient.get("/health");
    return true;
  } catch {
    return false;
  }
}
