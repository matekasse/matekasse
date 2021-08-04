import { Request, Response, NextFunction } from "express";

import { Constants } from "../entity/constants";
import { ConstantsService } from "../services/constants-service";

export class ConstantsController {
    public static async getAllConstants(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const constants: Constants[] = await ConstantsService.getAllConstants();
            response.status(200).send({ constants: constants });
        } catch (error) {
            response.status(500).send({ status: "Could not load constants" });
        }
    }

    public static async createConstants(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const createdConstants = await ConstantsService.createConstants(
                request.body
            );

            response.send({ status: "ok", constants: createdConstants });
        } catch (error) {
            response.status(409).send({ status: error.message });
        }
    }

    public static async updateConstants(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const updatedConstants = await ConstantsService.updateConstants({
                ...request.body
            });

            response.send({ status: "ok", constants: updatedConstants });
        } catch (error) {
            response.status(409).send({
                status: error.message
            });
        }
    }
}
