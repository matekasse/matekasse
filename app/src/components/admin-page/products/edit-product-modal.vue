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
                                        :suffix="constants.currencySymbol"
                                        placeholder="0.00"
                                        :rules="numberRules"
                                        @keydown="validateAndSave"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6" md="3">
                                    <v-text-field
                                        v-model="editProduct.bottleDeposit"
                                        label="Deposit"
                                        :suffix="constants.currencySymbol"
                                        placeholder="0.00"
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
                                        height="200"
                                        width="200"
                                        :contain="true"
                                        :src="fileToDisplay"
                                    />

                                    <v-img
                                        v-else
                                        height="200"
                                        width="200"
                                        :contain="true"
                                        :src="editProduct.picture"
                                    />
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <v-autocomplete
                                        :value="selectedManufacturerNameOrUndefined"
                                        :items="manufacturerSearchItems"
                                        :search-input.sync="manufacturerSearch"
                                        @change="onManufacturerSelect"
                                        item-text="name"
                                        item-value="name"
                                        label="Manufacturer"
                                        single-line
                                    >
                                    </v-autocomplete>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <v-autocomplete
                                        v-model="editProduct.tags"
                                        :items="tagSearchItems"
                                        :search-input.sync="tagSearch"
                                        @change="onTagSelect"
                                        label="tags"
                                        item-text="name"
                                        multiple
                                        chips
                                        deletable-chips
                                    >
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
} from '@/api-connectors/api-connector';
import {
    isNumber, notEmpty, atLeastZero, maxFileSize,
} from '@/plugins/validation-rules';
import { mapState } from 'vuex';

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
                value => notEmpty(value),
                value => isNumber(value),
                value => atLeastZero(value),
            ],
            fileRules: [
                value => maxFileSize(value),
            ],
            editProduct: {},
        };
    },

    computed: {
        ...mapState(['constants']),
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
        tagSearchItems() {
            if (this.tagSearch && !this.tags.includes(this.tagSearch)) {
                return [this.tagSearch, ...this.tags];
            }

            return this.tags;
        },
        manufacturerSearchItems() {
            if (!this.manufacturerSearch) {
                return this.manufacturers;
            }

            const manufacturerWithSearchNameExists = this.manufacturers.find(
                manufacturer => manufacturer.name === this.manufacturerSearch,
            );

            if (!manufacturerWithSearchNameExists) {
                return [this.manufacturerSearch, ...this.manufacturers];
            }

            return this.manufacturers;
        },
        selectedManufacturerNameOrUndefined() {
            return this.editProduct.manufacturer ? this.editProduct.manufacturer.name : undefined;
        },
    },

    created() {
        this.editProduct = Object.assign({}, this.product);
        this.loadManufacturers();
        this.loadTags();
    },

    watch: {
        showDialog(value) {
            if (value) {
                this.editProduct = Object.assign({}, this.product);
                if (this.$refs.form) {
                    this.$refs.form.resetValidation();
                }
            }
        },
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

        async onManufacturerSelect(selectedManufacturer) {
            const manufacturerExists = this.manufacturers.find(
                manufacturer => manufacturer.name === selectedManufacturer,
            );

            let manufacturerToAdd;
            if (!manufacturerExists) {
                manufacturerToAdd = await this.createNewManufacturer(selectedManufacturer);
            } else {
                manufacturerToAdd = manufacturerExists;
            }

            this.editProduct.manufacturer = manufacturerToAdd;
            this.editProduct.manufacturerID = manufacturerToAdd.id;
        },

        onTagSelect(selectedTags) {
            if (!selectedTags) return;

            selectedTags.forEach((tag) => {
                if (!this.tags.includes(tag)) {
                    this.createNewTag(tag);
                }

                this.tagSearch = '';
            });
        },

        createNewTag(tag) {
            if (tag === '') {
                return;
            }

            this.tags.push(tag);
        },

        async createNewManufacturer(name) {
            const newManufacturer = {
                name,
            };
            const createdManufacturer = await postManufacturers(newManufacturer);
            this.manufacturers.push(createdManufacturer);
            return createdManufacturer;
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
