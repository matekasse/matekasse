import axios from 'axios';
import store from '@/store/index';

const http = axios.create({
    baseURL: 'api/',
    headers: {
        'Content-Type': 'application/json',
        Authorization: '',
    },
});


// Use jwt token in every request
http.interceptors.request.use(
    (config) => {
        const conf = config;

        const token = store.getters.jwt;
        if (token) {
            conf.headers.Authorization = token;
        } else {
            delete http.defaults.headers.common.Authorization;
        }
        return conf;
    },
    error => Promise.reject(error),
);

let isFetchingToken = false;
let tokenSubscribers = [];

function subscribeTokenRefresh(cb) {
    tokenSubscribers.push(cb);
}
function onTokenRefreshed(errRefreshing, token) {
    tokenSubscribers.map(cb => cb(errRefreshing, token));
}
function forceLogout() {
    isFetchingToken = false;
    store.commit('resetState');
    window.location = '/';
}


// Refresh jwt token or log out if not authenticated
http.interceptors.response.use(undefined, (err) => {
    const error = err;

    if (err.response.status === 403) return forceLogout();
    if (err.response.status !== 401) return Promise.reject(err);

    if (!isFetchingToken) {
        isFetchingToken = true;

        const { user } = store.getters;

        http.post('/users/authorize', user)
            .then((response) => {
                const newAccessToken = response.data.data;
                isFetchingToken = false;

                onTokenRefreshed(null, newAccessToken);
                tokenSubscribers = [];

                store.dispatch('setJwt', newAccessToken);
            })
            .catch(() => {
                onTokenRefreshed(new Error('Unable to refresh access token'), null);
                tokenSubscribers = [];

                forceLogout();
            });
    }
    const initTokenSubscriber = new Promise((resolve, reject) => {
        subscribeTokenRefresh((errRefreshing, newToken) => {
            if (errRefreshing) return reject(errRefreshing);
            let { url } = error.config;
            url = url.replace(/(^api\/)/, '');

            error.config.headers.Authorization = newToken;
            error.config.url = url;
            return resolve(http(error.config));
        });
    });
    return initTokenSubscriber;
});

export default http;
