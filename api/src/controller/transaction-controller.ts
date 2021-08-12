import { Request, Response, NextFunction } from "express";

import { Transaction, TransactionType } from "../entity/transaction";
import { TransactionService } from "../services/transaction-service";
import { UserService } from "../services/user-service";
import { User } from "../entity/user";

export class TransactionController {
    public static async getAllTransactions(
        request: Request,
        response: Response
    ): Promise<any> {
        try {
            const transactions: Transaction[] = await TransactionService.getAllTransactions();

            return response.status(200).send({ transactions });
        } catch (error) {
            return response.status(500).send({ status: error.message });
        }
    }

    public static async getTransactionsForUser(
        request: Request,
        response: Response
    ): Promise<any> {
        const verifiedUser = request.body.verifiedUser;
        try {
            const transactions: Transaction[] = await TransactionService.getAllTransactionsForUser(
                {
                    user: verifiedUser
                }
            );

            transactions.forEach(transaction => {
                if (transaction.toUser.id !== verifiedUser.id) {
                    delete transaction.toUser.balance;
                    delete transaction.toUser.createdAt;
                    delete transaction.toUser.updatedAt;
                    delete transaction.toUser.id;
                    delete transaction.toUser.isAdmin;
                    delete transaction.toUser.isDisabled;
                } else if (transaction.fromUser.id !== verifiedUser.id) {
                    delete transaction.fromUser.balance;
                    delete transaction.fromUser.createdAt;
                    delete transaction.fromUser.updatedAt;
                    delete transaction.fromUser.id;
                    delete transaction.fromUser.isAdmin;
                    delete transaction.fromUser.isDisabled;
                }
            });

            return response.status(200).send({ transactions });
        } catch (error) {
            return response.status(500).send({ status: error.message });
        }
    }

    public static async createTransaction(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<any> {
        const verifiedUserID = request.body.verifiedUserID;
        const fromUserID = request.body.fromUserID;
        const toUserID = request.body.toUserID;
        const amountOfMoneyInCents = request.body.amountOfMoneyInCents;
        const productID = request.body.productID;
        const stornoOfTransactionID = request.body.stornoOfTransactionID;
        const typeOfTransactionBody = request.body.typeOfTransaction;
        const verifiedUser = request.body.verifiedUser;
        let typeOfTransaction: TransactionType;

        if (
            typeOfTransactionBody !== undefined ||
            (amountOfMoneyInCents !== undefined && amountOfMoneyInCents < 0)
        ) {
            return response
                .status(400)
                .send({ status: "Arguments missing or wrong" });
        }

        if (
            amountOfMoneyInCents === undefined &&
            productID !== undefined &&
            toUserID === undefined &&
            stornoOfTransactionID === undefined
        ) {
            typeOfTransaction = TransactionType.order;

            if (
                fromUserID !== undefined &&
                verifiedUserID !== fromUserID &&
                !verifiedUser.isAdmin
            ) {
                return response.status(401).send({
                    status: "Not allowed to create transaction for other user"
                });
            }

            if (
                !verifiedUser.isAdmin ||
                (verifiedUser.isAdmin && fromUserID === undefined)
            ) {
                request.body.fromUserID = verifiedUserID;
            }

            try {
                const createdTransaction = await TransactionService.createOrderTransaction(
                    {
                        typeOfTransaction,
                        ...request.body
                    }
                );

                return response.send({
                    status: "ok",
                    createdTransaction
                });
            } catch (error) {
                if (error.message === "Cannot order a disabled product!") {
                    return response.status(400).send({ status: error.message });
                } else {
                    return response.status(500).send({ status: error.message });
                }
            }
        } else if (
            amountOfMoneyInCents === undefined &&
            fromUserID === undefined &&
            toUserID === undefined &&
            productID === undefined &&
            stornoOfTransactionID !== undefined
        ) {
            typeOfTransaction = TransactionType.storno;

            try {
                const previousTransaction = await TransactionService.getTransactionByID(
                    {
                        transactionID: request.body.stornoOfTransactionID
                    }
                );

                if (
                    previousTransaction.fromUser.id !== verifiedUserID &&
                    !verifiedUser.isAdmin
                ) {
                    return response.status(401).send({
                        status:
                            "Not allowed to storno transaction for other user"
                    });
                }
            } catch (error) {
                return response.status(500).send({ status: error.message });
            }

            try {
                const createdTransaction = await TransactionService.createStornoTransaction(
                    {
                        typeOfTransaction,
                        ...request.body,
                        verifiedUser
                    }
                );

                return response.send({
                    status: "ok",
                    createdTransaction
                });
            } catch (error) {
                return response.status(500).send({ status: error.message });
            }
        } else if (
            amountOfMoneyInCents !== undefined &&
            productID === undefined &&
            stornoOfTransactionID === undefined &&
            toUserID !== undefined &&
            fromUserID !== undefined
        ) {
            typeOfTransaction = TransactionType.gift;

            if (verifiedUserID !== fromUserID && !verifiedUser.isAdmin) {
                return response.status(401).send({
                    status:
                        "Not allowed to create gift transaction for other user"
                });
            }

            try {
                const createdTransaction = await TransactionService.createGiftTransaction(
                    {
                        typeOfTransaction,
                        ...request.body
                    }
                );

                return response.send({
                    status: "ok",
                    createdTransaction
                });
            } catch (error) {
                return response.status(500).send({ status: error.message });
            }
        } else {
            return response
                .status(400)
                .send({ status: "Arguments missing or wrong" });
        }
    }

    public static async getTransactionByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<any> {
        const transactionID = request.params.transactionID;

        if (!transactionID) {
            return response
                .status(404)
                .send({ status: "No transaction ID transmitted" });
        }

        try {
            const transaction = await TransactionService.getTransactionByID({
                transactionID
            });

            return response.send({ status: "ok", transaction });
        } catch (error) {
            return response.status(404).send({ status: error.message });
        }
    }
}
