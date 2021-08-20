import { Router } from "express";
import { ConstantController } from "../controller/constant-controller";

export const constantRouter: Router = Router({ mergeParams: true });

constantRouter.get("/", ConstantController.getAllConstants);
constantRouter.patch("/:constantKey", ConstantController.updateConstant);
