/** Package imports */
import { Router } from "express";
import { StatisticsController } from "../controller/statistics-controller";
import { Authentication } from "../module/authentication";

/** Variables */
export const statisticsRouter: Router = Router({ mergeParams: true });

/** Routes */
statisticsRouter.get(
    "/",
    Authentication.verifyAdminAccess,
    StatisticsController.getOverallStatistics
);
statisticsRouter.get("/:userID", StatisticsController.getStatisticsForUser);
