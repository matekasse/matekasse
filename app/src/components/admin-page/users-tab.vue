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

                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            v-if="!item.isDisabled"
                            color="primary"
                            dark
                            class="mb-2"
                            @click="toggleDisableUser(true, item)"
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
    </div>
</template>

<script>
import { getUsers, patchUser } from '@/utils/api-connector';

export default {
    name: 'users-tab',

    data() {
        return {
            users: [],
            search: '',
            isLoading: true,
            showTopUpModal: false,
            showPasswordResetModal: false,
            userForPasswordReset: {},
            userToTopUp: {},
            headers: [
                {
                    text: 'Id',
                    value: 'id',
                },
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
                    value: 'actions',
                    align: 'right',
                },
            ],
        };
    },

    created() {
        this.loadUsers();
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

        topupUser(user) {
            this.userToTopUp = user;
            this.showTopUpModal = true;
        },

        resetPassword(user) {
            this.userForPasswordReset = user;
            this.showPasswordResetModal = true;
        },
    },
};
</script>
