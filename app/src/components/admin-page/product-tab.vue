<template>
    <v-card>
        <v-card-title>
            <v-text-field
                v-model="search"
                label="Search"
                single-line
                hide-details
                sort-by.sync="'stock'"
            />

            <v-spacer/>

            <v-btn color="primary" dark class="mb-2" @click="newItem">New Item</v-btn>
        </v-card-title>

        <v-data-table
            no-data-text="No Products"
            :headers="headers"
            :items="products"
            :search="search"
            :loading="isLoading"
        >
            <template v-slot:item.picture="{ item }">
                <v-img
                    height="50"
                    width="50"
                    :contain="true"
                    :src="item.picture"
                />
            </template>

            <template v-slot:item.price="{ item }">
                {{ item.price }} {{constants.currencySymbol}}
            </template>

            <template v-slot:item.bottleDeposit="{ item }">
                {{ item.bottleDeposit }} {{constants.currencySymbol}}
            </template>

            <template v-slot:item.tags="{ item }">
                <div
                    v-if="item.tags.length > 0"
                >
                    <v-chip
                        v-for="tagItem in item.tags"
                        :key="tagItem.id"
                        :value="tagItem.name"
                    >
                        {{ tagItem.name }}
                    </v-chip>
                </div>
            </template>

            <template v-slot:item.price="{ item }">
                {{ item.price }} {{constants.currencySymbol}}
            </template>

            <template v-slot:item.bottleDeposit="{ item }">
                {{ item.bottleDeposit }} {{constants.currencySymbol}}
            </template>

            <template v-slot:item.action="{ item }">
                <v-icon
                    small
                    class="mr-2"
                    @click="editItem(item)"
                >
                    mdi-pencil
                </v-icon>

                <v-icon
                    small
                    @click="initiateDeletion(item)"
                >
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>

        <confirmation-modal
            v-if="productToBeDeleted"
            v-model="showConfirmationDialog"
            action="delete"
            :item="productToBeDeleted.name"
            @confirm="confirmDeletion"
            @abort="abortDeletion"
        />

        <edit-product-modal
            v-model="showProductEditDialog"
            :product="editedItem"
            :editMode="editMode"
            @productsChanged="loadProducts"
        />
    </v-card>
</template>

<script>
import { getProducts, deleteProduct } from '@/utils/api-connector';
import { mapState } from 'vuex';

export default {
    name: 'product-tab',

    data() {
        return {
            search: '',
            showProductEditDialog: false,
            showConfirmationDialog: false,
            products: [],
            editMode: false,
            productToBeDeleted: null,
            editedItem: {
                id: null,
                name: '',
                stock: 0,
                price: 0.00,
                bottleDeposit: 0.00,
                tags: [],
                manufacturerID: null,
            },
            isLoading: true,
            headers: [
                {
                    text: 'Name',
                    value: 'name',
                },
                {
                    text: 'Picture',
                    value: 'picture',
                },
                {
                    text: 'Stock',
                    value: 'stock',
                    filterable: false,
                },
                {
                    text: 'Price',
                    value: 'price',
                    filterable: false,
                },
                {
                    text: 'Deposit',
                    value: 'bottleDeposit',
                    filterable: false,
                },
                {
                    text: 'Manufacturer',
                    value: 'manufacturer.name',
                    filterable: false,
                },
                {
                    text: 'Tags',
                    value: 'tags',
                    filterable: false,
                },
                {
                    text: 'Edit',
                    value: 'action',
                    sortable: false,
                    filterable: false,
                    align: 'right',
                },
            ],
        };
    },

    created() {
        this.loadProducts();
    },

    computed: {
        ...mapState(['constants']),
    },

    methods: {
        async loadProducts() {
            this.isLoading = true;
            this.products = await getProducts('active');
            this.products.sort(
                (productA, productB) => productA.name.toLowerCase() > productB.name.toLowerCase(),
            );

            this.isLoading = false;
        },

        newItem() {
            this.editMode = false;
            const defaultProduct = {
                id: null,
                name: '',
                stock: 0,
                price: null,
                bottleDeposit: null,
                tags: [],
                manufacturerID: null,
            };
            this.editedItem = Object.assign({}, defaultProduct);
            this.showProductEditDialog = true;
        },

        editItem(item) {
            this.editedItem = Object.assign({}, item);
            this.editMode = true;
            // delete all info except the tag names
            const tagNames = this.editedItem.tags.map(tag => tag.name);
            this.editedItem.tags = tagNames;
            // create new object instance, so values of the product in the table
            // does not change, when the values are changed in the modal
            this.showProductEditDialog = true;
        },

        initiateDeletion(item) {
            this.productToBeDeleted = item;
            this.showConfirmationDialog = true;
        },

        abortDeletion() {
            this.productToBeDeleted = null;
            this.showConfirmationDialog = false;
        },

        async confirmDeletion() {
            if (this.productToBeDeleted === null) {
                this.showConfirmationDialog = false;
                return;
            }
            try {
                await deleteProduct(this.productToBeDeleted.id);
                this.showConfirmationDialog = false;
                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: `Deleted product: ${this.productToBeDeleted.name}`,
                });
                this.productToBeDeleted = null;
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
            this.loadProducts();
        },
    },
};
</script>
