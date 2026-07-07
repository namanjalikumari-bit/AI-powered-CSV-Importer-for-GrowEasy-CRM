import { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { parseCsvBuffer } from "../services/csv.service";
import {
  getImportDetail,
  getOverallStats,
  listImportHistory,
  runImport,
} from "../services/import.service";
import { CRM_STATUSES, DATA_SOURCES, DataSource } from "../types/crm";

const confirmImportSchema = z.object({
  defaultDataSource: z.enum(DATA_SOURCES).optional().or(z.literal("").transform(() => undefined)),
  defaultLeadOwner: z.string().trim().min(1).optional().or(z.literal("").transform(() => undefined)),
});

export const confirmImport = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No file uploaded. Attach a CSV file under the 'file' field.");
  }

  const parsedBody = confirmImportSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw ApiError.badRequest("Invalid import options", parsedBody.error.flatten().fieldErrors);
  }

  const { headers, rows } = parseCsvBuffer(req.file.buffer);

  const result = await runImport(req.file.originalname, req.file.size, rows, {
    defaultDataSource: parsedBody.data.defaultDataSource as DataSource | undefined,
    defaultLeadOwner: parsedBody.data.defaultLeadOwner,
  });

  return sendSuccess(res, { ...result, headers }, "Import completed");
});

export const getImportHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await listImportHistory(page, limit);
  return sendSuccess(res, result);
});

export const getImportById = asyncHandler(async (req: Request, res: Response) => {
  const detail = await getImportDetail(req.params.id);
  if (!detail) {
    throw ApiError.notFound("Import not found");
  }
  return sendSuccess(res, detail);
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getOverallStats();
  return sendSuccess(res, stats);
});

export const getImportMeta = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, {
    crmStatuses: CRM_STATUSES,
    dataSources: DATA_SOURCES,
  });
});
