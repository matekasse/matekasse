module.exports = {
    devServer: {
        proxy: 'http://mate-backend:1337/',
    },
    transpileDependencies: [
        'vuetify',
    ],
};
