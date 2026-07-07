import { Schema, model, Types } from "mongoose";
import { CRM_STATUSES, DATA_SOURCES } from "../types/crm";

export interface LeadDocument {
  _id: Types.ObjectId;
  importId: Types.ObjectId;
  rowIndex: number;
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
  raw: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<LeadDocument>(
  {
    importId: { type: Schema.Types.ObjectId, ref: "Import", required: true, index: true },
    rowIndex: { type: Number, required: true },
    created_at: { type: Date, default: null },
    name: { type: String, default: null },
    email: { type: String, default: null, index: true },
    country_code: { type: String, default: null },
    mobile_without_country_code: { type: String, default: null, index: true },
    company: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    lead_owner: { type: String, default: null },
    crm_status: { type: String, enum: [...CRM_STATUSES, null], default: null },
    crm_note: { type: String, default: null },
    data_source: { type: String, enum: [...DATA_SOURCES, null], default: null },
    possession_time: { type: String, default: null },
    description: { type: String, default: null },
    raw: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

leadSchema.index({ importId: 1, rowIndex: 1 }, { unique: true });
leadSchema.index({ createdAt: -1 });

export const LeadModel = model<LeadDocument>("Lead", leadSchema);
