export const CRM_STATUSES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export type CrmStatus = (typeof CRM_STATUSES)[number];

export const DATA_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export type DataSource = (typeof DATA_SOURCES)[number];

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  GOOD_LEAD_FOLLOW_UP: "Good Lead - Follow Up",
  DID_NOT_CONNECT: "Did Not Connect",
  BAD_LEAD: "Bad Lead",
  SALE_DONE: "Sale Done",
};

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  leads_on_demand: "Leads On Demand",
  meridian_tower: "Meridian Tower",
  eden_park: "Eden Park",
  varah_swamy: "Varah Swamy",
  sarjapur_plots: "Sarjapur Plots",
};

export interface Lead {
  _id: string;
  importId: string;
  rowIndex: number;
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: CrmStatus | null;
  crm_note: string | null;
  data_source: DataSource | null;
  possession_time: string | null;
  description: string | null;
  raw: Record<string, string>;
  createdAt: string;
}

export interface SkippedRecord {
  _id: string;
  importId: string;
  rowIndex: number;
  reason: string;
  raw: Record<string, string>;
  createdAt: string;
}

export type ImportStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface ImportSummary {
  _id: string;
  fileName: string;
  fileSizeBytes: number;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  status: ImportStatus;
  defaultDataSource?: DataSource;
  defaultLeadOwner?: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface RunImportResult {
  importId: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  status: "COMPLETED" | "FAILED";
  headers: string[];
}

export interface ImportDetail {
  import: ImportSummary;
  leads: Lead[];
  skipped: SkippedRecord[];
}

export interface PaginatedImports {
  items: ImportSummary[];
  total: number;
  page: number;
  limit: number;
}
