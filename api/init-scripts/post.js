const fetch = require("node-fetch");

async function getAuthToken() {
    return await fetch("http://localhost:1337/api/users/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Admin",
            password: "admin",
        }),
    });
}

module.exports = async (url, data) => {
    tokenResponse = await getAuthToken();
    tokenResponseParsed = await tokenResponse.json();
    token = tokenResponseParsed.data;

    return fetch(url, {
        method: "POST",
        headers: {
            Authorization: token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
};
