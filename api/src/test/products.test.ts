import chai from "chai";
import chaiHttp from "chai-http";
import { Product } from "../entity/product";
import { Manufacturer } from "../entity/manufacturer";
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

describe("Products", () => {
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

    it("should GET all products (empty array)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/products")
            .set("Authorization", adminToken);
        response.should.have.status(200);
        response.body.should.include.key("products");
        response.body.products.should.be.a("array");
        response.body.products.length.should.be.eql(0);
    });

    it("should not GET all products as non admin user", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/products")
            .set("Authorization", nonAdminToken);
        response.should.have.status(403);
        response.body.should.not.include.key("products");
        response.body.status.should.be.eql("Not allowed to access");
    });

    it("should GET all active products as non admin user (empty array)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/products/active")
            .set("Authorization", nonAdminToken);
        response.should.have.status(200);
        response.body.should.include.key("products");
        response.body.products.should.be.a("array");
        response.body.products.length.should.be.eql(0);
    });

    it("should DELETE a product by id", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");
        const createdProduct: Product = createResponse.body.product;

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken);
        deleteResponse.should.have.status(200);
    });

    it("should recreate a disabled product by enabling old product again", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");
        const createdProduct: Product = createResponse.body.product;

        const warehouseTransaction = {
            productID: 1,
            userID: 1,
            quantity: 10,
            pricePerItemInCents: 15,
            depositPerItemInCents: 10,
            withCrate: false,
        };
        const createWarehouseTransactionResponse = await chai
            .request(baseUrl)
            .post("/api/warehousetransactions")
            .set("Authorization", adminToken)
            .send(warehouseTransaction);

        createWarehouseTransactionResponse.should.have.status(200);

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken);
        deleteResponse.should.have.status(200);

        const createResponse2 = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse2.should.have.status(200);
        createResponse2.body.product.should.include.key("name");
        createResponse2.body.product.name.should.be.eql("TestProduct");
        createResponse2.body.product.id.should.be.eql(createdProduct.id);
    });

    it("should GET a product by id", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            description:
                "A testdescription for testing a test with longer descriptions than just one or two words",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");
        const createdProduct: Product = createResponse.body.product;

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("product");
        getResponse.body.product.should.be.a("object");
        getResponse.body.product.should.have.property("name");
        getResponse.body.product.should.have
            .property("id")
            .eql(createdProduct.id);
        getResponse.body.product.description.should.be.eql(
            createdProduct.description
        );
    });

    it("should create a product with tags", async () => {
        const product = {
            name: "TestProduct",
            bottleDepositInCents: 100,
            stock: 10,
            priceInCents: 150,
            tags: ["tag1", "tag2"],
        };

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");
        const createdProduct: Product = createResponse.body.product;

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken);

        getResponse.should.have.status(200);
        getResponse.body.should.include.key("product");
        getResponse.body.product.should.be.a("object");
        getResponse.body.product.should.have.property("name");
        createResponse.body.product.tags[0].name.should.be.eql("tag1");
        createResponse.body.product.tags[1].name.should.be.eql("tag2");
        getResponse.body.product.should.have
            .property("id")
            .eql(createdProduct.id);
    });

    it("should not create an invalid product", async () => {
        const testProduct: Partial<Product> = {};
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(testProduct);
        createResponse.should.have.status(400);
        createResponse.body.status.should.be.eql("Arguments missing");
    });

    it("should create a valid product", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);
        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql(product.name);
    });

    it("should update (PATCH) a product by id", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);
        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");

        const createdProduct: Product = createResponse.body.product;
        const updatedProduct = new Product({
            name: "TestProduct",
            bottleDepositInCents: 1337,
            priceInCents: 150,
        });
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken)
            .send(updatedProduct);
        updateResponse.should.have.status(200);
        updateResponse.body.product.should.include.key("name");
        updateResponse.body.product.name.should.be.eql(updatedProduct.name);
        updateResponse.body.product.bottleDepositInCents.should.be.eql(
            updatedProduct.bottleDepositInCents
        );
    });

    it("should create a product with manufacturer and get product by id", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl",
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", adminToken)
            .send(manufacturer);

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send({
                name: "Helles",
                bottleDepositInCents: 100,
                priceInCents: 150,
                manufacturerID: manufacturerResponse.body.manufacturer.id,
            });

        manufacturerResponse.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("Helles");
        createResponse.body.product.manufacturer.name.should.be.eql(
            "Braustübl"
        );
        const createdProduct: Product = createResponse.body.product;

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("product");
        getResponse.body.product.should.be.a("object");
        getResponse.body.product.should.have.property("name");
        getResponse.body.product.should.have
            .property("id")
            .eql(createResponse.body.product.id);
    });

    it("Should get all products", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });
        const disabledProduct = new Product({
            name: "disabledProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            isDisabled: true,
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);
        const createResponse2 = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(disabledProduct);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql(product.name);
        createResponse2.should.have.status(200);
        createResponse2.body.product.should.include.key("name");
        createResponse2.body.product.name.should.be.eql(disabledProduct.name);

        const response = await chai
            .request(baseUrl)
            .get("/api/products")
            .set("Authorization", adminToken);
        response.should.have.status(200);
        response.body.should.include.key("products");
        response.body.products.should.be.a("array");
        response.body.products.length.should.be.eql(2);
    });

    it("Should get all active products", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
        });
        const disabledProduct = new Product({
            name: "disabledProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            isDisabled: true,
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);
        const createResponse2 = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(disabledProduct);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql(product.name);
        createResponse2.should.have.status(200);
        createResponse2.body.product.should.include.key("name");
        createResponse2.body.product.name.should.be.eql(disabledProduct.name);

        const response = await chai
            .request(baseUrl)
            .get("/api/products/active")
            .set("Authorization", adminToken);

        response.should.have.status(200);
        response.body.should.include.key("products");
        response.body.products.should.be.a("array");
        response.body.products.length.should.be.eql(1);
    });

    it("should update (PATCH) a product by id including manufacturer", async () => {
        const manufacturer = new Manufacturer({
            name: "Braustübl",
        });

        let manufacturerResponse = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", adminToken)
            .send(manufacturer);

        const manufacturer2 = new Manufacturer({
            name: "Budweiser",
        });

        let manufacturerResponse2 = await chai
            .request(baseUrl)
            .post("/api/manufacturers")
            .set("Authorization", adminToken)
            .send(manufacturer2);

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send({
                name: "Helles",
                bottleDepositInCents: 100,
                priceInCents: 150,
                manufacturerID: manufacturerResponse.body.manufacturer.id,
            });

        manufacturerResponse.should.have.status(200);
        manufacturerResponse.body.manufacturer.name.should.be.eql(
            manufacturer.name
        );
        manufacturerResponse2.should.have.status(200);
        manufacturerResponse2.body.manufacturer.name.should.be.eql(
            manufacturer2.name
        );
        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("Helles");
        createResponse.body.product.manufacturer.name.should.be.eql(
            "Braustübl"
        );

        const createdProduct: Product = createResponse.body.product;

        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken)
            .send({
                name: "Light",
                bottleDepositInCents: 1337,
                manufacturerID: manufacturerResponse2.body.manufacturer.id,
            });

        updateResponse.should.have.status(200);
        updateResponse.body.product.should.include.key("name");
        updateResponse.body.product.name.should.be.eql("Light");
        updateResponse.body.product.bottleDepositInCents.should.be.eql(1337);
        updateResponse.body.product.priceInCents.should.be.eql(150);
        updateResponse.body.product.manufacturer.name.should.be.eql(
            "Budweiser"
        );
    });

    it("should not GET a disabled product by id only as normal user", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            isDisabled: true,
            description: "Onfortunately this cool new product is disabled",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");
        const createdProduct: Product = createResponse.body.product;

        let getResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createdProduct.id)
            .set("Authorization", nonAdminToken);
        getResponse.should.have.status(404);
    });

    it("should GET a disabled product by id as admin", async () => {
        const product = new Product({
            name: "TestProduct",
            bottleDepositInCents: 100,
            priceInCents: 150,
            isDisabled: true,
            description: "Onfortunately this cool new product is disabled",
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/products")
            .set("Authorization", adminToken)
            .send(product);

        createResponse.should.have.status(200);
        createResponse.body.product.should.include.key("name");
        createResponse.body.product.name.should.be.eql("TestProduct");
        const createdProduct: Product = createResponse.body.product;

        let getResponse = await chai
            .request(baseUrl)
            .get("/api/products/" + createdProduct.id)
            .set("Authorization", adminToken);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("product");
        getResponse.body.product.should.be.a("object");
        getResponse.body.product.should.have.property("name");
        getResponse.body.product.should.have
            .property("id")
            .eql(createdProduct.id);
        getResponse.body.product.description.should.be.eql(
            createdProduct.description
        );
    });
});
