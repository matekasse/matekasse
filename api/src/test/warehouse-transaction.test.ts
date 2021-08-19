/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { WarehouseTransaction } from "../entity/warehouse-transaction";
import { config } from "dotenv";
import { User } from "../entity/user";
import { Product } from "../entity/product";
import { Server } from "http";
import { Connection } from "typeorm";
import { startServer } from "..";
import { createAdminTestUser, authenticateTestUser } from "./userUtils";
import { ConstantsService } from "../services/constants-service";
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
describe("WarehouseTransactions", () => {
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
    });

    it("should GET all warehouse transactions (empty array)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/warehousetransactions")
            .set("Authorization", adminToken);
        response.should.have.status(200);
        response.body.should.include.key("warehouseTransactions");
        response.body.warehouseTransactions.should.be.a("array");
        response.body.warehouseTransactions.length.should.be.eql(0);
    });

    it("should create a warehouseTransaction by id and add stock to product", async () => {
        const warehouseTransaction = {
            productID: 1,
            userID: 2,
            quantity: 10,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createProductResponse.should.have.status(200);
        createProductResponse.body.product.should.include.key("name");
        createProductResponse.body.product.name.should.be.eql("TestProduct");

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createUserResponse.should.have.status(200);
        createUserResponse.body.user.should.include.key("name");
        createUserResponse.body.user.name.should.be.eql("NewUser");

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);
        createWarehouseTransactionResponse.should.have.status(200);
        createWarehouseTransactionResponse.body.warehouseTransaction.should.include.key(
            "user"
        );
        createWarehouseTransactionResponse.body.warehouseTransaction.user.name.should.be.eql(
            "NewUser"
        );

        createWarehouseTransactionResponse.body.warehouseTransaction.should.include.key(
            "product"
        );
        createWarehouseTransactionResponse.body.warehouseTransaction.product.name.should.be.eql(
            "TestProduct"
        );

        const createdWarehouseTransaction: WarehouseTransaction =
            createWarehouseTransactionResponse.body.warehouseTransaction;
        const getResponse = await chai
            .request(baseUrl)
            .get("/api/warehousetransactions/" + createdWarehouseTransaction.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("warehouseTransaction");
        getResponse.body.warehouseTransaction.should.be.a("object");
        getResponse.body.warehouseTransaction.should.have
            .property("id")
            .eql(createdWarehouseTransaction.id);
        getResponse.body.warehouseTransaction.should.have
            .property("totalInCents")
            .eql(1600);
        getResponse.body.warehouseTransaction.should.have
            .property("totalDepositInCents")
            .eql(100);

        const updatedProductResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createProductResponse.body.product.id)
            .set("Authorization", adminToken)
            .send(product);

        updatedProductResponse.should.have.status(200);
        updatedProductResponse.body.product.should.include.key("stock");
        updatedProductResponse.body.product.stock.should.be.eql(10);
    });

    it("should not create an incomplete warehouseTransaction (missing user and product)", async () => {
        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);
        createWarehouseTransactionResponse.should.have.status(500);
    });

    it("should create a warehouseTransaction by id and remove stock from product to stock 0", async () => {
        const warehouseTransactionAddStock = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        const warehouseTransactionRemoveStock = {
            productID: 1,
            userID: 2,
            quantity: -10,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createProductResponse.should.have.status(200);
        createProductResponse.body.product.should.include.key("name");
        createProductResponse.body.product.name.should.be.eql("TestProduct");

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createUserResponse.should.have.status(200);
        createUserResponse.body.user.should.include.key("name");
        createUserResponse.body.user.name.should.be.eql("NewUser");

        const createWarehouseTransactionRemoveResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransactionAddStock);
        createWarehouseTransactionRemoveResponse.should.have.status(200);

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransactionRemoveStock);
        createWarehouseTransactionResponse.should.have.status(200);
        createWarehouseTransactionResponse.body.warehouseTransaction.should.include.key(
            "user"
        );
        createWarehouseTransactionResponse.body.warehouseTransaction.user.name.should.be.eql(
            "NewUser"
        );

        createWarehouseTransactionResponse.body.warehouseTransaction.should.include.key(
            "product"
        );
        createWarehouseTransactionResponse.body.warehouseTransaction.product.name.should.be.eql(
            "TestProduct"
        );

        const createdWarehouseTransaction: WarehouseTransaction =
            createWarehouseTransactionResponse.body.warehouseTransaction;
        const getResponse = await chai
            .request(baseUrl)
            .get("/api/warehousetransactions/" + createdWarehouseTransaction.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("warehouseTransaction");
        getResponse.body.warehouseTransaction.should.be.a("object");
        getResponse.body.warehouseTransaction.should.have
            .property("id")
            .eql(createdWarehouseTransaction.id);

        const updatedProductResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createProductResponse.body.product.id)
            .set("Authorization", adminToken)
            .send(product);

        updatedProductResponse.should.have.status(200);
        updatedProductResponse.body.product.should.include.key("stock");
        updatedProductResponse.body.product.stock.should.be.eql(0);
    });

    it("should create a warehouseTransaction by id and remove stock from product to negative stock", async () => {
        const warehouseTransaction = {
            productID: 1,
            userID: 2,
            quantity: -10,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createProductResponse.should.have.status(200);
        createProductResponse.body.product.should.include.key("name");
        createProductResponse.body.product.name.should.be.eql("TestProduct");

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createUserResponse.should.have.status(200);
        createUserResponse.body.user.should.include.key("name");
        createUserResponse.body.user.name.should.be.eql("NewUser");

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        createWarehouseTransactionResponse.should.have.status(500);
        createWarehouseTransactionResponse.body.status.should.be.eql(
            "No negative stock allowed"
        );
    });

    it("should create a warehouseTransaction with crate option and add stock to product", async () => {
        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: true,
        };

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createProductResponse.should.have.status(200);
        createProductResponse.body.product.should.include.key("name");
        createProductResponse.body.product.name.should.be.eql("TestProduct");

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createUserResponse.should.have.status(200);
        createUserResponse.body.user.should.include.key("name");
        createUserResponse.body.user.name.should.be.eql("NewUser");

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);
        createWarehouseTransactionResponse.should.have.status(200);
        createWarehouseTransactionResponse.body.warehouseTransaction.should.include.key(
            "user"
        );
        createWarehouseTransactionResponse.body.warehouseTransaction.user.name.should.be.eql(
            "Pferdinand"
        );

        createWarehouseTransactionResponse.body.warehouseTransaction.should.include.key(
            "product"
        );
        createWarehouseTransactionResponse.body.warehouseTransaction.product.name.should.be.eql(
            "TestProduct"
        );

        const createdWarehouseTransaction: WarehouseTransaction =
            createWarehouseTransactionResponse.body.warehouseTransaction;
        const getResponse = await chai
            .request(baseUrl)
            .get("/api/warehousetransactions/" + createdWarehouseTransaction.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("warehouseTransaction");
        getResponse.body.warehouseTransaction.should.be.a("object");
        getResponse.body.warehouseTransaction.should.have
            .property("id")
            .eql(createdWarehouseTransaction.id);
        getResponse.body.warehouseTransaction.should.have
            .property("totalInCents")
            .eql(1750);
        getResponse.body.warehouseTransaction.should.have
            .property("totalDepositInCents")
            .eql(250);

        const updatedProductResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createProductResponse.body.product.id)
            .set("Authorization", adminToken)
            .send(product);

        updatedProductResponse.should.have.status(200);
        updatedProductResponse.body.product.should.include.key("stock");
        updatedProductResponse.body.product.stock.should.be.eql(10);
    });

    it("should not create a warehouseTransaction with amount 0", async () => {
        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 0,
            pricePerItemInCents: 150,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createProductResponse.should.have.status(200);
        createProductResponse.body.product.should.include.key("name");
        createProductResponse.body.product.name.should.be.eql("TestProduct");

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createUserResponse.should.have.status(200);
        createUserResponse.body.user.should.include.key("name");
        createUserResponse.body.user.name.should.be.eql("NewUser");

        const warehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);
        warehouseTransactionResponse.should.have.status(500);
        warehouseTransactionResponse.body.status.should.be.eql(
            "Quantity 0 is useless!"
        );
    });
});
