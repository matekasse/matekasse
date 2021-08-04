import { Router } from "express";
import { TransactionController } from "../controller/transaction-controller";
import { Authentication } from "../module/authentication";

export const transactionRouter: Router = Router({ mergeParams: true });

transactionRouter.get(
    "/",
    Authentication.verifyAdminAccess,
    TransactionController.getAllTransactions
);
transactionRouter.post("/", TransactionController.createTransaction);
transactionRouter.get(
    "/:transactionID",
    Authentication.verifyAdminAccess,
    TransactionController.getTransactionByID
);
