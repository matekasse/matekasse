/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { Product } from "../entity/product";
import { User } from "../entity/user";
import { config } from "dotenv";
import { createTestUser, authenticateTestUser } from "./userUtils";
import { startServer } from "../index";
import { Server } from "http";
import { Connection } from "typeorm";
import { ConstantsService } from "../services/constants-service";

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
describe("Product-Tag", () => {
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

    it("should add new tags to a exisiting product", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send(product);
        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");

        const createdProduct: Product = createResponse.body.product;

        const updatedProduct = {
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            tags: ["tag1", "tag2"]
        };

        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/products/" + createdProduct.id)
            .set("Authorization", token)
            .send(updatedProduct);
        updateResponse.should.have.status(200);
        updateResponse.body.product.should.include.key("name");
        updateResponse.body.product.name.should.be.eql(updatedProduct.name);
        updateResponse.body.product.bottleDepositInCents.should.be.eql(
            updatedProduct.bottleDepositInCents
        );
        updateResponse.body.product.tags[0].should.contain({ name: "tag1" });
        updateResponse.body.product.tags[1].should.contain({ name: "tag2" });
    });

    it("should delete tag if last product with tag is deleted", async () => {
        const productToCreate = {
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            tags: ["tag1", "tag2"]
        };

        const createdProductResponse = await chai
            .request(baseUrl)
            .post("/api/products/")
            .set("Authorization", token)
            .send(productToCreate);
        createdProductResponse.should.have.status(200);
        createdProductResponse.body.product.should.include.key("name");
        createdProductResponse.body.product.name.should.be.eql(
            productToCreate.name
        );
        createdProductResponse.body.product.bottleDepositInCents.should.be.eql(
            productToCreate.bottleDepositInCents
        );
        createdProductResponse.body.product.tags[0].should.contain({
            name: "tag1"
        });
        createdProductResponse.body.product.tags[1].should.contain({
            name: "tag2"
        });

        const createdProduct: Product = createdProductResponse.body.product;

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/products/" + createdProduct.id)
            .set("Authorization", token);

        deleteResponse.should.have.status(200);

        const getTagsResponse = await chai
            .request(baseUrl)
            .get("/api/tags")
            .set("Authorization", token);

        getTagsResponse.should.have.status(200);
        getTagsResponse.body.tags.should.be.eql([]);
    });

    it("should not delete tag if more products with tag exist", async () => {
        const productToCreate = {
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            tags: ["tag1", "tag2"]
        };

        const productToCreate2 = {
            name: "TestProduct2",
            bottleDepositInCents: 100,
            priceInCents: 150,
            tags: ["tag1"]
        };

        const createdProductResponse = await chai
            .request(baseUrl)
            .post("/api/products/")
            .set("Authorization", token)
            .send(productToCreate);
        createdProductResponse.should.have.status(200);
        createdProductResponse.body.product.should.include.key("name");
        createdProductResponse.body.product.name.should.be.eql(
            productToCreate.name
        );
        createdProductResponse.body.product.bottleDepositInCents.should.be.eql(
            productToCreate.bottleDepositInCents
        );
        createdProductResponse.body.product.tags[0].should.contain({
            name: "tag1"
        });
        createdProductResponse.body.product.tags[1].should.contain({
            name: "tag2"
        });

        const createdProduct: Product = createdProductResponse.body.product;

        const createdProductResponse2 = await chai
            .request(baseUrl)
            .post("/api/products/")
            .set("Authorization", token)
            .send(productToCreate2);
        createdProductResponse2.should.have.status(200);

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/products/" + createdProduct.id)
            .set("Authorization", token);

        deleteResponse.should.have.status(200);

        const getTagsResponse = await chai
            .request(baseUrl)
            .get("/api/tags")
            .set("Authorization", token);

        getTagsResponse.should.have.status(200);
        getTagsResponse.body.tags.length.should.be.eql(1);
        getTagsResponse.body.tags[0].should.contain({
            name: "tag1"
        });
    });

    it("should delete product if no transaction with it exists", async () => {
        const productToCreate = {
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            tags: ["tag1", "tag2"]
        };

        const createdProductResponse = await chai
            .request(baseUrl)
            .post("/api/products/")
            .set("Authorization", token)
            .send(productToCreate);
        createdProductResponse.should.have.status(200);
        createdProductResponse.body.product.should.include.key("name");
        createdProductResponse.body.product.name.should.be.eql(
            productToCreate.name
        );
        createdProductResponse.body.product.bottleDepositInCents.should.be.eql(
            productToCreate.bottleDepositInCents
        );
        createdProductResponse.body.product.tags[0].should.contain({
            name: "tag1"
        });
        createdProductResponse.body.product.tags[1].should.contain({
            name: "tag2"
        });

        const createdProduct: Product = createdProductResponse.body.product;

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/products/" + createdProduct.id)
            .set("Authorization", token);

        deleteResponse.should.have.status(200);

        const getTagsResponse = await chai
            .request(baseUrl)
            .get("/api/tags")
            .set("Authorization", token);

        getTagsResponse.should.have.status(200);
        getTagsResponse.body.tags.should.be.eql([]);

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/products")
            .set("Authorization", token);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("products");
        getResponse.body.products.should.be.a("array");
        getResponse.body.products.length.should.be.eql(0);
    });

    it("should disable (not delete) product if a transaction with it exists", async () => {
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

        const createUserResponse = await chai
            .request(baseUrl)
            .post("/api/users")
            .set("Authorization", token)
            .send(user);

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
            .set("Authorization", token)
            .send(bankUser);

        const giftTransaction = {
            fromUserID: systemUserResponse.body.user.id,
            toUserID: createUserResponse.body.user.id,
            amountOfMoneyInCents: 2000
        };

        const postResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", token)
            .send(giftTransaction);

        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150
        });

        const orderTransaction = {
            fromUserID: createUserResponse.body.user.id,
            productID: "1"
        };

        const createProductResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", token)
            .send(product);

        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", token)
            .send(warehouseTransaction);

        const orderResponse = await chai
            .request(baseUrl)
            .post("/api/transactions")
            .set("Authorization", token)
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
            createUserResponse.body.user.id
        );
        postResponse.body.createdTransaction.fromUser.balance.should.be.eql(
            -giftTransaction.amountOfMoneyInCents
        );

        createProductResponse.should.have.status(200);

        orderResponse.body.createdTransaction.product.id.should.be.eql(
            createProductResponse.body.product.id
        );

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/products/" + createProductResponse.body.product.id)
            .set("Authorization", token);

        deleteResponse.should.have.status(200);

        const getTagsResponse = await chai
            .request(baseUrl)
            .get("/api/tags")
            .set("Authorization", token);

        getTagsResponse.should.have.status(200);
        getTagsResponse.body.tags.should.be.eql([]);

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/products")
            .set("Authorization", token);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("products");
        getResponse.body.products.should.be.a("array");
        getResponse.body.products[0].isDisabled.should.be.eql(true);
        getResponse.body.products.length.should.be.eql(1);
    });
});
