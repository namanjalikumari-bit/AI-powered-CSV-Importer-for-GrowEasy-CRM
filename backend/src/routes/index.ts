import { Router } from "express";
import importRoutes from "./import.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { status: "healthy" } });
});

router.use("/imports", importRoutes);

export default router;
