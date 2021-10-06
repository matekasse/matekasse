<template>
    <v-row justify="center">
    <v-dialog
      v-model="showDialog"
      max-width="800"
    >
      <v-card>
        <v-card-title class="text-h5">
          This will take away your admin privileges!
        </v-card-title>
        <v-card-text>
            Do you really want to take away your privileges?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="showDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="onConfirm"
          >
            Disable
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
    name: 'disable-user-confirmation-modal',

    props: {
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
    },

    methods: {
        onConfirm() {
            this.$emit('confirm');
            this.showDialog = false;
        },
    },
};
</script>

<style>

</style>
