import { Request, Response, NextFunction } from "express";

import { Manufacturer } from "../entity/manufacturer";
import { ManufacturerService } from "../services/manufacturer-service";

export class ManufacturerController {
    public static async getAllManufacturers(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const manufacturers: Manufacturer[] =
                await ManufacturerService.getAllManufacturers();
            response.status(200).send({ manufacturers: manufacturers });
        } catch (error) {
            response
                .status(500)
                .send({ status: "Could not load manufacturers" });
        }
    }

    public static async createManufacturer(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const name = request.body.name;

        if (!name) {
            response.status(404).send({ status: "Arguments missing" });

            return;
        }
        try {
            const createdManufacturer =
                await ManufacturerService.createManufacturer(request.body);

            response.send({ status: "ok", manufacturer: createdManufacturer });
        } catch (error) {
            response.status(409).send({
                status: "A manufacturer with this name already exists",
            });
        }
    }

    public static async getManufacturerByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const manufacturerID = request.params.manufacturerID;

        if (!manufacturerID) {
            response.status(404).send({ status: "Not found" });

            return;
        }

        try {
            const manufacturer = await ManufacturerService.getManufacturerByID({
                manufacturerID: manufacturerID,
            });
            response.send({ status: "ok", manufacturer: manufacturer });
        } catch (error) {
            response.status(404).send({ status: "No manufacturer found" });
        }
    }

    public static async deleteManufacturerByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const manufacturerID = request.params.manufacturerID;

        if (!manufacturerID) {
            response.status(404).send({ status: "Not found" });

            return;
        }

        try {
            const manufacturer =
                await ManufacturerService.deleteManufacturerByID({
                    manufacturerID: manufacturerID,
                });
            response.send({ status: "ok", manufacturer });
        } catch (error) {
            response.status(404).send({
                status: "Could not delete manufacturer. Probably there does not exist a manufacturer with this id or there are still products by this manufacturer left.",
            });
        }
    }

    public static async updateManufacturer(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const manufacturerID = request.params.manufacturerID;

        if (!manufacturerID) {
            response.status(404).send({ status: "No manufacturer found" });

            return;
        }
        try {
            const createdManufacturer =
                await ManufacturerService.updateManufacturerByID({
                    manifacturerID: manufacturerID,
                    ...request.body,
                });

            response.send({ status: "ok", manufacturer: createdManufacturer });
        } catch (error) {
            response.status(409).send({
                status: "A manufacturer with this name already exists",
            });
        }
    }
}
