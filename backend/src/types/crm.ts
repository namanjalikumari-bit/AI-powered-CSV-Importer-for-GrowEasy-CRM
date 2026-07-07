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

export interface MappedLeadFields {
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
}

export interface AiRowResult {
  rowIndex: number;
  status: "MAPPED" | "SKIPPED";
  skipReason: string | null;
  data: MappedLeadFields | null;
}

export interface ImportRowInput {
  rowIndex: number;
  raw: Record<string, string>;
}

export interface ImportOptions {
  defaultDataSource?: DataSource;
  defaultLeadOwner?: string;
}

export interface SkippedRecordInput {
  rowIndex: number;
  raw: Record<string, string>;
  reason: string;
}
