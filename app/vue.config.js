module.exports = {
    devServer: {
        proxy: 'http://localhost:1337/',
    },
    transpileDependencies: [
        'vuetify',
    ],
};
