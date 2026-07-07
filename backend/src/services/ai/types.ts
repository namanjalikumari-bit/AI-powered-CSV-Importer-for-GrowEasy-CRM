import { AiRowResult, ImportOptions, ImportRowInput } from "../../types/crm";

export interface AIProvider {
  readonly name: string;
  mapBatch(rows: ImportRowInput[], options: ImportOptions): Promise<AiRowResult[]>;
}
