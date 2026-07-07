import { Router } from "express";
import { csvUpload } from "../middleware/upload";
import {
  confirmImport,
  getImportById,
  getImportHistory,
  getImportMeta,
  getStats,
} from "../controllers/import.controller";

const router = Router();

router.post("/", csvUpload.single("file"), confirmImport);
router.get("/", getImportHistory);
router.get("/meta/options", getImportMeta);
router.get("/stats/summary", getStats);
router.get("/:id", getImportById);

export default router;
