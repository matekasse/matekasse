import chai from "chai";
import chaiHttp from "chai-http";
import { config } from "dotenv";
import { Server } from "http";
import { Connection } from "typeorm";
import { startServer } from "../index";
import { ConstantsService } from "../services/constants-service";
import "mocha";

config();

chai.use(chaiHttp);
chai.should();

const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let serverTest: Server;
let connectionTest: Connection;
const noToken = "";

describe("Authentication", () => {
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
    });

    it("should not GET all users endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/users")
            .set("Authorization", noToken);

        response.should.have.status(401);
        response.body.should.not.include.key("users");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all tags endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/tags")
            .set("Authorization", noToken);

        response.should.have.status(401);
        response.body.should.not.include.key("tags");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all products endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/products")
            .set("Authorization", noToken);
        response.should.have.status(401);
        response.body.should.not.include.key("products");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all users endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/users")
            .set("Authorization", noToken);
        response.should.have.status(401);
        response.body.should.not.include.key("users");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all manufacturers endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/manufacturers")
            .set("Authorization", noToken);
        response.should.have.status(401);
        response.body.should.not.include.key("manufacturers");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all warehouse transactions endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/warehousetransactions")
            .set("Authorization", noToken);
        response.should.have.status(401);
        response.body.should.not.include.key("warehouseTransactions");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all transactions endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/transactions")
            .set("Authorization", noToken);
        response.should.have.status(401);
        response.body.should.not.include.key("transactions");
        response.body.status.should.be.eql("unauthorized");
    });

    it("should not GET all constants endpoint without authentication", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/constants")
            .set("Authorization", noToken);

        response.should.have.status(401);
        response.body.should.not.include.key("constants");
        response.body.status.should.be.eql("unauthorized");
    });
});
