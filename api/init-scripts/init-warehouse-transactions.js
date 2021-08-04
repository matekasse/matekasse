const post = require("./post");

module.exports = async (baseUrl, productIDs) => {
    const warehouseTransactionsURL = baseUrl + "/warehousetransactions";

    let warehouseTransactions = productIDs.map(async productId => {
        await post(warehouseTransactionsURL, {
            productID: productId,
            userID: 1,
            quantity: 15,
            pricePerItemInCents: 100,
            depositPerItemInCents: 10,
            withCrate: false
        });
    });

    return Promise.all(warehouseTransactions);
};
