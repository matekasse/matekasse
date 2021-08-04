<template>
    <div class="create-warehouse-transaction-modal">
        <v-dialog v-model="showDialog" max-width="500px">
            <v-form
                ref="form"
                v-model="valid"
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">
                            New Warehouse Transaction
                        </span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" sm="12" md="12">
                                    <v-autocomplete
                                        v-model="warehouseTransaction.product"
                                        :items="products"
                                        item-text="name"
                                        item-value="id"
                                        label="Product"
                                        single-line
                                        required
                                        return-object
                                        :rules="selectRules"
                                        @keydown="validateAndSave"
                                        @change="updateDefaults"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6" md="2">
                                    <v-text-field
                                        v-model="warehouseTransaction.quantity"
                                        label="Quantity"
                                        :rules="quantityRules"
                                        @keydown="validateAndSave"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field
                                        v-model="warehouseTransaction.pricePerItem"
                                        label="Price per item"
                                        suffix="€"
                                        :rules="moneyRules"
                                        @keydown="validateAndSave"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field
                                        v-model="warehouseTransaction.depositPerItem"
                                        label="Deposit per item"
                                        suffix="€"
                                        :rules="moneyRules"
                                        @keydown="validateAndSave"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6" md="2">
                                    <v-checkbox
                                        v-model="warehouseTransaction.withCrate"
                                        label="Crate ?"
                                    />
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer/>

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
                            @click="save"
                        >
                            Save
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getProducts, postWarehouseTransactions } from '@/utils/api-connector';
import {
    isNumber, notEmpty, atLeastZero, isPositive,
} from '@/plugins/validation-rules';

export default {
    name: 'create-warehouse-transaction-modal',

    props: {
        value: {
            type: Boolean,
            required: true,
        },
    },

    data() {
        return {
            valid: false,
            products: [],
            warehouseTransaction: {},
            defaultWarehouseTransaction: {
                productID: '',
                userID: '',
                quantity: 0,
                product: {},
                pricePerItem: 0.00,
                depositPerItem: 0.00,
                withCrate: false,
            },
            selectRules: [
                value => notEmpty(value),
            ],
            quantityRules: [
                value => isNumber(value),
                value => isPositive(value),
            ],
            moneyRules: [
                value => isNumber(value),
                value => atLeastZero(value),
            ],
        };
    },

    computed: {
        ...mapState(['user']),
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
    },

    created() {
        this.loadProducts();
        this.warehouseTransaction = Object.assign({}, this.defaultWarehouseTransaction);
        this.warehouseTransaction.userID = this.user.id;
    },

    methods: {
        async loadProducts() {
            this.isLoading = true;
            try {
                this.products = await getProducts();
                this.products.sort(
                    (productA, productB) => productA.name.toLowerCase()
                    > productB.name.toLowerCase(),
                );
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
            this.isLoading = false;
        },

        updateDefaults() {
            if (this.warehouseTransaction.product) {
                this.warehouseTransaction.pricePerItem = Number.parseFloat(
                    this.warehouseTransaction.product.price,
                ).toFixed(2);
                // eslint-disable-next-line
                this.warehouseTransaction.depositPerItem = Number.parseFloat(this.warehouseTransaction.product.bottleDeposit).toFixed(2);
            }
        },

        async save() {
            this.warehouseTransaction.userID = this.user.id;
            this.warehouseTransaction.quantity = Number(this.warehouseTransaction.quantity);
            this.warehouseTransaction.pricePerItemInCents = Number(
                (this.warehouseTransaction.pricePerItem * 100).toFixed(),
            );
            this.warehouseTransaction.depositPerItemInCents = Number(
                (this.warehouseTransaction.depositPerItem * 100).toFixed(),
            );
            this.warehouseTransaction.productID = this.warehouseTransaction.product.id;

            delete this.warehouseTransaction.product;

            try {
                await postWarehouseTransactions(this.warehouseTransaction);
                this.$emit('warehouseTransactionsChanged', this.warehouseTransaction);

                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: 'Warehouse transaction created',
                });

                this.showDialog = false;
                setTimeout(() => {
                    this.warehouseTransaction = Object.assign({}, this.defaultWarehouseTransaction);
                }, 300);
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
        },

        validateAndSave(event) {
            if (event.code === 'Enter') {
                if (this.$refs.form.validate()) {
                    this.save();
                }
            }
        },

        close() {
            this.showDialog = false;
            setTimeout(() => {
                this.warehouseTransaction = Object.assign({}, this.defaultWarehouseTransaction);
            }, 300);
        },
    },
};
</script>
