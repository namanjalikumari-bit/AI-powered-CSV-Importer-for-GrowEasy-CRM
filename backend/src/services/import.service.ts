import { Types } from "mongoose";
import { logger } from "../config/logger";
import { ImportModel } from "../models/Import";
import { LeadModel } from "../models/Lead";
import { SkippedRecordModel } from "../models/SkippedRecord";
import { AiRowResult, ImportOptions, ImportRowInput } from "../types/crm";
import { isValidCrmStatus, isValidDataSource, mapRowsWithAi } from "./ai/ai.service";

function hasValue(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!hasValue(value)) return null;
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

interface EnforcedRow {
  rowIndex: number;
  raw: Record<string, string>;
  keep: boolean;
  reason?: string;
  lead?: {
    created_at: Date | null;
    name: string | null;
    email: string | null;
    country_code: string | null;
    mobile_without_country_code: string | null;
    company: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    lead_owner: string | null;
    crm_status: string | null;
    crm_note: string | null;
    data_source: string | null;
    possession_time: string | null;
    description: string | null;
  };
}

function enforceBusinessRules(
  result: AiRowResult,
  row: ImportRowInput,
  options: ImportOptions
): EnforcedRow {
  const data = result.data;
  const email = data?.email ?? null;
  const mobile = data?.mobile_without_country_code ?? null;

  if (result.status === "SKIPPED" || (!hasValue(email) && !hasValue(mobile))) {
    return {
      rowIndex: row.rowIndex,
      raw: row.raw,
      keep: false,
      reason: result.skipReason ?? "Missing both email and mobile number",
    };
  }

  const crmStatus = isValidCrmStatus(data?.crm_status) ? (data?.crm_status as string) : null;
  const dataSource = isValidDataSource(data?.data_source)
    ? (data?.data_source as string)
    : options.defaultDataSource ?? null;
  const leadOwner = hasValue(data?.lead_owner ?? null)
    ? (data?.lead_owner as string)
    : options.defaultLeadOwner ?? null;

  return {
    rowIndex: row.rowIndex,
    raw: row.raw,
    keep: true,
    lead: {
      created_at: parseDate(data?.created_at ?? null),
      name: data?.name ?? null,
      email,
      country_code: data?.country_code ?? null,
      mobile_without_country_code: mobile,
      company: data?.company ?? null,
      city: data?.city ?? null,
      state: data?.state ?? null,
      country: data?.country ?? null,
      lead_owner: leadOwner,
      crm_status: crmStatus,
      crm_note: data?.crm_note ?? null,
      data_source: dataSource,
      possession_time: data?.possession_time ?? null,
      description: data?.description ?? null,
    },
  };
}

export interface RunImportResult {
  importId: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  status: "COMPLETED" | "FAILED";
}

export async function runImport(
  fileName: string,
  fileSizeBytes: number,
  rows: ImportRowInput[],
  options: ImportOptions
): Promise<RunImportResult> {
  const importDoc = await ImportModel.create({
    fileName,
    fileSizeBytes,
    totalRows: rows.length,
    status: "PROCESSING",
    defaultDataSource: options.defaultDataSource,
    defaultLeadOwner: options.defaultLeadOwner,
    startedAt: new Date(),
  });

  try {
    const aiResults = await mapRowsWithAi(rows, options);
    const rowsByIndex = new Map(rows.map((r) => [r.rowIndex, r]));

    const enforced = aiResults.map((result) => {
      const row = rowsByIndex.get(result.rowIndex);
      if (!row) {
        throw new Error(`Row index ${result.rowIndex} missing from source rows`);
      }
      return enforceBusinessRules(result, row, options);
    });

    const toImport = enforced.filter((r) => r.keep && r.lead);
    const toSkip = enforced.filter((r) => !r.keep);

    if (toImport.length > 0) {
      await LeadModel.insertMany(
        toImport.map((r) => ({
          importId: importDoc._id,
          rowIndex: r.rowIndex,
          raw: r.raw,
          ...r.lead,
        })),
        { ordered: false }
      );
    }

    if (toSkip.length > 0) {
      await SkippedRecordModel.insertMany(
        toSkip.map((r) => ({
          importId: importDoc._id,
          rowIndex: r.rowIndex,
          raw: r.raw,
          reason: r.reason ?? "Unknown",
        })),
        { ordered: false }
      );
    }

    importDoc.importedCount = toImport.length;
    importDoc.skippedCount = toSkip.length;
    importDoc.status = "COMPLETED";
    importDoc.completedAt = new Date();
    await importDoc.save();

    return {
      importId: importDoc._id.toString(),
      totalRows: rows.length,
      importedCount: toImport.length,
      skippedCount: toSkip.length,
      status: "COMPLETED",
    };
  } catch (err) {
    logger.error({ err, importId: importDoc._id.toString() }, "Import processing failed");
    importDoc.status = "FAILED";
    importDoc.errorMessage = err instanceof Error ? err.message : "Unknown error";
    importDoc.completedAt = new Date();
    await importDoc.save();
    throw err;
  }
}

export async function listImportHistory(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ImportModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ImportModel.countDocuments(),
  ]);
  return { items, total, page, limit };
}

export interface OverallStats {
  totalImports: number;
  totalLeads: number;
  totalSkipped: number;
}

export async function getOverallStats(): Promise<OverallStats> {
  const [totalImports, totalLeads, totalSkipped] = await Promise.all([
    ImportModel.countDocuments(),
    LeadModel.countDocuments(),
    SkippedRecordModel.countDocuments(),
  ]);
  return { totalImports, totalLeads, totalSkipped };
}

export async function getImportDetail(importId: string) {
  if (!Types.ObjectId.isValid(importId)) {
    return null;
  }
  const importDoc = await ImportModel.findById(importId).lean();
  if (!importDoc) return null;

  const [leads, skipped] = await Promise.all([
    LeadModel.find({ importId }).sort({ rowIndex: 1 }).lean(),
    SkippedRecordModel.find({ importId }).sort({ rowIndex: 1 }).lean(),
  ]);

  return { import: importDoc, leads, skipped };
}
