<template>
    <v-dialog v-model="showDialog" persistent max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline">
                    {{ formTitle }}
                </span>
            </v-card-title>

            <v-card-text>
                <v-form
                    ref="form"
                    v-model="valid"
                >
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                    v-model="editProduct.name"
                                    label="Product name"
                                    :rules="nameRules"
                                    @keydown="validateAndSave"
                                />
                            </v-col>

                                <v-col cols="12" sm="6" md="3">
                                    <v-text-field
                                        v-model="editProduct.price"
                                        label="Price"
                                        suffix="€"
                                        :rules="numberRules"
                                        @keydown="validateAndSave"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6" md="3">
                                    <v-text-field
                                        v-model="editProduct.bottleDeposit"
                                        label="Deposit"
                                        suffix="€"
                                        :rules="numberRules"
                                        @keydown="validateAndSave"
                                    />
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <v-file-input
                                        v-model="uploadedFile"
                                        show-size
                                        :rules="fileRules"
                                    />
                                </v-col>

                                <v-col>
                                    <v-img
                                        v-if="fileToDisplay"
                                        height="180"
                                        width="100"
                                        :src="fileToDisplay"
                                    />
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <v-autocomplete
                                        v-model="editProduct.manufacturerID"
                                        :items="manufacturers"
                                        :search-input.sync="manufacturerSearch"
                                        item-text="name"
                                        item-value="id"
                                        label="Manufacturer"
                                        single-line
                                    >
                                        <template
                                            v-slot:no-data
                                        >
                                            <div
                                                @click="createNewManufacturer"
                                            >
                                                {{manufacturerSearch}}
                                            </div>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <v-autocomplete
                                        v-model="editProduct.tags"
                                        :items="tags"
                                        :search-input.sync="tagSearch"
                                        label="tags"
                                        item-text="name"
                                        multiple
                                        chips
                                        deletable-chips
                                    >
                                        <template
                                            v-slot:no-data
                                        >
                                            <div
                                                @click="createNewTag"
                                            >
                                            {{tagSearch}}
                                        </div>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
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
                    {{ confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import {
    getTags, getManufacturers, postManufacturers, postProduct, patchProduct, postPictureToProduct,
} from '@/utils/api-connector';
import {
    isNumber, notEmpty, atLeastZero, maxFileSize,
} from '@/plugins/validation-rules';

export default {
    name: 'edit-product-modal',

    props: {
        value: {
            type: Boolean,
            required: true,
        },
        product: {
            type: Object,
            required: true,
        },
        editMode: {
            type: Boolean,
        },
    },

    data() {
        return {
            valid: false,
            tags: [],
            manufacturers: [],
            tagSearch: '',
            manufacturerSearch: '',
            uploadedFile: null,
            nameRules: [
                value => notEmpty(value),
            ],
            numberRules: [
                value => isNumber(value),
                value => atLeastZero(value),
            ],
            fileRules: [
                value => maxFileSize(value),
            ],
        };
    },

    computed: {
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
        formTitle() {
            return this.editMode === false ? 'New Item' : 'Edit Item';
        },
        confirmText() {
            return this.editMode === false ? 'Create' : 'Save';
        },
        fileToDisplay() {
            if (!this.uploadedFile) {
                return '';
            }
            return URL.createObjectURL(this.uploadedFile);
        },
        editProduct() {
            return Object.assign({}, this.product);
        },
    },

    created() {
        this.loadManufacturers();
        this.loadTags();
    },

    methods: {
        async loadTags() {
            this.isLoading = true;
            this.tags = await getTags();
            this.isLoading = false;
        },

        async loadManufacturers() {
            this.isLoading = true;
            this.manufacturers = await getManufacturers();
            this.isLoading = false;
        },

        async createNewTag() {
            if (this.tagSearch === '') {
                return;
            }

            this.editProduct.tags.push(this.tagSearch);
            this.tags.push(this.tagSearch);
            this.tagSearch = '';
        },

        async createNewManufacturer() {
            const newManufacturer = {
                name: this.manufacturerSearch,
            };
            const manufacturer = await postManufacturers(newManufacturer);
            this.manufacturers.push(manufacturer);
            this.editProduct.manufacturerID = manufacturer.id;
        },

        async save() {
            try {
                this.editProduct.priceInCents = Number((this.editProduct.price * 100).toFixed());
                this.editProduct.bottleDepositInCents = Number(
                    (this.editProduct.bottleDeposit * 100).toFixed(),
                );
                delete this.editProduct.picture;
                let createdProduct;
                if (this.editMode === false) {
                    createdProduct = await postProduct(this.editProduct);
                } else {
                    createdProduct = await patchProduct(this.editProduct.id, this.editProduct);
                }

                if (this.uploadedFile) {
                    await postPictureToProduct(createdProduct.id, this.uploadedFile);
                    this.uploadedFile = null;
                }

                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: `Saved product: ${this.editProduct.name}`,
                });
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }
            this.$emit('productsChanged', this.editProduct);
            this.close();
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
        },
    },
};
</script>
