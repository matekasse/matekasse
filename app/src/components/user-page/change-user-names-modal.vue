<template>
    <v-dialog
        v-model="showDialog"
        max-width="500px"
    >
        <v-card>
            <v-card-title>
                <span class="headline">Change user</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-row>
                        <v-form
                            ref="form"
                        >
                            <v-col>
                                <v-text-field
                                    label="Username"
                                    v-model="defaultUser.name"
                                    required
                                    @keydown="validateAndSave"
                                />
                            </v-col>
                        </v-form>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer/>

                <v-btn
                    color="blue darken-1"
                    text
                    @click="save"
                >
                    Save
                </v-btn>

                <v-btn
                    color="blue darken-1"
                    text
                    @click="showDialog = false"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { patchUser } from '@/api-connectors/api-connector';

export default {
    name: 'change-user-names-modal',

    data() {
        return {
            dialog: false,
            editedUser: {},
        };
    },

    props: {
        user: Object,
        value: {
            type: Boolean,
            required: true,
        },
    },

    computed: {
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
        defaultUser() {
            return Object.assign({}, this.user);
        },
    },

    create() {
        this.defaultUser = this.user;
    },

    watch: {
        showDialog(value) {
            if (value) {
                this.defaultUser = this.user;
            }
        },
    },

    methods: {
        async save() {
            try {
                const updatedUser = await patchUser(this.defaultUser.id, this.defaultUser);
                this.$store.commit('changeUser', updatedUser);
                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: 'Updated profile',
                });
                this.showDialog = false;
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
    },
};
</script>
