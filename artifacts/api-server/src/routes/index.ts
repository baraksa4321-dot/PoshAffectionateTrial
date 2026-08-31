import { Router, type IRouter } from "express";
import { getProteinCatalogSyncStatus } from "../lib/protein-catalog-sync";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);

router.get("/protein-catalog/status", (_req, res) => {
  res.json(getProteinCatalogSyncStatus());
});

export default router;
