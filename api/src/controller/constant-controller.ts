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
        const constantKey = request.params.constantKey;
        if (!Object.values(ConstantType).some((v) => v === constantKey)) {
            response.status(404).send({
                status: "constant key not valid",
            });
        }
        try {
            const returnConstant = await ConstantService.updateConstant({
                key: constantKey,
                value: request.body.value,
            });

            response.send({ status: "ok", constant: returnConstant });
        } catch (error) {
            response.status(409).send({
                status: error.message,
            });
        }
    }
}
