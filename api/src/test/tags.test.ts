/** Package imports */
import chai from "chai";
import chaiHttp from "chai-http";
import { ConstantsService } from "../services/constants-service";
import { Tag } from "../entity/tag";
import { config } from "dotenv";
import { Server } from "http";
import { Connection } from "typeorm";
import { startServer } from "../index";
import { createTestUser, authenticateTestUser } from "./userUtils";
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
describe("Tags", () => {
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

    it("should GET all tags (empty array)", async () => {
        const response = await chai
            .request(baseUrl)
            .get("/api/tags")
            .set("Authorization", token);
        response.should.have.status(200);
        response.body.should.include.key("tags");
        response.body.tags.should.be.a("array");
        response.body.tags.length.should.be.eql(0);
    });

    /** Test delete tag*/
    it("should DELETE a tag by id", async () => {
        const tag = new Tag({
            name: "TestTag"
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/tags")
            .set("Authorization", token)
            .send(tag);

        createResponse.should.have.status(200);
        createResponse.body.tag.should.include.key("name");
        createResponse.body.tag.name.should.be.eql("TestTag");
        const createdTag: Tag = createResponse.body.tag;

        const deleteResponse = await chai
            .request(baseUrl)
            .delete("/api/tags/" + createdTag.id)
            .set("Authorization", token);
        deleteResponse.should.have.status(200);
    });

    it("should GET a tag by id", async () => {
        const tag = new Tag({
            name: "TestTag"
        });

        const createResponse = await chai
            .request(baseUrl)
            .post("/api/tags")
            .set("Authorization", token)
            .send(tag);

        createResponse.should.have.status(200);
        createResponse.body.tag.should.include.key("name");
        createResponse.body.tag.name.should.be.eql("TestTag");
        const createdTag: Tag = createResponse.body.tag;

        const getResponse = await chai
            .request(baseUrl)
            .get("/api/tags/" + createdTag.id)
            .set("Authorization", token);
        getResponse.should.have.status(200);
        getResponse.body.should.include.key("tag");
        getResponse.body.tag.should.be.a("object");
        getResponse.body.tag.should.have.property("name");
        getResponse.body.tag.should.have.property("id").eql(createdTag.id);
    });

    it("should not create an invalid tag", async () => {
        const testTag: Partial<Tag> = {};
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/tags")
            .set("Authorization", token)
            .send(testTag);
        createResponse.should.have.status(404);
        createResponse.body.status.should.be.eql("Arguments missing");
    });

    it("should create a valid tag", async () => {
        const tag = new Tag({
            name: "TestTag"
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/tags")
            .set("Authorization", token)
            .send(tag);
        createResponse.should.have.status(200);
        createResponse.body.tag.should.include.key("name");
        createResponse.body.tag.name.should.be.eql(tag.name);
    });

    it("should update (PATCH) a tag by id", async () => {
        const tag = new Tag({
            name: "TestTag"
        });
        const createResponse = await chai
            .request(baseUrl)
            .post("/api/tags")
            .set("Authorization", token)
            .send(tag);
        createResponse.should.have.status(200);
        createResponse.body.tag.should.include.key("name");
        createResponse.body.tag.name.should.be.eql("TestTag");

        const createdTag: Tag = createResponse.body.tag;
        const updatedTag = new Tag({
            name: "TestTag"
        });
        const updateResponse = await chai
            .request(baseUrl)
            .patch("/api/tags/" + createdTag.id)
            .set("Authorization", token)
            .send(updatedTag);
        updateResponse.should.have.status(200);
        updateResponse.body.tag.should.include.key("name");
        updateResponse.body.tag.name.should.be.eql(updatedTag.name);
    });
});
