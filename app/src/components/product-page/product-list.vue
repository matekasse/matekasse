<template>
    <div id="product-list">
        <v-card>
            <v-card-title>
                <v-container class="mb-n6" align="center">
                    <v-row
                        class="my-n5"
                    >
                        <v-col>
                            <v-text-field
                                v-model="search"
                                label="Search"
                                single-line
                                hide-details
                                outlined
                                dense
                            />
                        </v-col>

                        <v-col>
                            <v-autocomplete
                                v-model="selectedTags"
                                :items="tags"
                                label="Tags"
                                item-text="name"
                                multiple
                                align-self="center"
                                outlined
                                chips
                                dense
                                deletable-chips
                                @change="filter"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-title>
        </v-card>

        <v-container
            v-if="filteredProducts.length > 0"
        >
            <v-row>
                <v-col
                    v-for="product in filteredProducts"
                    xs="1"
                    sm="6"
                    md="6"
                    lg="4"
                    xl="3"
                    :key=product.id
                >
                    <product-card
                        :product="product"
                    />
                </v-col>
            </v-row>
        </v-container>

        <v-container
            v-else
            fluid
            class="fill-height"
        >
            <v-layout
            align="center"
            class="d-flex flex-column flex-grow ">
                <v-icon
                    x-large
                    class="pa-2"
                >
                    mdi-information
                </v-icon>

                <span
                    class="headline pa-2 align-self-center"
                >
                    No Products
                </span>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
import { getProducts, getTags } from '@/api-connectors/api-connector';

export default {
    name: 'product-list',

    data() {
        return {
            search: '',
            tags: [],
            selectedTags: [],
            allProducts: [],
            filteredProducts: [],
        };
    },

    watch: {
        search() {
            this.filter();
        },
    },

    async created() {
        await this.loadProducts();
        await this.loadTags();
    },

    methods: {
        async loadProducts() {
            try {
                this.allProducts = await getProducts('active');
                this.filteredProducts = this.allProducts;
                this.sortFilteredProducts();
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
        },

        async loadTags() {
            this.isLoading = true;
            try {
                this.tags = await getTags();
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }

            this.isLoading = false;
        },

        async filter() {
            // filter by tags
            let products;
            if (this.selectedTags.length > 0) {
                products = this.allProducts.filter(
                    product => product.tags.some(tag => this.selectedTags.includes(tag.name)),
                );
            } else {
                products = this.allProducts;
            }

            if (!products || products.length === 0) {
                return;
            }

            // filter search string
            this.filteredProducts = products.filter((product) => {
                const searchstring = new RegExp(this.search, 'i');
                if (product.name.match(searchstring)
                || (product.manufacturer && product.manufacturer.name.match(searchstring))) {
                    return true;
                }
                return product.tags.find(tag => tag.name.match(searchstring));
            });

            this.sortFilteredProducts();
        },

        sortFilteredProducts() {
            if (!this.filteredProducts || this.filteredProducts.length <= 1) {
                return;
            }

            // sort alphabetically by name and put products with empty stock in the back
            this.filteredProducts.sort((productA, productB) => {
                if (productA.stock !== 0 && productB.stock !== 0) {
                    return productA.name.toLowerCase() > productB.name.toLowerCase();
                }

                if (productA.stock === 0 && productB.stock === 0) {
                    return productA.name.toLowerCase() > productB.name.toLowerCase();
                }

                if (productA.stock === 0 && productB.stock !== 0) {
                    return true;
                }

                if (productA.stock !== 0 && productB.stock === 0) {
                    return false;
                }

                return 0;
            });
        },
    },
};
</script>z
