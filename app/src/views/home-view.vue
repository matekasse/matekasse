<template>
    <v-app id="inspire">
        <v-navigation-drawer
            v-model="drawer"
            app
            clipped
        >
            <v-list dense>
                <v-list-item
                    link
                    to="/menu"
                >
                    <v-list-item-action>
                        <v-icon>
                            mdi-settings
                        </v-icon>
                    </v-list-item-action>

                    <v-list-item-content>
                        Menu
                    </v-list-item-content>
                </v-list-item>

                <v-list-item
                    v-if="user.isAdmin"
                    link
                    to="/admin"
                >
                    <v-list-item-action>
                        <v-icon>
                            mdi-settings
                        </v-icon>
                    </v-list-item-action>

                    <v-list-item-content>
                        Admin
                    </v-list-item-content>
                </v-list-item>

                <v-list-item
                    link
                    to="/userpage"
                >
                    <v-list-item-action>
                        <v-icon>
                            mdi-settings
                        </v-icon>
                    </v-list-item-action>

                    <v-list-item-content>
                        Profile
                    </v-list-item-content>
                </v-list-item>
            </v-list>
    </v-navigation-drawer>

        <v-app-bar
            app
            clipped-left
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

            <v-spacer />

            <span>
                Balance: {{ user.balance }} €
            </span>

            <v-spacer/>

            <v-btn
                color="blue"
                @click="logout"
            >
                Logout
            </v-btn>

        </v-app-bar>

        <v-content>
            <v-container fluid >
                <router-view/>
            </v-container>
        </v-content>

        <v-footer app>
            <span>
                &copy; 2021
            </span>
        </v-footer>
    </v-app>
</template>

<script>
import { mapState } from 'vuex';

export default {
    data: () => ({
        drawer: null,
        isAdmin: false,
    }),

    computed: mapState(['user']),


    created() {
        this.$vuetify.theme.dark = true;
    },

    methods: {
        logout() {
            this.$store.commit('resetState');
            this.$router.push('/');
        },
    },
};
</script>
