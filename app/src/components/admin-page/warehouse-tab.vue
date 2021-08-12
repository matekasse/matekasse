<template>
    <div class="warehouse-tab">
        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="search"
                    label="Search"
                    single-line
                    hide-details
                />

                <v-spacer/>

                <v-btn
                    color="primary" dark class="mb-2"
                    @click="showWarehouseTransactionCreateDialog = true"
                >
                    New Warehouse Transaction
                </v-btn>
            </v-card-title>

            <v-data-table
                no-data-text="No Warehouse Transactions"
                :headers="headers"
                :items="warehouseTransactions"
                :search="search"
                :loading="isLoading"
            >
                <template v-slot:item.withCrate="{ item }">
                    <v-checkbox
                        v-model="item.withCrate"
                        readonly
                    />
                </template>

                <template v-slot:item.total="{ item }">
                    {{ item.total }} {{this.constants.currencySymbol}}
                </template>

                <template v-slot:item.totalDeposit="{ item }">
                    {{ item.totalDeposit }} {{this.constants.currencySymbol}}
                </template>
            </v-data-table>
        </v-card>

        <create-warehouse-transaction-modal
            v-model="showWarehouseTransactionCreateDialog"
            @warehouseTransactionsChanged="loadWarehouseTransactions"
        />
    </div>
</template>

<script>
import { getWarehouseTransactions } from '@/utils/api-connector';
import { mapState } from 'vuex';

export default {
    name: 'warehouse-tab',

    data() {
        return {
            search: '',
            showWarehouseTransactionCreateDialog: false,
            warehouseTransactions: [],
            isLoading: true,
            headers: [
                {
                    text: 'Product',
                    value: 'product.name',
                },
                {
                    text: 'User',
                    value: 'user.name',
                },
                {
                    text: 'Quantity',
                    value: 'quantity',
                    filterable: false,
                },
                {
                    text: 'Total Price',
                    value: 'total',
                    filterable: false,
                },
                {
                    text: 'Deposit',
                    value: 'totalDeposit',
                    filterable: false,
                },
                {
                    text: 'with Crate',
                    value: 'withCrate',
                    filterable: false,
                },
            ],
        };
    },

    created() {
        this.loadWarehouseTransactions();
    },

    computed: {
        ...mapState(['constants']),
    },

    methods: {
        async loadWarehouseTransactions() {
            this.isLoading = true;
            try {
                this.warehouseTransactions = await getWarehouseTransactions();
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }

            this.warehouseTransactions.forEach(
                warehouseTransaction => Object.assign(warehouseTransaction, {
                    total: (warehouseTransaction.totalInCents / 100).toFixed(2),
                    totalDeposit: (warehouseTransaction.totalDepositInCents / 100).toFixed(2),
                }),
            );
            this.warehouseTransactions.sort(
                (transactionA, transactionB) => transactionA.createdAt < transactionB.createdAt,
            );

            this.isLoading = false;
        },
    },
};
</script>
