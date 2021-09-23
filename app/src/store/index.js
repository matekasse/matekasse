import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        user: {},
        jwt: '',
        constants: {},
    },
    getters: {
        user: state => state.user,
        jwt: state => state.jwt,
        constants: state => state.constants,
    },
    mutations: {
        initUser(state, user) {
            state.user = user;
            state.user.balance = (state.user.balance / 100).toFixed(2);
        },
        changeUser(state, user) {
            const { password } = state.user;
            state.user = user;
            state.user.balance = (state.user.balance / 100).toFixed(2);
            state.user.password = password;
        },
        changeJwt(state, jwt) {
            state.jwt = jwt;
        },
        resetState(state) {
            state.user = {};
            state.jwt = '';
            state.constants = {};
        },
        changeConstants(state, constants) {
            state.constants = constants;
        },
    },
    actions: {
        setJwt({ commit }, jwt) {
            commit('changeJwt', jwt);
        },
        async setConstants({ commit }, constants) {
            commit('changeConstants', constants);
        },
    },

    plugins: [createPersistedState()],
});
