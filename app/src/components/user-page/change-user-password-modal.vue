<template>
    <v-dialog v-model="showDialog" max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline">Change Password</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-row>
                        <v-form
                            ref="form"
                            v-model="valid"
                        >
                            <v-col>
                                <v-text-field
                                    v-model="oldPassword"
                                    label="Old Password"
                                    validate-on-blur
                                    :rules="rulesForOldPassword"
                                    type="password"
                                    @keydown="validateAndChangePassword"
                                />
                            </v-col>

                            <v-col>
                                <v-text-field
                                    v-model="newPassword"
                                    label="New Password"
                                    type="password"
                                    :rules="rulesForNewPassword"
                                    @keydown="validateAndChangePassword"
                                />
                            </v-col>

                            <v-col>
                                <v-text-field
                                    v-model="reEnteredPassword"
                                    label="Re-enter New Password"
                                    type="password"
                                    :rules="rulesForNewPassword"
                                    @keydown="validateAndChangePassword"
                                />
                            </v-col>
                        </v-form>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer/>

                <v-btn
                    color="blue darken-1"
                    text
                    :disabled="!valid"
                    @click="changePassword"
                >
                    Change Password
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { notEmpty, samePassword } from '@/plugins/validation-rules';
import { changeUsersPassword } from '@/utils/api-connector';

export default {
    name: 'change-user-password-modal',

    data() {
        return {
            valid: false,
            dialog: false,
            isErrorVisible: false,
            oldPassword: '',
            newPassword: '',
            reEnteredPassword: '',
            rulesForNewPassword: [
                value => notEmpty(value),
                value => samePassword(this.newPassword, value),
            ],
            rulesForOldPassword: [
                value => notEmpty(value),
            ],
        };
    },

    props: {
        value: {
            type: Boolean,
            required: true,
        },
    },

    computed: {
        ...mapState(['user']),
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
        editedUser() {
            return Object.assign({}, this.user);
        },
    },

    methods: {
        async changePassword() {
            try {
                const newUser = this.user;
                newUser.password = this.newPassword;

                const userResponse = await changeUsersPassword(newUser.id, newUser);
                userResponse.password = this.newPassword;
                this.$store.commit('initUser', userResponse);

                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: 'Updated password',
                });

                this.showDialog = false;
                setTimeout(() => {
                    this.oldPassword = '';
                    this.newPassword = '';
                    this.reEnteredPassword = '';
                    this.$refs.form.reset();
                }, 300);
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
        },

        validateAndChangePassword(event) {
            if (event.code === 'Enter') {
                if (this.$refs.form.validate()) {
                    this.changePassword();
                }
            }
        },

        close() {
            this.showDialog = false;
            setTimeout(() => {
                this.oldPassword = '';
                this.newPassword = '';
                this.reEnteredPassword = '';
                this.$refs.form.reset();
            }, 300);
        },
    },
};
</script>
