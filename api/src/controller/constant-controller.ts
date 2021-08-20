import { Request, Response, NextFunction } from "express";

import { Constant, ConstantType } from "../entity/constant";
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

    public static async updateConstant(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        if (!Object.values(ConstantType).includes(request.body.key)) {
            response.status(404).send({
                status: "constant key not valid",
            });
        }
        try {
            await ConstantService.updateConstant({
                ...request.body,
            });

            response.send({ status: "ok" });
        } catch (error) {
            response.status(409).send({
                status: error.message,
            });
        }
    }
}
