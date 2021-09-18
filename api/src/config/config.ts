import { ConnectionOptions } from "typeorm";
import { Constants } from "../entity/constants";
import { Manufacturer } from "../entity/manufacturer";
import { Product } from "../entity/product";
import { Tag } from "../entity/tag";
import { Transaction } from "../entity/transaction";
import { User } from "../entity/user";
import { WarehouseTransaction } from "../entity/warehouse-transaction";
import {
    EnvVariableNames,
    getEnvironmentVariable,
} from "./environment-variables";

export class Config {
    public readonly databaseConnectionUrl: string;
    public readonly environment: string;
    constructor() {
        this.databaseConnectionUrl = getEnvironmentVariable(
            process.env,
            EnvVariableNames.DatabaseConnectionUrl
        );
        this.environment = getEnvironmentVariable(
            process.env,
            EnvVariableNames.Environment
        );
    }

    private runMigrations(): boolean {
        if (
            this.environment === "production" ||
            this.environment === "development"
        ) {
            return true;
        }

        return false;
    }

    public getOrmConfiguration(): ConnectionOptions {
        return {
            type: "postgres",
            url: this.databaseConnectionUrl,
            entities: [
                Constants,
                Manufacturer,
                Product,
                Tag,
                Transaction,
                User,
                WarehouseTransaction,
            ],
            migrations: ["src/migrations/**/*.*"],
            synchronize: false,
            migrationsRun: this.runMigrations(),
            logging: [],
            cli: {
                migrationsDir: "src/migrations",
            },
        };
    }
}
