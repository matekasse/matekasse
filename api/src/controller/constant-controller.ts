import { Request, Response, NextFunction } from "express";

import { Constant } from "../entity/constant";
import { ConstantService } from "../services/constant-service";

export class ConstantController {
    public static async getAllConstants(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const constants: Constant[] =
                await ConstantService.getAllConstants();
            response.status(200).send({ constants: constants });
        } catch (error) {
            response.status(500).send({ status: "Could not load constants" });
        }
    }

    public static async createConstant(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const createdConstant = await ConstantService.createConstant(
                request.body
            );

            response.send({ status: "ok", constants: createdConstant });
        } catch (error) {
            response.status(409).send({ status: error.message });
        }
    }

    public static async updateConstant(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const updatedConstant = await ConstantService.updateConstant({
                ...request.body,
            });

            response.send({ status: "ok", constants: updatedConstant });
        } catch (error) {
            response.status(409).send({
                status: error.message,
            });
        }
    }
}
