<template>
    <div class="register">
        <v-container
            fill-height
            fluid
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

                                    Register
                                </span>
                            </v-card-title>

                            <v-card-text>
                                <v-text-field
                                    v-model="username"
                                    label="Username"
                                    :rules="[value => !!value || 'Username is required']"
                                    autofocus
                                    @keydown="validateAndRegister"
                                />

                                <v-text-field
                                    v-model="password"
                                    label="Password"
                                    type="password"
                                    :rules="[value => !!value || 'Password is required']"
                                    @keydown="validateAndRegister"
                                />

                                <v-text-field
                                    v-model="repeatedPassword"
                                    label="Repeat Password"
                                    type="password"
                                    :rules="rules"
                                    @keydown="validateAndRegister"
                                />
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer />

                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="goTologin"
                                >
                                    Back to Login
                                </v-btn>

                                <v-btn
                                    :disabled="!valid"
                                    color="blue darken-1"
                                    text
                                    @click="registerUser"
                                >
                                    register
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
import { notEmpty, passwordsMatch } from '@/plugins/validation-rules';
import { postUser, loginUser, getConstants } from '@/api-connectors/api-connector';
import { displayErrorNotification } from '@/utils/notifications';

export default {
    name: 'register',

    data() {
        return {
            valid: false,
            username: '',
            password: '',
            repeatedPassword: '',
            rules: [
                value => notEmpty(value),
                value => passwordsMatch(this.password, value),
            ],
        };
    },

    methods: {
        async registerUser() {
            try {
                if (this.password !== this.repeatedPassword) {
                    return;
                }
                const newUser = {
                    name: this.username,
                    password: this.password,
                    isAdmin: false,
                    isSystemUser: false,
                    isDisabled: false,
                };
                const createdUser = await postUser(newUser);
                const token = await loginUser(newUser);
                createdUser.password = this.password;
                this.$store.commit('initUser', createdUser);

                const constants = await getConstants();
                this.$store.commit('changeConstants', constants);

                if (token) {
                    this.$store.commit('changeJwt', token);
                    this.$router.push('/menu');
                }
            } catch (error) {
                displayErrorNotification(error.message);
            }
        },

        validateAndRegister(event) {
            if (event.code === 'Enter') {
                if (this.$refs.form.validate()) {
                    this.registerUser();
                }
            }
        },

        goTologin() {
            this.$router.push('/');
        },
    },
};
</script>
