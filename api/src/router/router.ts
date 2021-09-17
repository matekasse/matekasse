/** Package imports */
import { Router } from "express";
import { productRouter } from "./product-router";
import { tagRouter } from "./tag-router";
import { userRouter } from "./user-router";
import { warehouseTransactionRouter } from "./warehouse-transaction-router";
import { transactionRouter } from "./transaction-router";
import { manufacturerRouter } from "./manufacturer-router";
import { constantsRouter } from "./constants-router";
import { Authentication } from "../module/authentication";

/** Variables */
export const globalRouter: Router = Router({ mergeParams: true });

/** Routes */
globalRouter.use("/tags", Authentication.verifyAccess, tagRouter);
globalRouter.use("/products", Authentication.verifyAccess, productRouter);
globalRouter.use("/users", userRouter);
globalRouter.use(
    "/manufacturers",
    Authentication.verifyAccess,
    manufacturerRouter
);
globalRouter.use(
    "/warehousetransactions",
    Authentication.verifyAccess,
    Authentication.verifyAdminAccess,
    warehouseTransactionRouter
);
globalRouter.use(
    "/transactions",
    Authentication.verifyAccess,
    transactionRouter
);
globalRouter.use("/constants", Authentication.verifyAccess, constantsRouter);
