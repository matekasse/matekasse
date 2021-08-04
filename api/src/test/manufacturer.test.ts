/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { Manufacturer } from "../entity/manufacturer";
import { config } from "dotenv";
import { startServer } from "../index";
import { Server } from "http";
import { Connection } from "typeorm";
import { createTestUser, authenticateTestUser } from "./userUtils";
import { ConstantsService } from "../services/constants-service";
import "mocha";

config();

/** Chai plugins */
chai.use(chaiHttp);
chai.should();

/** Variables */
const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let token = "";
let serverTest: Server;
let connectionTest: Connection;

/** Tests */
describe("Manufacturers", () => {
    /** Clear transactions table before each test to have a clean start */
    before(done => {
        startServer(process.env.API_PORT_TEST).then(
            ({ server, connection }) => {
                serverTest = server;
                connectionTest = connection;
                done();
            }
        );
    });

    after(done => {
        serverTest.close(done);
        connectionTest.close();
    });

    beforeEach(async () => {
        token = "";
        await connectionTest.dropDatabase();
        await connectionTest.synchronize();
        await ConstantsService.createConstants({
            stornoTime: 10000,
            crateDeposit: 150
        });
        const user = await createTestUser();
        token = await authenticateTestUser(user);
    });

    it("should GET all manufacturers (empty array)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/manufacturers")
            .set("Authorization", token);
        response.should.have.status(200);
        response.body.should.include.key("manufacturers");
        response.body.manufacturers.should.be.a("array");
        response.body.manufacturers.length.should.be.eql(0);
    });

    it("should create a manufacturer", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        manufacturerResponse.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
    });

    it("should create a manufacturer and a product", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        const productResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send({
                name: "TestProduct",
                bottleDepositInCents: 100,
                priceInCents: 150,
                manufacturerID: manufacturerResponse.body.manufacturer.id
            });

        productResponse.should.have.status(200);
        manufacturerResponse.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
        productResponse.body.product.manufacturer.name.should.be.eql(
            manufacturer.name
        );
    });

    it("should create a manufacturer, a product and get manufacturer by id", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        const productResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send({
                name: "Helles",
                bottleDepositInCents: 100,
                priceInCents: 150,
                manufacturerID: manufacturerResponse.body.manufacturer.id
            });

        const getManufacturerResponse = await chai
            .request(baseUrl)
            .get(
                "/api/manufacturers/" +
                    manufacturerResponse.body.manufacturer.id
            )
            .set("Authorization", token)
            .send(manufacturer);

        productResponse.should.have.status(200);
        manufacturerResponse.should.have.status(200);
        getManufacturerResponse.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
        productResponse.body.product.manufacturer.name.should.be.eql(
            manufacturer.name
        );
    });

    it("should delete a manufacturer, if no product exists", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        const deleteManufacturerResponse = await chai
            .request(baseUrl)
            .delete(
                "/api/manufacturers/" +
                    manufacturerResponse.body.manufacturer.id
            )
            .set("Authorization", token)
            .send(manufacturer);

        deleteManufacturerResponse.should.have.status(200);
        manufacturerResponse.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
    });
    it("should create three manufacturers and get all manufacturers", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        const manufacturer2 = new Manufacturer({
            name: "Pfungstädter"
        });

        const manufacturer3 = new Manufacturer({
            name: "Warsteiner"
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        let manufacturerResponse2 = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer2);

        let manufacturerResponse3 = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer3);

        const getManufacturersResponse = await chai
            .request(baseUrl)
            .get("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        manufacturerResponse.should.have.status(200);
        manufacturerResponse2.should.have.status(200);
        manufacturerResponse3.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
        manufacturerResponse2.body.manufacturer.name.should.be.eql(
            manufacturer2.name
        );
        manufacturerResponse2.body.manufacturer.name.should.be.eql(
            manufacturer2.name
        );

        getManufacturersResponse.should.have.status(200);
        getManufacturersResponse.body.manufacturers.should.be.a("array");
        getManufacturersResponse.body.manufacturers[0].products.should.be.a(
            "array"
        );
        getManufacturersResponse.body.manufacturers[0].should.include.key(
            "name"
        );
        getManufacturersResponse.body.manufacturers[1].should.include.key(
            "name"
        );
        getManufacturersResponse.body.manufacturers[2].should.include.key(
            "name"
        );
    });

    it("should not create nameless manufacturer", async () => {
        const manufacturer = new Manufacturer({
            name: ""
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        manufacturerResponse.should.have.status(404);
    });

    it("should not create manufacturer if name exists", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        const manufacturer2 = new Manufacturer({
            name: "Braustübl"
        });
        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        let manufacturerResponse2 = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer2);

        manufacturerResponse.should.have.status(200);
        manufacturerResponse2.should.have.status(409);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
    });

    it("should create three manufacturers, products for the manufacturers and get all manufacturers", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl"
        });

        const manufacturer2 = new Manufacturer({
            name: "Pfungstädter"
        });

        const manufacturer3 = new Manufacturer({
            name: "Warsteiner"
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        let manufacturerResponse2 = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer2);

        let manufacturerResponse3 = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer3);

        const productResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send({
                name: "Helles",
                bottleDepositInCents: 100,
                priceInCents: 150,
                manufacturerID: manufacturerResponse.body.manufacturer.id
            });

        const productResponse2 = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send({
                name: "Schwarzbier",
                bottleDepositInCents: 100,
                priceInCents: 350,
                describptions: "Gutes Schwarzbier",
                manufacturerID: manufacturerResponse2.body.manufacturer.id
            });

        const productResponse3 = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send({
                name: "Pisswasser",
                bottleDepositInCents: 100,
                priceInCents: 100,
                describptions: "Wer hat ein Warsteiner bestellt?",
                manufacturerID: manufacturerResponse3.body.manufacturer.id
            });

        const productResponse4 = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send({
                name: "Pils",
                bottleDepositInCents: 100,
                priceInCents: 170,
                manufacturerID: manufacturerResponse.body.manufacturer.id
            });

        const getManufacturersResponse = await chai
            .request(baseUrl)
            .get("/api/manufacturers")
            .set("Authorization", token)
            .send(manufacturer);

        manufacturerResponse.should.have.status(200);
        manufacturerResponse2.should.have.status(200);
        manufacturerResponse3.should.have.status(200);

        productResponse.should.have.status(200);
        productResponse2.should.have.status(200);
        productResponse3.should.have.status(200);
        productResponse4.should.have.status(200);

        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
        manufacturerResponse2.body.manufacturer.name.should.be.eql(
            manufacturer2.name
        );
        manufacturerResponse2.body.manufacturer.name.should.be.eql(
            manufacturer2.name
        );

        getManufacturersResponse.should.have.status(200);
        getManufacturersResponse.body.manufacturers.should.be.a("array");
        getManufacturersResponse.body.manufacturers[0].products.should.be.a(
            "array"
        );
        getManufacturersResponse.body.manufacturers[0].name.should.be.eql(
            manufacturer.name
        );
        getManufacturersResponse.body.manufacturers[1].name.should.be.eql(
            manufacturer2.name
        );
        getManufacturersResponse.body.manufacturers[2].name.should.be.eql(
            manufacturer3.name
        );
        getManufacturersResponse.body.manufacturers[0].products[0].should.have.any.key(
            "description"
        );
        getManufacturersResponse.body.manufacturers[1].products[0].should.have.any.key(
            "description"
        );
        getManufacturersResponse.body.manufacturers[2].products[0].should.have.any.key(
            "description"
        );
    });
});
