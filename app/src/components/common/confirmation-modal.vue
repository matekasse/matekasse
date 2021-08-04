<template>
    <div class="confirmation-modal">
        <v-dialog v-model="showDialog" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">Confirmation</v-card-title>

                <v-card-text>Do you really want to {{ action }} {{ item }} </v-card-text>

                <v-card-actions>
                    <v-spacer/>

                    <v-btn
                        color="blue"
                        text
                        @click="abort"
                    >
                        No
                    </v-btn>

                    <v-btn
                        color="blue"
                        text
                        @click="confirm"
                    >
                        Yes
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'confirmation-modal',

    props: {
        value: {
            type: Boolean,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        item: {
            type: String,
            required: true,
        },
    },

    data() {
        return {
        };
    },

    computed: {
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
    },

    methods: {
        confirm() {
            this.$emit('confirm', true);
            this.showDialog = false;
        },
        abort() {
            this.$emit('abort', true);
            this.showDialog = false;
        },
    },
};
</script>
