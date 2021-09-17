import { getRepository, getManager } from "typeorm";
import { Transaction, TransactionType } from "../entity/transaction";
import { Product } from "../entity/product";
import { User } from "../entity/user";
import { ProductService } from "./product-service";
import { UserService } from "./user-service";
import { ConstantsService } from "./constants-service";
import { ConstantType } from "../entity/constants";

export class TransactionService {
    private static getTransactionRepository() {
        return getRepository(Transaction);
    }

    public static async getAllTransactions() {
        const transactionRepository = this.getTransactionRepository();
        let transactions: Transaction[];
        try {
            transactions = await transactionRepository.find();
        } catch (error) {
            throw new Error(error);
        }

        // Own implementation of lazy loading.
        let newTransaction = transactions.map(async (transaction) => {
            if (transaction.stornoOfTransactionID !== null) {
                try {
                    transaction.stornoOfTransaction =
                        await transactionRepository.findOneOrFail(
                            transaction.stornoOfTransactionID
                        );
                } catch (error) {
                    throw new Error(
                        "Something went wrong while getting all transactions"
                    );
                }

                return transaction;
            } else {
                return transaction;
            }
        });

        return Promise.all(newTransaction);
    }

    public static async getAllTransactionsForUser(options: { user: User }) {
        const transactionRepository = this.getTransactionRepository();
        let transactions: Transaction[];

        try {
            transactions = await transactionRepository.find({
                where: [
                    { fromUser: options.user.id },
                    { toUser: options.user.id },
                ],
                order: {
                    id: "DESC",
                },
            });
        } catch (error) {
            throw new Error(
                "Something went wrong while getting all transactions"
            );
        }

        // Own implementation of lazy loading.
        let newTransaction = transactions.map(async (transaction) => {
            if (transaction.stornoOfTransactionID !== null) {
                try {
                    transaction.stornoOfTransaction =
                        await transactionRepository.findOneOrFail(
                            transaction.stornoOfTransactionID
                        );
                } catch (error) {
                    throw new Error("Could not load all transactions.");
                }

                return transaction;
            } else {
                return transaction;
            }
        });

        return Promise.all(newTransaction);
    }

