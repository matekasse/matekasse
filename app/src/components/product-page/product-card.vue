<template>
    <div class="product-card">
        <v-card
            class="ma-2 align-start"
            outlined
        >
            <v-container>
                <v-row>
                    <v-col cols=4>
                        <v-img
                            height="180"
                            width="100"
                            :contain=false
                            :src="product.picture"
                        />
                    </v-col>

                    <v-col cols="8">
                            <v-card-title>
                                {{ product.name }}
                            </v-card-title>

                            <v-card-subtitle
                                v-if="product.manufacturer"
                            >
                                {{ product.manufacturer.name }}
                            </v-card-subtitle>

                            <v-card-text>
                                Stock: {{ product.stock }}

                                <v-spacer/>

                                <v-chip
                                    class="mt-2"
                                    v-for="tagItem in product.tags"
                                    :key="tagItem.id"
                                    :value="tagItem.name"
                                >
                                    {{ tagItem.name }}
                                </v-chip>

                                <v-spacer/>

                                <v-btn
                                    class="mt-2"
                                    color="primary"
                                    raised
                                    @click="buyProduct"
                                    :disabled="product.stock === 0"
                                >
                                    Buy for {{ product.price }} {{ constants.currencySymbol }}
                                </v-btn>
                            </v-card-text>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </div>
</template>

<script>
import { postTransaction } from '@/api-connectors/api-connector';
import { mapState } from 'vuex';
import { displayErrorNotification, displayBuyingNotification } from '@/utils/notifications';

export default {
    name: 'product-card',

    props: {
        product: Object,
    },

    data() {
        return {
            transaction: null,
            user: {},
        };
    },

    created() {
        this.user = this.$store.getters.user;
    },

    computed: {
        ...mapState(['constants']),
    },

    methods: {
        async buyProduct() {
            const order = {
                fromUserID: this.user.id,
                productID: this.product.id,
            };

            try {
                this.transaction = await postTransaction(order);
                this.product.stock = this.transaction.product.stock;

                const changedUser = this.transaction.fromUser;
                changedUser.password = this.user.password;
                this.$store.commit('changeUser', changedUser);

                displayBuyingNotification(
                    `You bought ${this.product.name}`,
                    {
                        product: this.product,
                        transaction: this.transaction,
                        callback: () => {
                            this.product.stock = this.product.stock + 1;
                        },
                    },
                );

                this.snackbar = true;
            } catch (error) {
                displayErrorNotification(error.message);
            }
        },
    },
};
</script>
