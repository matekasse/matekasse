import { Request, Response, NextFunction } from "express";

import { WarehouseTransaction } from "../entity/warehouse-transaction";
import { WarehouseTransactionService } from "../services/warehouse-transaction-service";

export class WarehouseTransactionController {
    public static async getAllWarehouseTransactions(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const warehouseTransactions: WarehouseTransaction[] = await WarehouseTransactionService.getAllWarehouseTransactions();
            response.status(200).send({ warehouseTransactions });
        } catch (error) {
            response
                .status(500)
                .send({ status: "Could not load warehouse transactions" });
        }
    }

    public static async createWarehouseTransaction(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const productID = request.body.productID;
        const userID = request.body.userID;
        const quantity = request.body.quantity;
        const pricePerItemInCents = request.body.pricePerItemInCents;
        const depositPerItemInCents = request.body.depositPerItemInCents;
        const withCrate = request.body.withCrate;

        if (
            !productID ||
            !userID ||
            quantity === undefined ||
            pricePerItemInCents === undefined ||
            depositPerItemInCents === undefined ||
            withCrate === undefined
        ) {
            response.status(400).send({ status: "Arguments missing" });

            return;
        }
        try {
            const createdWarehouseTransaction = await WarehouseTransactionService.createWarehouseTransaction(
                request.body
            );

            response.send({
                status: "ok",
                warehouseTransaction: createdWarehouseTransaction
            });
        } catch (error) {
            response.status(500).send({ status: error.message });
        }
    }

    public static async getWarehouseTransactionByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const warehouseTransactionID = request.params.warehouseTransactionID;

        if (!warehouseTransactionID) {
            response
                .status(400)
                .send({ status: "No warehouseTransactionID provided" });

            return;
        }

        try {
            const warehouseTransaction = await WarehouseTransactionService.getWarehouseTransactionByID(
                {
                    warehouseTransactionID: warehouseTransactionID
                }
            );
            response.send({ status: "ok", warehouseTransaction });
        } catch (error) {
            response.status(404).send({ status: error.message });
        }
    }
}
