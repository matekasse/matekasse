const post = require("./post");

module.exports = async (baseUrl) => {
    const userUrl = baseUrl + "/users";

    return Promise.all([
        post(userUrl, {
            name: "Peter",
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false,
            password: "123456789",
        }),
        post(userUrl, {
            name: "EinsUser",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "mussmanwissen",
        }),
        post(userUrl, {
            name: "User",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "i<3cats",
        }),
    ]);
};
