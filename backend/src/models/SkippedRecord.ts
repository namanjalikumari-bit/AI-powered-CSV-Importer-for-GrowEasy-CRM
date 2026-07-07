import { Schema, model, Types } from "mongoose";

export interface SkippedRecordDocument {
  _id: Types.ObjectId;
  importId: Types.ObjectId;
  rowIndex: number;
  reason: string;
  raw: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const skippedRecordSchema = new Schema<SkippedRecordDocument>(
  {
    importId: { type: Schema.Types.ObjectId, ref: "Import", required: true, index: true },
    rowIndex: { type: Number, required: true },
    reason: { type: String, required: true },
    raw: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

skippedRecordSchema.index({ importId: 1, rowIndex: 1 }, { unique: true });

export const SkippedRecordModel = model<SkippedRecordDocument>(
  "SkippedRecord",
  skippedRecordSchema
);
