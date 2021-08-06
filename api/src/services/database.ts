import { createConnection, Connection } from "typeorm";

export class DatabaseConnection {
    public static async connect() {
        console.log("Connecting to database...");

        return await createConnection({
            type: "postgres",
            host: process.env.DBHOST,
            port: Number(process.env.DBPORT),
            username: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBDATABASE,
            logging: false,
            entities: [__dirname + "../../entity/*.ts"],
            synchronize: true,
        });
    }

    public static async connectTest(): Promise<Connection> {
        return await createConnection({
            name: "test-connection",
            type: "postgres",
            host: process.env.DBHOST,
            port: Number(process.env.DBPORT),
            username: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBDATABASE,
            entities: [__dirname + "../../entity/*.ts"],
            synchronize: true,
            logging: false,
        });
    }
}
