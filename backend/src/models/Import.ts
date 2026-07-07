import { Schema, model, Types } from "mongoose";

export type ImportStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface ImportDocument {
  _id: Types.ObjectId;
  fileName: string;
  fileSizeBytes: number;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  status: ImportStatus;
  defaultDataSource?: string;
  defaultLeadOwner?: string;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const importSchema = new Schema<ImportDocument>(
  {
    fileName: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    totalRows: { type: Number, required: true, default: 0 },
    importedCount: { type: Number, required: true, default: 0 },
    skippedCount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING",
      required: true,
    },
    defaultDataSource: { type: String },
    defaultLeadOwner: { type: String },
    errorMessage: { type: String },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

importSchema.index({ createdAt: -1 });

export const ImportModel = model<ImportDocument>("Import", importSchema);
