import { Router } from "express";
import { ConstantsController } from "../controller/constants-controller";
import { Authentication } from "../module/authentication";

export const constantsRouter: Router = Router({ mergeParams: true });

constantsRouter.get(
    "/",
    ConstantsController.getAllConstants
);
constantsRouter.patch(
    "/",
    ConstantsController.updateConstants
);
