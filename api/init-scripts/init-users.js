const post = require("./post");

module.exports = async baseUrl => {
    const userUrl = baseUrl + "/users";

    return Promise.all([
        post(userUrl, {
            name: "Peter",
            paypalName: "peter@lustig.de",
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false,
            password: "123456789"
        }),
        post(userUrl, {
            name: "EinsUser",
            paypalName: "lul",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "mussmanwissen"
        }),
        post(userUrl, {
            name: "User",
            paypalName: "user1337",
            isAdmin: false,
            isSystemUser: false,
            isDisabled: false,
            password: "i<3cats"
        })
    ]);
};
