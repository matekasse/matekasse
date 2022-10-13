import chai from "chai";
import chaiHttp from "chai-http";
import { config } from "dotenv";
import {
    createAdminTestUser,
    createNonAdminTestUser,
    authenticateTestUser,
} from "./userUtils";
import { Server } from "http";
import { Connection } from "typeorm";
import { startServer } from "../index";
import { ConstantsService } from "../services/constants-service";
import "mocha";

config();

chai.use(chaiHttp);
chai.should();

const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let adminToken = "";
let nonAdminToken = "";
let serverTest: Server;
let connectionTest: Connection;

describe("Statistics", () => {
    // Clear transactions table before each test to have a clean start
    before((done) => {
        startServer(process.env.API_PORT_TEST).then(
            ({ server, connection }) => {
                serverTest = server;
                connectionTest = connection;
                done();
            }
        );
    });

    after((done) => {
        serverTest.close(done);
        connectionTest.close();
    });

    beforeEach(async () => {
        await connectionTest.dropDatabase();
        await connectionTest.runMigrations();
        await ConstantsService.createConstants({
            stornoTime: 10000,
            crateDeposit: 150,
        });
        const adminUser = await createAdminTestUser();
        const nonAdminUser = await createNonAdminTestUser();
        adminToken = await authenticateTestUser(adminUser);
        nonAdminToken = await authenticateTestUser(nonAdminUser);
    });

    it("should GET overall statistics (empty)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/statistics")
            .set("Authorization", adminToken);
        response.should.have.status(200);
    });

    it("should GET overall statistics for a user (empty)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/statistics/1")
            .set("Authorization", nonAdminToken);
        response.should.have.status(200);
    });
});
