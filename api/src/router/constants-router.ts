import { Router } from "express";
import { ConstantsController } from "../controller/constants-controller";

export const constantsRouter: Router = Router({ mergeParams: true });

constantsRouter.get("/", ConstantsController.getAllConstants);
constantsRouter.patch("/", ConstantsController.updateConstants);
