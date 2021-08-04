import { Router } from "express";
import { WarehouseTransactionController } from "../controller/warehouse-transaction-controller";

export const warehouseTransactionRouter: Router = Router({ mergeParams: true });

warehouseTransactionRouter.get(
    "/",
    WarehouseTransactionController.getAllWarehouseTransactions
);
warehouseTransactionRouter.post(
    "/",
    WarehouseTransactionController.createWarehouseTransaction
);
warehouseTransactionRouter.get(
    "/:warehouseTransactionID",
    WarehouseTransactionController.getWarehouseTransactionByID
);
