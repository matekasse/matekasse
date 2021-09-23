<template>
    <div class="user-page">
        <v-card>
            <v-list-item three-line>
                <v-list-item-content>
                    <v-list-item-title >
                        <span class="headline mb-1">  Username: </span>
                        {{ user.name }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-card-actions>
                <v-btn color="primary" @click="editNames" >Change Name</v-btn>
                <v-btn color="primary" @click="editPassword" >Change Password</v-btn>
            </v-card-actions>
        </v-card>

        <v-card class=my-4>
            <v-card-title>
                History

                <v-spacer/>

                <v-text-field
                    v-model="search"
                    label="Search"
                    single-line
                    hide-details
                />
            </v-card-title>

            <v-data-table
                :headers="headers"
                :items="transactions"
                :search="search"
            >
                <template v-slot:item.createdAt="{ item }">
                    {{item.createdAt}}
                </template>

                <template v-slot:item.total="{ item }">
                    <v-chip
                        :color="item.chipColor"
                    >
                        {{item.total}}
                    </v-chip>
                </template>
            </v-data-table>
        </v-card>

        <change-user-names-modal
            :user="editedUser"
            v-model="showNamesDialog"
        />

        <change-user-password-modal
            v-model="showPasswordDialog"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getUserTransactions } from '@/utils/api-connector';

export default {
    name: 'user-card',

    data() {
        return {
            editMode: false,
            showNamesDialog: false,
            showPasswordDialog: false,
            editedUser: {},
            search: '',
            transactions: [],
            headers: [
                {
                    text: 'Date',
                    value: 'createdAt',
                },
                {
                    text: 'Amount',
                    value: 'total',
                },
                {
                    text: 'Product',
                    value: 'product.name',
                },
                {
                    text: 'Type',
                    value: 'typeOfTransaction',
                },

            ],
        };
    },

    computed: {
        ...mapState(['user']),
        ...mapState(['constants']),
    },

    created() {
        this.loadUserTransactions();
    },
    methods: {
        validate() {
            if (this.$refs.form.validate()) {
                this.snackbar = true;
            }
        },
        reset() {
            this.dialog = false;
            this.$refs.form.reset();
        },
        resetValidation() {
            this.$refs.form.resetValidation();
        },

        editNames() {
            this.dialog = true;
            // create new object instance, so values of the product in the table
            // does not change, when the values are changed in the modal
            this.editedUser = Object.assign({}, this.user);
            this.showNamesDialog = true;
        },
        editPassword() {
            this.showPasswordDialog = true;
            // create new object instance, so values of the product in the table
            // does not change, when the values are changed in the modal
            this.editedUser = Object.assign({}, this.user);
        },
        async loadUserTransactions() {
            this.transactions = await getUserTransactions();

            this.transactions.forEach(
                (transaction) => {
                    const creationDate = transaction.createdAt;
                    const styledTime = `${creationDate.toDateString()}
                        ${(creationDate.getHours() < 10 ? '0' : '')}${creationDate.getHours()}:`
                        + `${(creationDate.getMinutes() < 10 ? '0' : '')}${creationDate.getMinutes()}:`
                        + `${(creationDate.getSeconds() < 10 ? '0' : '')}${creationDate.getSeconds()}`;

                    if (transaction.typeOfTransaction === 'order') {
                        Object.assign(transaction, {
                            createdAt: styledTime,
                            total: `- ${transaction.total} ${this.constants.currencySymbol}`,
                            chipColor: 'red',
                        });
                    } else if (transaction.typeOfTransaction === 'gift') {
                        Object.assign(transaction, {
                            typeOfTransaction: 'topUp',
                            createdAt: styledTime,
                            total: `+ ${transaction.total} ${this.constants.currencySymbol}`,
                            chipColor: 'green',
                        });
                    } else {
                        Object.assign(transaction, {
                            createdAt: styledTime,
                            total: `+ ${transaction.total} ${this.constants.currencySymbol}`,
                            chipColor: 'green',
                        });
                    }
                },
            );
        },
    },
};
</script>
