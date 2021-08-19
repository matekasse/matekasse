/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { ConstantService } from "../services/constant-service";
import { config } from "dotenv";
import { startServer } from "../index";
import { Server } from "http";
import { Connection } from "typeorm";
import { createAdminTestUser, authenticateTestUser } from "./userUtils";
import "mocha";

config();

/** Chai plugins */
chai.use(chaiHttp);
chai.should();

/** Variables */
const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let adminToken = "";
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
        await ConstantService.createConstant({
            key: "crateDeposit",
            value: "150",
        });
        await ConstantService.createConstant({
            key: "stornoTime",
            value: "10000",
        });
        const adminUser = await createAdminTestUser();
        adminToken = await authenticateTestUser(adminUser);
    });

    it("should GET all constants", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/constants")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.should.include.key("constants");
        response.body.constants.should.be.a("array");
        response.body.constants.length.should.be.eql(1);
        response.body.constants[0].stornoTime.should.be.eql(10000);
        response.body.constants[0].crateDeposit.should.be.eql(150);
    });

    it("should PATCH all constants", async () => {
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/constants")
            .set("Authorization", adminToken)
            .send({ stornoTime: 15000, crateDeposit: 200 });

        updateResponse.should.have.status(200);
        updateResponse.body.should.include.key("constants");

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/constants")
            .set("Authorization", adminToken);

        getResponse.should.have.status(200);
        getResponse.body.should.include.key("constants");
        getResponse.body.constants.should.be.a("array");
        getResponse.body.constants.length.should.be.eql(1);
        getResponse.body.constants[0].stornoTime.should.be.eql(15000);
        getResponse.body.constants[0].crateDeposit.should.be.eql(200);
    });
});
