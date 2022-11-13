<template>
    <div class="change-password-modal">
        <v-dialog
            max-width="500px"
            v-model="showDialog"
        >
            <v-form
                ref="form"
                v-model="valid"
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">
                            Change password of: {{ user.name }}
                        </span>
                    </v-card-title>

                    <v-card-text>
                        <v-text-field
                            v-model="password"
                            label="New password"
                            type="password"
                            :rules="[value => !!value || 'Password is required']"
                            autofocus
                            @keydown="validateAndResetPassword"
                        />
                    </v-card-text>

                    <v-card-text>
                        <v-text-field
                            v-model="repeatedPassword"
                            label="Repeat password"
                            type="password"
                            :rules="rules"
                            @keydown="validateAndResetPassword"
                        />
                    </v-card-text>

                    <v-card-actions>
                        <v-btn
                            color="blue darken-1"
                            text
                            @click="close"
                        >
                            Cancel
                        </v-btn>

                        <v-btn
                            color="blue darken-1"
                            text
                            :disabled="!valid"
                            @click="resetPassword"
                        >
                            Reset Password
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
    </div>
</template>

<script>
import { changeUsersPassword } from '@/api-connectors/api-connector';
import { notEmpty, passwordsMatch } from '@/plugins/validation-rules';
import { displayErrorNotification, displaySuccessNotification } from '@/utils/notifications';

export default {
    name: 'change-password-modal',

    props: {
        value: {
            type: Boolean,
            required: true,
        },
        user: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            valid: false,
            password: '',
            repeatedPassword: '',
            rules: [
                value => notEmpty(value),
                value => passwordsMatch(this.password, value),
            ],
        };
    },

    computed: {
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
    },

    methods: {
        async resetPassword() {
            const userWithUpdatedPassword = this.user;
            if (this.password === this.repeatedPassword) {
                try {
                    userWithUpdatedPassword.password = this.password;
                    await changeUsersPassword(this.user.id, userWithUpdatedPassword);

                    displaySuccessNotification(`${this.user.name}'s password was reset`);

                    this.showDialog = false;
                    setTimeout(() => {
                        this.password = '';
                        this.repeatedPassword = '';
                    }, 300);
                } catch (error) {
                    displayErrorNotification(error.message);
                }
            }
        },

        validateAndResetPassword(event) {
            if (event.code === 'Enter') {
                if (this.$refs.form.validate()) {
                    this.resetPassword();
                }
            }
        },

        close() {
            this.showDialog = false;
            setTimeout(() => {
                this.password = '';
                this.repeatedPassword = '';
            }, 300);
        },
    },
};
</script>

<style lang="scss">
    .change-password-modal{
    }
</style>
