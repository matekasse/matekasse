<template>
    <div class="login">
        <v-container
            fill-height
        >
            <v-layout
                justify-center
            >
                <v-flex
                    xs12
                    sm8
                    md4
                >
                    <v-card>
                        <v-form
                            ref="form"
                            v-model="valid"
                        >
                            <v-card-title>
                                <span class="headline">
                                    Awesome Matekasse:

                                    <br/>

                                    Sign In
                                </span>
                            </v-card-title>

                            <v-card-text>
                                <v-text-field
                                    v-model="username"
                                    label="Username"
                                    :rules="rules"
                                    autofocus=""
                                    @keydown="validateAndLogin"
                                />

                                <v-text-field
                                    v-model="password"
                                    label="Password"
                                    type="password"
                                    :rules="rules"
                                    @keydown="validateAndLogin"
                                />
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer />

                                <v-btn
                                    id="login-registerbutton"
                                    color="blue darken-1"
                                    text
                                    @click="goToRegister"
                                >
                                    Go to Register
                                </v-btn>

                                <v-btn
                                    id="login-loginbutton"
                                    color="blue darken-1"
                                    text
                                    :disabled="!valid"
                                    @click="login"
                                >
                                    Login
                                </v-btn>
                            </v-card-actions>
                        </v-form>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
import jwt from 'jsonwebtoken';
import { notEmpty } from '@/plugins/validation-rules';
import { loginUser, getUserById, getConstants } from '@/api-connectors/api-connector';
import { displayErrorNotification } from '@/utils/notifications';

export default {
    name: 'login',

    data() {
        return {
            valid: false,
            username: '',
            password: '',
            rules: [
                value => notEmpty(value),
            ],
        };
    },

    methods: {
        async login() {
            const userFormValues = {
                name: this.username,
                password: this.password,
            };
            try {
                const token = await loginUser(userFormValues);
                this.$store.commit('changeJwt', token);
                const decodedToken = jwt.decode(token, { complete: true });

                const user = await getUserById(decodedToken.payload.id);
                this.$store.commit('initUser', user);

                const constants = await getConstants();
                this.$store.commit('changeConstants', constants);

                if (token) {
                    this.$router.push('/menu');
                }
            } catch (error) {
                displayErrorNotification(error.message);
            }
        },

        validateAndLogin(event) {
            if (event.code === 'Enter') {
                if (this.$refs.form.validate()) {
                    this.login();
                }
            }
        },

        goToRegister() {
            this.$router.push('/register');
        },
    },
};
</script>
