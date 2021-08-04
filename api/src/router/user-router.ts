import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { Authentication } from "../module/authentication";
import { TransactionController } from "../controller/transaction-controller";

export const userRouter: Router = Router({ mergeParams: true });

userRouter.get("/", Authentication.verifyAccess, UserController.getRealUsers);
userRouter.get(
    "/system",
    Authentication.verifyAccess,
    Authentication.verifyAdminAccess,
    UserController.getSystemUsers
);
userRouter.get(
    "/admin",
    Authentication.verifyAccess,
    Authentication.verifyAdminAccess,
    UserController.getAdminUsers
);
userRouter.post(
    "/",
    Authentication.verifyCreateUserAccess,
    UserController.createUser
);
userRouter.get(
    "/transactions",
    Authentication.verifyAccess,
    TransactionController.getTransactionsForUser
);
userRouter.patch(
    "/password/:userID",
    Authentication.verifyAccess,
    Authentication.verifyUserToAccessOwnEndpoint,
    UserController.changePassword
);
userRouter.get(
    "/:userID",
    Authentication.verifyAccess,
    UserController.getUserByID
);
userRouter.delete(
    "/:userID",
    Authentication.verifyAccess,
    Authentication.verifyAdminAccess,
    UserController.deleteUserById
);
userRouter.patch(
    "/:userID",
    Authentication.verifyAccess,
    Authentication.verifyUserToAccessOwnEndpoint,
    UserController.patchUserByID
);
userRouter.post("/authorize", UserController.loginUser);
