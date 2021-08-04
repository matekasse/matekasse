import { Router } from "express";
import { ManufacturerController } from "../controller/manufacturer-controller";
import { Authentication } from "../module/authentication";

export const manufacturerRouter: Router = Router({ mergeParams: true });

manufacturerRouter.get("/", ManufacturerController.getAllManufacturers);
manufacturerRouter.post(
    "/",
    Authentication.verifyAdminAccess,
    ManufacturerController.createManufacturer
);
manufacturerRouter.get(
    "/:manufacturerID",
    ManufacturerController.getManufacturerByID
);
manufacturerRouter.delete(
    "/:manufacturerID",
    Authentication.verifyAdminAccess,
    ManufacturerController.deleteManufacturerByID
);
manufacturerRouter.patch(
    "/:manufacturerID",
    Authentication.verifyAdminAccess,
    ManufacturerController.updateManufacturer
);
