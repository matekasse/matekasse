<template>
    <div class="buy-product-notification">
        <v-card
            v-if="props"
            flat
            dark
            :color="type"
        >
            <v-card-title>
                {{ props.item.title }}
            </v-card-title>

            <v-card-text>
                {{ props.item.text }}
            </v-card-text>

            <v-card-actions>
                <v-btn
                    color="blue"
                    text
                    @click="stornoProduct"
                >
                    Storno
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
import { postTransaction } from '@/utils/api-connector';

export default {
    name: 'buy-product-notification',

    props: {
        props: Object,
    },

    computed: {
        type() {
            switch (this.props.item.type) {
            case 'error':
                return '#FF5252';
            case 'success':
                return '#4CAF50';
            case 'warn':
                return '#FFC107';
            case 'info':
                return '#2196F3';
            default:
                return '#2196F3';
            }
        },
    },

    methods: {
        async stornoProduct() {
            const storno = {
                stornoOfTransactionID: this.props.item.data.transaction.id,
            };

            try {
                const createdTransaction = await postTransaction(storno);
                this.$store.commit('changeUser', createdTransaction.toUser);

                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: `${this.props.item.data.product.name} was refunded`,
                });
                this.props.item.data.callback();
                this.props.close();
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
        },
    },
};
</script>
