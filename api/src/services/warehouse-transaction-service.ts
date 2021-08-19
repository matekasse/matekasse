import { getRepository, getManager } from "typeorm";
import { WarehouseTransaction } from "../entity/warehouse-transaction";
import { Product } from "../entity/product";
import { User } from "../entity/user";
import { ProductService } from "./product-service";
import { UserService } from "./user-service";
import { ConstantService } from "./constant-service";

export class WarehouseTransactionService {
    private static getWarehouseTransactionRepository() {
        return getRepository(WarehouseTransaction);
    }

    public static async getAllWarehouseTransactions(): Promise<
        WarehouseTransaction[]
    > {
        const warehouseTransactionRepository =
            this.getWarehouseTransactionRepository();

        return await warehouseTransactionRepository
            .createQueryBuilder("warehouseTransaction")
            .leftJoinAndSelect("warehouseTransaction.product", "product")
            .leftJoinAndSelect("warehouseTransaction.user", "user")
            .getMany();
    }

    public static async createWarehouseTransaction(options: {
        productID: string;
        userID: string;
        quantity: number;
        pricePerItemInCents: number;
        depositPerItemInCents: number;
        withCrate: boolean;
    }): Promise<WarehouseTransaction> {
        let product: Product;
        let user: User;

        try {
            product = await ProductService.getProductByID({
                productID: options.productID,
            });
        } catch (error) {
            throw new Error("No product found!");
        }

        try {
            user = await UserService.getUserByID({ userID: options.userID });
        } catch (error) {
            throw new Error("No user found!");
        }

        if (options.quantity == 0) {
            throw new Error("Quantity 0 is useless!");
        }

        let totalInCents =
            (options.pricePerItemInCents + options.depositPerItemInCents) *
            options.quantity;

        let totalDepositInCents =
            options.depositPerItemInCents * options.quantity;

        const crateDeposit = await ConstantService.getConstantByName({
            key: "crateDeposit",
        });

        if (options.withCrate) {
            totalInCents += crateDeposit;
            totalDepositInCents += crateDeposit;
        }

        const warehouseTransaction = new WarehouseTransaction({
            product,
            user,
            quantity: options.quantity,
            pricePerItemInCents: options.pricePerItemInCents,
            depositPerItemInCents: options.depositPerItemInCents,
            totalInCents,
            totalDepositInCents,
            withCrate: options.withCrate,
        });

        product.stock += options.quantity;

        if (product.stock < 0) {
            throw new Error("No negative stock allowed");
        }

        let createdWarehouseTransaction: WarehouseTransaction;

        await getManager().transaction(async (transactionalEntityManager) => {
            createdWarehouseTransaction = await transactionalEntityManager.save(
                warehouseTransaction
            );
            await transactionalEntityManager.save(product);
        });

        return createdWarehouseTransaction;
    }

    public static async getWarehouseTransactionByID(options: {
        warehouseTransactionID: string;
    }): Promise<WarehouseTransaction> {
        const warehouseTransactionRepository =
            this.getWarehouseTransactionRepository();
        try {
            return await warehouseTransactionRepository.findOneOrFail(
                options.warehouseTransactionID
            );
        } catch (error) {
            throw new Error("No warehouseTransaction found");
        }
    }
}
