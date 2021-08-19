const post = require("./post");

module.exports = async (baseUrl, manufacturerIDs, tagNames) => {
    const productUrl = baseUrl + "/products";

    products = [];

    products.push(
        await post(productUrl, {
            name: "Mate",
            bottleDepositInCents: 25,
            priceInCents: 200,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Pepsi",
            bottleDepositInCents: 25,
            priceInCents: 150,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[0], tagNames[1]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Bionade",
            bottleDepositInCents: 25,
            priceInCents: 180,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[0], tagNames[2]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Grohe",
            bottleDepositInCents: 25,
            priceInCents: 120,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[2], tagNames[3]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Tschunk",
            bottleDepositInCents: 25,
            priceInCents: 350,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[Math.floor(Math.random() * tagNames.length)]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Braustuebl",
            bottleDepositInCents: 25,
            priceInCents: 150,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[Math.floor(Math.random() * tagNames.length)]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "5,0",
            bottleDepositInCents: 15,
            priceInCents: 100,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[Math.floor(Math.random() * tagNames.length)]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Vladimir Vodka 0,2 cl",
            bottleDepositInCents: 25,
            priceInCents: 150,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[Math.floor(Math.random() * tagNames.length)]],
        })
    );

    products.push(
        await post(productUrl, {
            name: "Mojito",
            bottleDepositInCents: 50,
            priceInCents: 450,
            manufacturerID:
                manufacturerIDs[
                    Math.floor(Math.random() * manufacturerIDs.length)
                ],
            tags: [tagNames[Math.floor(Math.random() * tagNames.length)]],
        })
    );

    return Promise.all(products);
};
