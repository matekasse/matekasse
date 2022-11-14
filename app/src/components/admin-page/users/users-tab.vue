<template>
    <div class="user-tab">
        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="search"
                    label="Search"
                    single-line
                    hide-details
                />

                    <v-spacer/>
                </v-card-title>

                <v-data-table
                    no-data-text="No Users"
                    :headers="headers"
                    :items="users"
                    :search="search"
                    :loading="isLoading"
                >
                    <template v-slot:item.isDisabled="{ item }">
                        <span
                            v-if="item.isDisabled"
                        >
                            disabled
                        </span>

                        <span
                            v-else
                        >
                            active
                        </span>
                    </template>

                    <template v-slot:item.balance="{ item }">
                        {{ item.balance }} {{constants.currencySymbol}}
                    </template>

                    <template v-slot:item.reset="{ item }">
                        <v-btn
                            color="primary"
                            dark
                            class="mb-2 test"
                            :disabled="item.isDisabled"
                            @click="resetPassword(item)"
                        >
                            Reset Password
                        </v-btn>
                    </template>

                    <template v-slot:item.topup="{ item }">
                        <v-btn
                            color="primary"
                            dark
                            class="mb-2 test"
                            :disabled="item.isDisabled"
                            @click="topupUser(item)"
                        >
                            Top Up Balance
                        </v-btn>
                    </template>

                    <template v-slot:item.admin="{ item }">
                        <v-btn
                            v-if="item.isAdmin"
                            color="primary"
                            dark
                            class="mb-2"
                            @click="checkAndDowngrade(item)"
                        >
                            Downgrade user
                        </v-btn>

                        <v-btn
                            v-else
                            color="primary"
                            dark
                            class="mb-2"
                            @click="togglePromoteUserToAdmin(true, item)"
                        >
                            Promote user to admin
                        </v-btn>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            v-if="!item.isDisabled"
                            color="primary"
                            dark
                            class="mb-2"
                            @click="checkDisable(item)"
                        >
                            Disable User
                        </v-btn>

                        <v-btn
                            v-else
                            color="primary"
                            dark
                            class="mb-2"
                            @click="toggleDisableUser(false, item)"
                        >
                        Activate User
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <change-password-modal
            v-model="showPasswordResetModal"
            :user="userForPasswordReset"
        />

        <topup-modal
            v-model="showTopUpModal"
            :user="userToTopUp"
            @userTopedUp="loadUsers"
        />

        <disable-user-confirmation-modal
            v-model="showDisableConfirmationModal"
            v-on:confirm="confirmDisable()"
        />

        <downgrade-user-modal
            v-model="showDowngradeConfirmationModal"
            v-on:confirm="confirmDowngrade()"
        />
    </div>
</template>

<script>
import { getUsers, patchUser } from '@/api-connectors/api-connector';
import { mapState } from 'vuex';

export default {
    name: 'users-tab',

    data() {
        return {
            users: [],
            search: '',
            isLoading: true,
            showTopUpModal: false,
            showDisableConfirmationModal: false,
            showDowngradeConfirmationModal: false,
            showPasswordResetModal: false,
            userForPasswordReset: {},
            userToBeDisabled: {},
            userToBeDowngraded: {},
            userToTopUp: {},
            headers: [
                {
                    text: 'Name',
                    value: 'name',
                },
                {
                    text: 'Balance',
                    value: 'balance',
                },
                {
                    text: 'Status',
                    value: 'isDisabled',
                },
                {
                    text: '',
                    value: 'reset',
                    align: 'right',
                },
                {
                    text: '',
                    value: 'topup',
                    align: 'right',
                },
                {
                    text: '',
                    value: 'admin',
                    align: 'right',
                },
                {
                    text: '',
                    value: 'actions',
                    align: 'right',
                },
            ],
        };
    },

    created() {
        this.loadUsers();
    },

    computed: {
        ...mapState(['constants']),
        ...mapState(['user']),
    },

    methods: {
        async loadUsers() {
            this.isLoading = true;
            try {
                this.users = await getUsers();
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
            this.users.sort((userA, userB) => userA.name.toLowerCase() > userB.name.toLowerCase());
            this.isLoading = false;
        },


        async toggleDisableUser(event, item) {
            const editedItem = item;
            editedItem.isDisabled = event;
            try {
                await patchUser(editedItem.id, editedItem);
                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: `Updated user ${editedItem.name}`,
                });
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
            this.loadUsers();
        },

        async togglePromoteUserToAdmin(event, item) {
            const numberOfAdmins = this.getNumberOfActiveAdmins();
            if (event === false && numberOfAdmins <= 1) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: 'Cannot downgrade last admin',
                });
                return;
            }

            const editedItem = item;
            editedItem.isAdmin = event;

            try {
                await patchUser(editedItem.id, editedItem);
                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: `Updated user ${editedItem.name}`,
                });
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
            await this.loadUsers();
        },

        topupUser(user) {
            this.userToTopUp = user;
            this.showTopUpModal = true;
        },

        resetPassword(user) {
            this.userForPasswordReset = user;
            this.showPasswordResetModal = true;
        },

        async checkDisable(user) {
            if (user.id === this.user.id) {
                this.showDisableConfirmationModal = true;
                this.userToBeDisabled = user;
            } else {
                await this.toggleDisableUser(true, user);
            }
        },

        async checkAndDowngrade(user) {
            if (user.id === this.user.id) {
                this.showDowngradeConfirmationModal = true;
                this.userToBeDowngraded = user;
            } else {
                await this.togglePromoteUserToAdmin(false, user);
            }
        },

        getNumberOfActiveAdmins() {
            let numberOfAdmins = 0;
            this.users.forEach((user) => {
                if (user.isAdmin && !user.isDisabled) {
                    numberOfAdmins += 1;
                }
                return user.isAdmin;
            });

            return numberOfAdmins;
        },

        async confirmDisable() {
            const numberOfAdmins = this.getNumberOfActiveAdmins();
            if (numberOfAdmins > 1) {
                await this.toggleDisableUser(true, this.userToBeDisabled);
                this.logout();
            } else {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: 'Cannot disable last admin',
                });
            }

            this.userToBeDisabled = {};
        },

        async confirmDowngrade() {
            const numberOfAdmins = this.getNumberOfActiveAdmins();
            if (numberOfAdmins > 1) {
                await this.togglePromoteUserToAdmin(false, this.userToBeDowngraded);
                this.logout();
            } else {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: 'Cannot take privileges from last admin',
                });
            }

            this.userToBeDisabled = {};
        },

        logout() {
            this.$store.commit('resetState');
            this.$router.push('/');
        },
    },
};
</script>
