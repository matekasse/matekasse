const post = require("./post");

module.exports = async (baseUrl) => {
    const tagUrl = baseUrl + "/tags";
    tags = [];

    tags.push(
        await post(tagUrl, {
            name: "Toll",
        })
    );

    tags.push(
        await post(tagUrl, {
            name: "Teuer",
        })
    );

    tags.push(
        await post(tagUrl, {
            name: "Alkohol",
        })
    );

    tags.push(
        await post(tagUrl, {
            name: "NichtTrinken",
        })
    );

    let createdTagNames = tags.map(async (tag) => {
        parsedBody = await tag.json();

        return parsedBody.tag.name;
    });

    return Promise.all(createdTagNames);
};
