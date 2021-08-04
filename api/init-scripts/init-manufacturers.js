const post = require("./post");

module.exports = async baseUrl => {
    const manufacturerUrl = baseUrl + "/manufacturers";
    manufacturer = [];

    manufacturer.push(
        await post(manufacturerUrl, {
            name: "Brauerei Meier"
        })
    );

    manufacturer.push(
        await post(manufacturerUrl, {
            name: "Bier Manufaktur"
        })
    );

    manufacturer.push(
        await post(manufacturerUrl, {
            name: "Softdrink-Hersteller"
        })
    );

    let createdManufacturerIDs = manufacturer.map(async manufacturer => {
        parsedBody = await manufacturer.json();

        return parsedBody.manufacturer.id;
    });

    return Promise.all(createdManufacturerIDs);
};
