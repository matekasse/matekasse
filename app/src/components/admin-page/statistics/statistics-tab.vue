<template>
    <v-card>
        <v-data-table
            no-data-text="No Statistics"
            :headers="headers"
            :items="products"
            :loading="isLoading"
        >
            <template v-slot:item.name="{ item }">
                {{ item.Name }}
            </template>

            <template v-slot:item.counter="{ item }">
                {{ item.Counter }}
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import { getStatistics } from '@/api-connectors/api-connector';

export default {
    name: 'product-tab',

    data() {
        return {
            products: [],
            isLoading: true,
            headers: [
                {
                    text: 'Name',
                    value: 'Name',
                },
                {
                    text: 'Counter',
                    value: 'Counter',
                },
            ],
        };
    },

    created() {
        this.loadStatistics();
    },

    methods: {
        async loadStatistics() {
            this.isLoading = true;
            this.products = await getStatistics();
            this.products.sort(
                (productA, productB) => productA.name.toLowerCase() > productB.name.toLowerCase(),
            );

            this.isLoading = false;
        },
    },
};
</script>
