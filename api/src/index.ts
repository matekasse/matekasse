/** Package imports */
import express from "express";
import * as bodyParser from "body-parser";
import fileUpload from "express-fileupload";

import "reflect-metadata";

import { globalRouter } from "./router/router";
import { Authentication, JWTToken } from "./module/authentication";
import { Server } from "http";
import { Connection, createConnection } from "typeorm";
import { Config } from "./config/config";
import { firstStartupInit } from "./initial-start-up-configuration";

export const startServer = async (port: string) => {
    if (port === undefined) {
        throw new Error('Please define a port');
    }

    let dbConnection: Connection
    const configuration = new Config();

    try {
        dbConnection = await createConnection(configuration.getOrmConfiguration());
    } catch (error) {
        console.log(error);
        throw new Error('could not create database connection');
    }

    return new Promise<{ server: Server; connection: Connection }>(
        (resolve, reject) => {
            /** Variables */
            const app: express.Application = express();

            /** Global middleware */
            app.use(bodyParser.json());
            app.use(fileUpload());
            app.use(async (req, res, next) => {
                const jwt: string = req.get("Authorization");
                if (jwt) {
                    try {
                        const decodedToken = (await Authentication.verifyToken(
                            jwt
                        )) as JWTToken;
                        req.token = decodedToken;
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    req.token = null;
                }
                next();
            });

            /** Routes */
            app.use("/api", globalRouter);

            const server = app.listen(port, () => {
                console.log(`Server is running on port ${port}...`);
            });

            resolve({ server, connection: dbConnection });
        }
    );
};

startServer(process.env.API_PORT).then(async () => {
    await firstStartupInit();
}).catch((error) => {
    console.log(`could not start because: ${error}`);
})
