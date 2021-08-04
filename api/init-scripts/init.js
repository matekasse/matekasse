const initateUsers = require("./init-users");
const initiateManufacturers = require("./init-manufacturers");
const initiateProducts = require("./init-products");
// const initateWarehouseTransactions = require("./init-warehouse-transactions");
const initateTags = require("./init-tags");

const baseUrl = "http://localhost:1337/api";

async function main() {
    try {
        await initateUsers(baseUrl);
        const createdManifacturerIDs = await initiateManufacturers(baseUrl);
        const createdTags = await initateTags(baseUrl);
        await initiateProducts(baseUrl, createdManifacturerIDs, createdTags);
    } catch (error) {
        console.log(error);
    }
}

main();
