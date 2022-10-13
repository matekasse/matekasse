import { Transaction } from "../entity/transaction";
import { TransactionService } from "./transaction-service";
import { UserService } from "./user-service";

export interface StatisticEntry {
    Name: string;
    Counter: number;
}

export class StatisticsService {
    public static async getStatisticsForUser(options: {
        userId: string;
    }): Promise<Array<StatisticEntry>> {
        const user = await UserService.getUserByID({ userID: options.userId });
        const transactionsOfUser =
            await TransactionService.getAllTransactionsForUser({ user: user });

        return this.getStatistics(transactionsOfUser);
    }

    public static async getOverallStatistics(): Promise<Array<StatisticEntry>> {
        const transactions = await TransactionService.getAllTransactions();

        return this.getStatistics(transactions);
    }

    public static async getStatistics(
        transactions: Transaction[]
    ): Promise<Array<StatisticEntry>> {
        let statistics = new Map<string, number>();

        await Promise.all(
            transactions.map(async (transaction) => {
                let product = await transaction.product;
                if (product === null) {
                    return;
                }
                let foundElement = statistics.has(product.name);

                if (!foundElement) {
                    statistics.set(product.name, 1);
                } else {
                    const value = statistics.get(product.name);
                    statistics.set(product.name, value + 1);
                }
            })
        );

        let stats: Array<StatisticEntry> = [];
        statistics.forEach((value: number, key: string) => {
            stats.push({
                Name: key,
                Counter: value,
            });
        });

        return stats;
    }
}
