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
    public readonly jwtSecretKey: string;
    constructor() {
        this.databaseConnectionUrl = getEnvironmentVariable(
            process.env,
            EnvVariableNames.DatabaseConnectionUrl
        );
        this.jwtSecretKey = getEnvironmentVariable(
            process.env,
            EnvVariableNames.JWTSecretKey
        );
    }

    private getPrefix(path: string) {
        let prefix = "";
        switch (process.env.NODE_ENV) {
            case "test":
                prefix = "src";
                break;
            case "development":
            case "production":
            default:
                prefix = "dist";
                break;
        }

        return `${prefix}/${path}`;
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
            migrations: [this.getPrefix("migration/**/*.*")],
            synchronize: false,
            logging: [],
            cli: {
                migrationsDir: "src/migrations",
            },
        };
    }
}
