import { Router, type IRouter } from "express";
import healthRouter from "./health";
import crewRouter from "./crew";

const router: IRouter = Router();

router.use(healthRouter);
router.use(crewRouter);

export default router;
