<template>
  <div class="constants-tab">
      <v-card>
          <v-card-title>
              <v-data-table
                no-data-text="No Constants"
                :headers="headers"
                :items="constantsAsArray"
              >

              </v-data-table>
          </v-card-title>
      </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'constants-tab',

    data() {
        return {
            constantsAsArray: [],
            headers: [
                {
                    text: 'Constant',
                    value: 'key',
                },
                {
                    text: 'Value',
                    value: 'value',
                },
                {
                    text: 'Edit',
                    value: 'actions',
                    align: 'right',
                },
            ],
        };
    },

    computed: mapState(['constants']),

    created() {
        this.createConstantsArray();
    },

    watch: {
        constants() {
            this.createConstantsArray();
        },
    },

    methods: {
        createConstantsArray() {
            const tempConstantsArray = [];
            const entries = Object.entries(this.constants);
            entries.forEach(([key, constantValue]) => {
                tempConstantsArray.push({
                    key,
                    value: constantValue,
                });
            });
            console.log(tempConstantsArray);
            this.constantsAsArray = tempConstantsArray;
        },
    },

};
</script>

<style>

</style>
