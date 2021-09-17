/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { ConstantsService } from "../services/constants-service";
import { config } from "dotenv";
import { startServer } from "../index";
import { Server } from "http";
import { Connection } from "typeorm";
import {
    createAdminTestUser,
    authenticateTestUser,
    createNonAdminTestUser,
} from "./userUtils";
import "mocha";

config();

/** Chai plugins */
chai.use(chaiHttp);
chai.should();

/** Variables */
const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let adminToken = "";
let nonAdminToken = "";
let serverTest: Server;
let connectionTest: Connection;

/** Tests */
describe("Constants", () => {
    /** Clear transactions table before each test to have a clean start */
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
        adminToken = "";
        await connectionTest.dropDatabase();
        await connectionTest.synchronize();
        await ConstantsService.createConstants({
            stornoTime: 10000,
            crateDeposit: 150,
        });
        const adminUser = await createAdminTestUser();
        adminToken = await authenticateTestUser(adminUser);
        const normalUser = await createNonAdminTestUser();
        nonAdminToken = await authenticateTestUser(normalUser);
    });

    it("should GET all constants", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/constants")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.should.include.key("constants");
        response.body.constants.should.be.a("object");
        response.body.constants.stornoTime.should.be.eql(10000);
        response.body.constants.crateDeposit.should.be.eql(150);
    });

    it("should not PATCH all constants as non admin user", async () => {
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/constants")
            .set("Authorization", nonAdminToken)
            .send({
                stornoTime: 15000,
                crateDeposit: 200,
                currencySymbol: "Gulden",
            });
        updateResponse.should.have.status(403);
        updateResponse.body.should.not.include.key("constants");
        updateResponse.body.status.should.be.eql("Not allowed to access");
    });

    it("should PATCH constants", async () => {
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/constants")
            .set("Authorization", adminToken)
            .send({
                stornoTime: 15000,
                crateDeposit: 200,
                currencySymbol: "Gulden",
            });

        updateResponse.should.have.status(200);
        updateResponse.body.should.include.key("constants");
        updateResponse.body.constants.stornoTime.should.be.eql(15000);
        updateResponse.body.constants.crateDeposit.should.be.eql(200);

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/constants")
            .set("Authorization", adminToken);

        getResponse.should.have.status(200);
        getResponse.body.should.include.key("constants");
        getResponse.body.constants.should.be.a("object");
        getResponse.body.constants.stornoTime.should.be.eql(15000);
        getResponse.body.constants.crateDeposit.should.be.eql(200);
    });

    it("should not PATCH constants with incompatible type for constant", async () => {
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/constants")
            .set("Authorization", adminToken)
            .send({ stornoTime: "abc", crateDeposit: 150 });

        updateResponse.should.have.status(409);

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/constants")
            .set("Authorization", adminToken);

        getResponse.should.have.status(200);
        getResponse.body.should.include.key("constants");
        getResponse.body.constants.should.be.a("object");
        getResponse.body.constants.stornoTime.should.be.eql(10000);
        getResponse.body.constants.crateDeposit.should.be.eql(150);
    });
});
