import chai from "chai";
import chaiHttp from "chai-http";
import { User } from "../entity/user";
import { config } from "dotenv";
import { Server } from "http";
import { Connection } from "typeorm";
import { startServer } from "../index";
import { ConstantsService } from "../services/constants-service";
import {
    createAdminTestUser,
    authenticateTestUser,
    createNonAdminTestUser,
} from "./userUtils";
import { Product } from "../entity/product";
import "mocha";

config();

chai.use(chaiHttp);
chai.should();

const baseUrl: string = `${process.env.API_HOST}:${process.env.API_PORT_TEST}`;
let adminToken = "";
let userToken = "";
let adminUser: User;
let nonAdminUser: User;
let serverTest: Server;
let connectionTest: Connection;

describe("Users", () => {
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
        adminUser = await createAdminTestUser();
        adminToken = await authenticateTestUser(adminUser);
        nonAdminUser = await createNonAdminTestUser();
        userToken = await authenticateTestUser(nonAdminUser);
    });

    it("should GET all users (1)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/users")
            .set("Authorization", adminToken);
        response.should.have.status(200);
        response.body.should.include.key("users");
        response.body.users.should.be.a("array");
        response.body.users.length.should.be.eql(2);
    });

    it("should GET all users and NOT include password", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/users")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.users[0].should.not.include.key("password");
        response.body.users.should.be.a("array");
        response.body.users.length.should.be.eql(2);
    });

    it("should GET all real users", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const adminUser = new User({
            name: "adminUser",
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const systemUser = new User({
            name: "systemUser",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const createResponse2 = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(systemUser);

        const createResponse3 = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(adminUser);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");
        createResponse2.should.have.status(200);
        createResponse2.body.user.should.include.key("name");
        createResponse2.body.user.name.should.be.eql("systemUser");
        createResponse3.should.have.status(200);
        createResponse3.body.user.should.include.key("name");
        createResponse3.body.user.name.should.be.eql("adminUser");

        const response = await chai
            .request(baseUrl)
            .get("/api/users/")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.should.include.key("users");
        response.body.users.should.be.a("array");
        response.body.users.length.should.be.eql(4);
    });

    it("should GET all admin users", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const adminUser = new User({
            name: "adminUser",
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const systemUser = new User({
            name: "systemUser",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const createResponse2 = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(systemUser);

        const createResponse3 = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(adminUser);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");
        createResponse2.should.have.status(200);
        createResponse2.body.user.should.include.key("name");
        createResponse2.body.user.name.should.be.eql("systemUser");
        createResponse3.should.have.status(200);
        createResponse3.body.user.should.include.key("name");
        createResponse3.body.user.name.should.be.eql("adminUser");

        const response = await chai
            .request(baseUrl)
            .get("/api/users/admin")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.should.include.key("users");
        response.body.users.should.be.a("array");
        response.body.users.length.should.be.eql(2);
    });

    it("should GET all system users", async () => {
        const user = new User({
            name: "systemUser",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const adminUser = new User({
            name: "adminUser",
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const systemUser = new User({
            name: "alsoSystemUser",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        const createResponse2 = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(systemUser);

        const createResponse3 = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(adminUser);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("systemUser");
        createResponse2.should.have.status(200);
        createResponse2.body.user.should.include.key("name");
        createResponse2.body.user.name.should.be.eql("alsoSystemUser");
        createResponse3.should.have.status(200);
        createResponse3.body.user.should.include.key("name");
        createResponse3.body.user.name.should.be.eql("adminUser");

        const response = await chai
            .request(baseUrl)
            .get("/api/users/system")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.should.include.key("users");
        response.body.users.should.be.a("array");
        response.body.users.length.should.be.eql(2);
    });

    it("should DELETE a user by id", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");
        const createdUser: User = createResponse.body.user;

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/users/" + createdUser.id)
            .set("Authorization", adminToken);
        deleteResponse.should.have.status(200);
    });

    it("should GET a user by id", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");
        const createdUser: User = createResponse.body.user;

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/users/" + createdUser.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("user");
        getResponse.body.user.should.be.a("object");
        getResponse.body.user.should.have.property("name");
        getResponse.body.user.should.have.property("id").eql(createdUser.id);
    });

    it("should not create an invalid user", async () => {
        const testUser: Partial<User> = {};
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(testUser);
        createResponse.should.have.status(404);
        createResponse.body.status.should.be.eql("Arguments missing");
    });

    it("should create a user", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");
    });

    it("should update (patch) a user by id", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");

        const createdUser: User = createResponse.body.user;
        const updatedUser = new User({
            name: "NewUser2",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/users/" + createdUser.id)
            .set("Authorization", adminToken)
            .send(updatedUser);
        updateResponse.should.have.status(200);
        updateResponse.body.user.should.include.key("name");
        updateResponse.body.user.name.should.be.eql(updatedUser.name);
        updateResponse.body.user.balance.should.be.eql(updatedUser.balance);
    });

    it("should GET all users (not empty array)", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const user2 = new User({
            name: "NewUser2",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });
        const user3 = new User({
            name: "NewUser3",
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user2);

        await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user3);

        const response = await chai
            .request(baseUrl)
            .get("/api/users")
            .set("Authorization", adminToken);
        response.should.have.status(200);
        response.body.should.include.key("users");
        response.body.users.should.be.a("array");
        response.body.users.length.should.be.eql(4);
    });

    it("user should not be allowed to update (patch) another user by id", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");

        const createdUser: User = createResponse.body.user;
        const updatedUser = new User({
            name: "NewUser2",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/users/" + createdUser.id)
            .set("Authorization", userToken)
            .send(updatedUser);
        updateResponse.should.have.status(403);
    });

    it("user should not be allowed to update (patch) another user by id", async () => {
        const user = new User({
            name: "NewUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql("NewUser");

        const createdUser: User = createResponse.body.user;
        const updatedUser = new User({
            name: "NewUser2",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/users/" + createdUser.id)
            .set("Authorization", userToken)
            .send(updatedUser);
        updateResponse.should.have.status(403);
    });

    it("user should be allowed to log into a account with correct credentials", async () => {
        const user = new User({
            name: "LoginUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(user.isAdmin);
        createResponse.body.user.isDisabled.should.be.eql(user.isDisabled);
        createResponse.body.user.isSystemUser.should.be.eql(user.isSystemUser);

        const loginResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: user.password });
        loginResponse.should.have.status(200);
        loginResponse.body.status.should.be.eql("ok");
    });

    it("user should not be allowed to log into a account with incorrect credentials", async () => {
        const user = new User({
            name: "LoginUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(user.isAdmin);
        createResponse.body.user.isDisabled.should.be.eql(user.isDisabled);
        createResponse.body.user.isSystemUser.should.be.eql(user.isSystemUser);

        const loginResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: "somewrongpassword" });
        loginResponse.should.have.status(401);
        loginResponse.body.status.should.be.eql("wrong username or password");
    });

    it("user should not be allowed to log into a systemUser", async () => {
        const user = new User({
            name: "SystemUser",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(user.isAdmin);
        createResponse.body.user.isDisabled.should.be.eql(user.isDisabled);
        createResponse.body.user.isSystemUser.should.be.eql(user.isSystemUser);

        const loginResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: user.password });
        loginResponse.body.status.should.be.eql(
            "Cannot log in to a systemUser account"
        );
        loginResponse.should.have.status(401);
    });

    it("user should not be allowed to log into a disabled account", async () => {
        const user = new User({
            name: "DisabledUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: true,
            password: "12345",
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(user.isAdmin);
        createResponse.body.user.isDisabled.should.be.eql(user.isDisabled);
        createResponse.body.user.isSystemUser.should.be.eql(user.isSystemUser);

        const loginResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: user.password });
        loginResponse.body.status.should.be.eql(
            "Cannot log in to a disabled account"
        );
        loginResponse.should.have.status(401);
    });

    it("should get all transaction of user", async () => {
        const bankUser = new User({
            name: "Bank",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false,
        };

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: nonAdminUser.id,
            amountOfMoneyInCents: 2000,
        };

        const giftTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        const orderTransaction = {
            productID: "1",
        };

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", userToken)
            .send(orderTransaction);

        const transactionsResponse = await chai
            .request(baseUrl)
            .get("/api/users/transactions/")
            .set("Authorization", userToken);

        createWarehouseTransactionResponse.should.have.status(200);
        giftTransactionResponse.should.have.status(200);
        giftTransactionResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftTransactionResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftTransactionResponse.body.createdTransaction.toUser.id.should.be.eql(
            nonAdminUser.id
        );
        giftTransactionResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );

        transactionsResponse.body.transactions[0].id.should.be.eql(
            orderResponse.body.createdTransaction.id
        );
        transactionsResponse.body.transactions[0].amountOfMoneyInCents.should.be.eql(
            orderResponse.body.createdTransaction.amountOfMoneyInCents
        );
        transactionsResponse.body.transactions[0].fromUser.name.should.be.eql(
            orderResponse.body.createdTransaction.fromUser.name
        );
        transactionsResponse.body.transactions[1].id.should.be.eql(
            giftTransactionResponse.body.createdTransaction.id
        );
        transactionsResponse.body.transactions[1].amountOfMoneyInCents.should.be.eql(
            giftTransactionResponse.body.createdTransaction.amountOfMoneyInCents
        );
        transactionsResponse.body.transactions[1].fromUser.name.should.be.eql(
            giftTransactionResponse.body.createdTransaction.fromUser.name
        );
    });

    it("user should be able to update his password", async () => {
        const user = new User({
            name: "BestUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "N00b",
        });

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

        const updateUserPasswordResponse = await chai
            .request(baseUrl)
            .patch("/api/users/password/" + createUserResponse.body.user.id)
            .set("Authorization", userLoginResponse.body.data)
            .send({ newPassword: "1337", oldPassword: user.password });
        updateUserPasswordResponse.should.have.status(200);

        const userLoginWithNewPasswordResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: "1337" });
        userLoginWithNewPasswordResponse.should.have.status(200);
    });

    it("user should not be able to update his password without correct old password", async () => {
        const user = new User({
            name: "BestUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "N00b",
        });

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

        const updateUserPasswordResponse = await chai
            .request(baseUrl)
            .patch("/api/users/password/" + createUserResponse.body.user.id)
            .set("Authorization", userLoginResponse.body.data)
            .send({ newPassword: "1337", oldPassword: "wrongN00b" });
        updateUserPasswordResponse.should.have.status(403);

        const updateUserPasswordResponse2 = await chai
            .request(baseUrl)
            .patch("/api/users/password/" + createUserResponse.body.user.id)
            .set("Authorization", userLoginResponse.body.data)
            .send({ newPassword: "1337" });
        updateUserPasswordResponse2.should.have.status(403);

        const userLoginWithNewPasswordResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: "1337" });
        userLoginWithNewPasswordResponse.should.have.status(401);
    });

    it("admin should be able to update a users password", async () => {
        const user = new User({
            name: "BestUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "N00b",
        });

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

        const updateUserPasswordResponse = await chai
            .request(baseUrl)
            .patch("/api/users/password/" + createUserResponse.body.user.id)
            .set("Authorization", adminToken)
            .send({ newPassword: "1337" });
        updateUserPasswordResponse.should.have.status(200);

        const userLoginWithNewPasswordResponse = await chai
            .request(baseUrl)
            .post("/api/users/authorize")
            .send({ name: user.name, password: "1337" });
        userLoginWithNewPasswordResponse.should.have.status(200);
    });

    it("all transaction of user should not contain private information about other users", async () => {
        const bankUser = new User({
            name: "Bank",
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        let systemUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: nonAdminUser.id,
            amountOfMoneyInCents: 2000,
        };

        const giftTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", adminToken)
            .send(giftTransaction);

        const transactionsResponse = await chai
            .request(baseUrl)
            .get("/api/users/transactions/")
            .set("Authorization", userToken);

        giftTransactionResponse.body.createdTransaction.fromUser.id.should.be.eql(
            systemUserResponse.body.user.id
        );
        giftTransactionResponse.body.createdTransaction.toUser.balance.should.be.eql(
            giftTransaction.amountOfMoneyInCents
        );
        giftTransactionResponse.body.createdTransaction.toUser.id.should.be.eql(
            nonAdminUser.id
        );
        giftTransactionResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );
        giftTransactionResponse.should.have.status(200);

        transactionsResponse.body.transactions[0].id.should.be.eql(
            giftTransactionResponse.body.createdTransaction.id
        );
        transactionsResponse.body.transactions[0].amountOfMoneyInCents.should.be.eql(
            giftTransactionResponse.body.createdTransaction.amountOfMoneyInCents
        );
        transactionsResponse.body.transactions[0].fromUser.name.should.be.eql(
            giftTransactionResponse.body.createdTransaction.fromUser.name
        );

        transactionsResponse.body.transactions[0].fromUser.should.not.contain.key(
            "id"
        );
        transactionsResponse.body.transactions[0].fromUser.should.not.contain.key(
            "idAdmin"
        );
        transactionsResponse.body.transactions[0].fromUser.should.not.contain.key(
            "isDisabled"
        );
        transactionsResponse.body.transactions[0].fromUser.should.not.contain.key(
            "balance"
        );
        transactionsResponse.body.transactions[0].fromUser.should.not.contain.key(
            "createdAt"
        );
        transactionsResponse.body.transactions[0].fromUser.should.not.contain.key(
            "updatedAt"
        );
    });

    it("should not create an admin/system user without valid admin token.", async () => {
        const user = new User({
            name: "AdminSysUser",
            isAdmin: true,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", userToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(false);
        createResponse.body.user.isSystemUser.should.be.eql(false);
    });

    it("should not create an admin/system user without token.", async () => {
        const user = new User({
            name: "AdminSysUser",
            isAdmin: true,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(false);
        createResponse.body.user.isSystemUser.should.be.eql(false);
    });

    it("should create an admin/system user with valid admin token.", async () => {
        const user = new User({
            name: "AdminSysUser",
            isAdmin: true,
            isSystemUser: true,
            isDisabled: false,
            password: "12345",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);

        createResponse.should.have.status(200);
        createResponse.body.user.should.include.key("name");
        createResponse.body.user.name.should.be.eql(user.name);
        createResponse.body.user.isAdmin.should.be.eql(user.isAdmin);
        createResponse.body.user.isSystemUser.should.be.eql(user.isSystemUser);
    });

    it("admin should be able to promote a user to admin and demote it afterwards", async () => {
        const user = new User({
            name: "NonAdminUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "1337",
        });

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", adminToken)
            .send(user);
        createUserResponse.should.have.status(200);

        const createdUser: User = createUserResponse.body.user;

        user.isAdmin = true;

        const updateUserResponse = await chai
            .request(baseUrl)
            .patch("/api/users/" + createdUser.id)
            .set("Authorization", adminToken)
            .send(user);
        updateUserResponse.should.have.status(200);

        const getUpdatedResponse = await chai
            .request(baseUrl)
            .get("/api/users/" + createdUser.id)
            .set("Authorization", adminToken);
        getUpdatedResponse.should.have.status(200);
        getUpdatedResponse.body.should.include.key("user");
        getUpdatedResponse.body.user.should.be.a("object");
        getUpdatedResponse.body.user.should.have.property("name");
        getUpdatedResponse.body.user.should.have
            .property("id")
            .eql(createdUser.id);
        getUpdatedResponse.body.user.should.have.property("isAdmin").eql(true);

        user.isAdmin = false;

        const demoteUserResponse = await chai
            .request(baseUrl)
            .patch("/api/users/" + createdUser.id)
            .set("Authorization", adminToken)
            .send(user);
        demoteUserResponse.should.have.status(200);

        const getDemoteUserResponse = await chai
            .request(baseUrl)
            .get("/api/users/" + createdUser.id)
            .set("Authorization", adminToken);
        getDemoteUserResponse.should.have.status(200);
        getDemoteUserResponse.body.should.include.key("user");
        getDemoteUserResponse.body.user.should.be.a("object");
        getDemoteUserResponse.body.user.should.have.property("name");
        getDemoteUserResponse.body.user.should.have
            .property("id")
            .eql(createdUser.id);
        getDemoteUserResponse.body.user.should.have
            .property("isAdmin")
            .eql(false);
    });
});
