/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { User } from "../entity/user";
import { Product } from "../entity/product";
import { config } from "dotenv";
import { Server } from "http";
import { Connection } from "typeorm";
import { startServer } from "../index";
import {
    createAdminTestUser,
    authenticateTestUser,
    createNonAdminTestUser
} from "./userUtils";
import { ConstantsService } from "../services/constants-service";
import "mocha";

config();

/** Chai plugins */
chai.use(chaiHttp);
chai.should();

/** Variables */
const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let adminToken = "";
let nonAdminToken = "";
let adminUser: User;
let normalUser: User;
let serverTest: Server;
let connectionTest: Connection;

/** Tests */
describe("Transaction", () => {
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
        await connectionTest.dropDatabase();
        await connectionTest.synchronize();
        await ConstantsService.createConstants({
            stornoTime: 10000,
            crateDeposit: 150
        });
        adminUser = await createAdminTestUser();
        adminToken = await authenticateTestUser(adminUser);
        normalUser = await createNonAdminTestUser();
        nonAdminToken = await authenticateTestUser(normalUser);
    });

    it("should GET all transactions (empty array)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/transactions")
            .set("Authorization", adminToken);
        response.should.have.status(200);
        response.body.should.include.key("transactions");
        response.body.transactions.should.be.a("array");
        response.body.transactions.length.should.be.eql(0);
    });

    it("should create a giftTransaction", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const user = new User({
            name: "NewUser",
            paypalName: "something@someother.de",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        const systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createUserResponse.should.have.status(200);

        const userLoginResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: user.password });

        userLoginResponse.should.have.status(200);

        const transaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: createUserResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const createTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(transaction);

        createTransactionResponse.should.have.status(200);
        createTransactionResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        createTransactionResponse.body.createdTransaction.toUser.balance.should.be.eql(
            transaction.amountOfMoneyInCents
        );
        createTransactionResponse.body.createdTransaction.toUser.id.should.be.eql(
            createUserResponse.body.user.id
        );
        createTransactionResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -transaction.amountOfMoneyInCents
        );
    });

    it("should not create an invalid transaction", async () => {
        const transaction = {
            fromUserID: "2",
            toUserID: "3"
        };

        const postResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(transaction);

        postResponse.should.have.status(400);
        postResponse.body.status.should.be.eql("Arguments missing or wrong");
    });

    it("should create a orderTransaction", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: normalUser.id,
            amountOfMoneyInCents: 2000
        };

        const postResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const orderTransaction = {
            fromUserID: normalUser.id,
            productID: "1"
        };

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(orderTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        postResponse.should.have.status(200);
        postResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        postResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        postResponse.body.createdTransaction.toUser.id.should.be.eql(
            normalUser.id
        );
        postResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );
    });

    it("should create a stornoTransaction of a orderTransaction", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const user = new User({
            name: "NewUser",
            paypalName: "something@someother.de",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let userResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: userResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            fromUserID: userResponse.body.user.id,
            productID: createProductResponse.body.product.id
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(orderTransaction);

        const stornoTransaction = {
            stornoOfTransactionID: orderResponse.body.createdTransaction.id
        };

        const stornoResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(stornoTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.toUser.id.should.be.eql(
            userResponse.body.user.id
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.should.have.status(200);
        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );

        stornoResponse.should.have.status(200);
        stornoResponse.body.createdTransaction.stornoOfTransactionID.should.be.eql(
            stornoTransaction.stornoOfTransactionID
        );
        stornoResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );
        stornoResponse.body.createdTransaction.product.name.should.be.eql(
            createProductResponse.body.product.name
        );
    });

    it("should not create a orderTransaction when product is disabled", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        const user = new User({
            name: "NewUser",
            paypalName: "something@someother.de",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let userResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: userResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const postResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            isDisabled: true
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            fromUserID: userResponse.body.user.id,
            productID: createProductResponse.body.product.id
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(orderTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        postResponse.should.have.status(200);
        postResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        postResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        postResponse.body.createdTransaction.toUser.id.should.be.eql(
            userResponse.body.user.id
        );
        postResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.should.have.status(400);
    });

    it("should not create a stornoTransaction after 10 seconds", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: adminUser.id,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: normalUser.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            fromUserID: normalUser.id,
            productID: createProductResponse.body.product.id
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", nonAdminToken)
            .send(orderTransaction);

        const stornoTransaction = {
            stornoOfTransactionID: orderResponse.body.createdTransaction.id
        };

        await new Promise(r => setTimeout(r, 11000));

        const stornoResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", nonAdminToken)
            .send(stornoTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );

        stornoResponse.should.have.status(500);
        stornoResponse.body.status.should.be.eql("Storno time has run out!");
    }).timeout(15000);

    it("should create a stornoTransaction after 10 seconds when you are admin", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const user = new User({
            name: "NewUser",
            paypalName: "something@someother.de",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let userResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: userResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            fromUserID: userResponse.body.user.id,
            productID: createProductResponse.body.product.id
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(orderTransaction);

        const stornoTransaction = {
            stornoOfTransactionID: orderResponse.body.createdTransaction.id
        };

        await new Promise(r => setTimeout(r, 11000));

        const stornoResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(stornoTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.toUser.id.should.be.eql(
            userResponse.body.user.id
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.should.have.status(200);
        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );

        stornoResponse.should.have.status(200);
        stornoResponse.body.createdTransaction.stornoOfTransactionID.should.be.eql(
            stornoTransaction.stornoOfTransactionID
        );
    }).timeout(15000);

    it("should not create a transaction for another user", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const notAdminUser = new User({
            name: "Peter",
            paypalName: "",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: adminUser.id,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let notAdminUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(notAdminUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: notAdminUserResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            fromUserID: notAdminUserResponse.body.user.id,
            productID: createProductResponse.body.product.id
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", nonAdminToken)
            .send(orderTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        orderResponse.should.have.status(401);
        orderResponse.body.status.should.be.eql(
            "Not allowed to create transaction for other user"
        );
    });

    it("should create a orderTransaction for another user as admin", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const notAdminUser = new User({
            name: "Peter",
            paypalName: "",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: adminUser.id,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let notAdminUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(notAdminUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: notAdminUserResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            fromUserID: notAdminUserResponse.body.user.id,
            productID: createProductResponse.body.product.id
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(orderTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        orderResponse.should.have.status(200);
        orderResponse.body.createdTransaction.fromUser.id.should.be.eql(
            notAdminUserResponse.body.user.id
        );
    });

    it("should create a stornoTransaction of a giftTransaction as user", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: normalUser.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const giftTransaction2 = {
            fromUserID: normalUser.id,
            toUserID: systemUserResponse.body.user.id,
            amountOfMoneyInCents: 500
        };

        const giftResponse2 = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", nonAdminToken)
            .send(giftTransaction2);

        const stornoTransaction = {
            stornoOfTransactionID: giftResponse2.body.createdTransaction.id
        };

        const stornoResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(stornoTransaction);

        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.toUser.id.should.be.eql(
            normalUser.id
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        giftResponse2.should.have.status(200);
        giftResponse2.body.createdTransaction.fromUser.id.should.be.eql(
            normalUser.id
        );
        giftResponse2.body.createdTransaction.toUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse2.body.createdTransaction.fromUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents -
                giftTransaction2.amountOfMoneyInCents
        );
        giftResponse2.body.createdTransaction.fromUser.id.should.be.eql(
            normalUser.id
        );
        giftResponse2.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction2.amountOfMoneyInCents -
                giftTransaction.amountOfMoneyInCents
        );

        stornoResponse.should.have.status(200);
        stornoResponse.body.createdTransaction.stornoOfTransactionID.should.be.eql(
            stornoTransaction.stornoOfTransactionID
        );
        stornoResponse.body.createdTransaction.stornoOfTransactionID.should.be.eql(
            giftResponse2.body.createdTransaction.id
        );

        stornoResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );
        stornoResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
    });

    it("should create a stornoTransaction of a giftTransaction as admin", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const user = new User({
            name: "NewUser",
            paypalName: "something@someother.de",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345"
        });

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let userResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: userResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const stornoTransaction = {
            stornoOfTransactionID: giftResponse.body.createdTransaction.id
        };

        const stornoResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(stornoTransaction);

        giftResponse.should.have.status(200);
        giftResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftResponse.body.createdTransaction.toUser.id.should.be.eql(
            userResponse.body.user.id
        );
        giftResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        stornoResponse.should.have.status(200);
        stornoResponse.body.createdTransaction.stornoOfTransactionID.should.be.eql(
            stornoTransaction.stornoOfTransactionID
        );
        stornoResponse.body.createdTransaction.stornoOfTransactionID.should.be.eql(
            giftResponse.body.createdTransaction.id
        );

        stornoResponse.body.createdTransaction.toUser.balance.should.be.eql(0);
        stornoResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            0
        );
    });

    it("should not  create a giftTransaction to a disabled user", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const user = new User({
            name: "NewUser",
            paypalName: "something@someother.de",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: true,
            password: "12345"
        });

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        let userResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: userResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const giftResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        giftResponse.should.have.status(500);
        giftResponse.body.status.should.be.eql(
            "Can't gift money to a disabled user!"
        );
    });

    it("should not include password in user in a orderTransaction", async () => {
        const bankUser = new User({
            name: "Bank",
            paypalName: "",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345"
        });

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: normalUser.id,
            amountOfMoneyInCents: 2000
        };

        const postResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const orderTransaction = {
            fromUserID: normalUser.id,
            productID: "1"
        };

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(orderTransaction);

        createWarehouseTransactionResponse.should.have.status(200);
        postResponse.should.have.status(200);
        postResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        postResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        postResponse.body.createdTransaction.toUser.id.should.be.eql(
            normalUser.id
        );
        postResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );

        orderResponse.body.createdTransaction.fromUser.should.not.include.key(
            "password"
        );
        orderResponse.body.createdTransaction.toUser.should.not.include.key(
            "password"
        );
    });
});