    public static async createOrderTransaction(options: {
        fromUserID: string;
        productID: string;
        typeOfTransaction: TransactionType;
    }): Promise<Transaction> {
        let product: Product;
        let fromUser: User;

        try {
            product = await ProductService.getProductByID({
                productID: options.productID,
            });
        } catch (error) {
            throw new Error("No product found!");
        }

        if (product.isDisabled) {
            throw new Error("Cannot order a disabled product!");
        }

        let amountOfMoneyInCents = product.priceInCents;
        let fromUserID = options.fromUserID;
        let toUser = await UserService.getBankUser();

        try {
            fromUser = await UserService.getUserByID({
                userID: fromUserID,
            });
        } catch (error) {
            throw new Error("No fromUser found!");
        }

        const transaction = new Transaction({
            fromUser: fromUser,
            toUser: toUser,
            product: product ? product : null,
            amountOfMoneyInCents: amountOfMoneyInCents,
            stornoOfTransactionID: null,
            typeOfTransaction: options.typeOfTransaction,
        });

        // Updated balance here, so it is in one transaction.
        if (fromUser.balance - amountOfMoneyInCents < 0) {
            throw new Error("User does not have enough money.");
        }

        if (product.stock <= 0) {
            throw new Error("Not enough stock available.");
        }

        fromUser.balance -= amountOfMoneyInCents;
        toUser.balance += amountOfMoneyInCents;
        product.stock -= 1;

        let createdTransaction: Transaction;

        await getManager().transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(fromUser);
            await transactionalEntityManager.save(toUser);
            await transactionalEntityManager.save(product);
            createdTransaction = await transactionalEntityManager.save(
                transaction
            );
        });

        return createdTransaction;
    }

    public static async createStornoTransaction(options: {
        amountOfMoneyInCents: number;
        stornoOfTransactionID: string;
        typeOfTransaction: TransactionType;
        verifiedUser: User;
    }): Promise<Transaction> {
        let stornoOfTransaction: Transaction;
        let product: Product;

        try {
            stornoOfTransaction = await TransactionService.getTransactionByID({
                transactionID: options.stornoOfTransactionID,
            });
        } catch (error) {
            throw new Error("No transaction found!");
        }

        if (stornoOfTransaction.typeOfTransaction === TransactionType.storno) {
            throw new Error("Can't storno a storno transaction");
        }

        // Storno only allowed if not longer than a defined number of seconds ago.
        let stornoTime: Number;
        try {
            stornoTime = await ConstantsService.getConstantByName({
                constantName: ConstantType.stornoTime,
            });
        } catch (error) {
            throw new Error("Error getting constants");
        }
        const currentTime = Date.now();
        if (
            currentTime - Number(stornoOfTransaction.createdAt) > stornoTime &&
            !options.verifiedUser.isAdmin
        ) {
            throw new Error("Storno time has run out!");
        }

        const amountOfMoneyInCents = stornoOfTransaction.amountOfMoneyInCents;
        let fromUser = stornoOfTransaction.toUser;
        let toUser = stornoOfTransaction.fromUser;

        const transaction = new Transaction({
            fromUser: fromUser,
            toUser: toUser,
            product: stornoOfTransaction.product,
            amountOfMoneyInCents: amountOfMoneyInCents,
            stornoOfTransactionID: options.stornoOfTransactionID,
            typeOfTransaction: options.typeOfTransaction,
        });

        // Updates balance here, so it is in one transaction.
        if (stornoOfTransaction.product !== null) {
            product = stornoOfTransaction.product;
            product.stock += 1;
        }
        fromUser.balance -= amountOfMoneyInCents;
        toUser.balance += amountOfMoneyInCents;

        let createdTransaction: Transaction;

        await getManager().transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(fromUser);
            await transactionalEntityManager.save(toUser);
            if (product !== undefined) {
                await transactionalEntityManager.save(product);
            }
            createdTransaction = await transactionalEntityManager.save(
                transaction
            );
        });
        return createdTransaction;
    }

    public static async createGiftTransaction(options: {
        fromUserID: string;
        toUserID: string;
        amountOfMoneyInCents: number;
        typeOfTransaction: TransactionType;
    }): Promise<Transaction> {
        let fromUser: User;
        let toUser: User;

        const amountOfMoneyInCents = options.amountOfMoneyInCents;
        const fromUserID = options.fromUserID;
        const toUserID = options.toUserID;

        try {
            fromUser = await UserService.getUserByID({
                userID: fromUserID,
            });
        } catch (error) {
            throw new Error("No fromUser found!");
        }

        try {
            toUser = await UserService.getUserByID({
                userID: toUserID,
            });
        } catch (error) {
            throw new Error("No toUser found!");
        }

        if (toUser.isDisabled) {
            throw new Error("Can't gift money to a disabled user!");
        }

        const transaction = new Transaction({
            fromUser: fromUser,
            toUser: toUser,
            product: null,
            amountOfMoneyInCents: amountOfMoneyInCents,
            stornoOfTransactionID: null,
            typeOfTransaction: options.typeOfTransaction,
        });

        // Updates balance here, so it is in one transaction.
        if (
            !fromUser.isSystemUser &&
            fromUser.balance - amountOfMoneyInCents < 0
        ) {
            throw new Error("User does not have enough money.");
        }
        fromUser.balance -= amountOfMoneyInCents;
        toUser.balance += amountOfMoneyInCents;

        let createdTransaction: Transaction;

        await getManager().transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(fromUser);
            await transactionalEntityManager.save(toUser);
            createdTransaction = await transactionalEntityManager.save(
                transaction
            );
        });

        return createdTransaction;
    }

    public static async getTransactionByID(options: {
        transactionID: string;
    }): Promise<Transaction> {
        const transactionRepository = this.getTransactionRepository();
        let transaction: Transaction;
        try {
            transaction = await transactionRepository.findOneOrFail(
                options.transactionID
            );
            if (transaction.stornoOfTransactionID !== null) {
                transaction.stornoOfTransaction =
                    await transactionRepository.findOneOrFail(
                        transaction.stornoOfTransactionID
                    );
            }
        } catch (error) {
            throw new Error("Could not load all transactions.");
        }
        return transaction;
    }
}
