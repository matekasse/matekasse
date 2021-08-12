<template>
  <div class="constants-tab">
      <v-card>
          <v-card-title>
              <v-data-table
                no-data-text="No Constants"
                :headers="headers"
                :items="constantsAsArray"
              >

                <template v-slot:item.value="{item}">
                    <template v-if="constantsToEdit.includes(item.key)">
                        <v-text-field
                            v-model="item.value"
                            :append-outer-icon="item.value ? 'mdi-check' : ''"
                            @click:append-outer="updateItem(item)"
                        />
                    </template>
                    <template v-else>
                        {{item.value}}
                    </template>
                </template>

              <template v-slot:item.action="{item}">
                <v-icon
                    small
                    class="mr-2"
                    @click="editConstant(item)"
                >
                    mdi-pencil
                </v-icon>
              </template>

              </v-data-table>
          </v-card-title>
      </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { patchConstants } from '../../utils/api-connector';

export default {
    name: 'constants-tab',

    data() {
        return {
            constantsToEdit: [],
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
                    value: 'action',
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
                if (key !== 'createdAt' && key !== 'updatedAt' && key !== 'id') {
                    tempConstantsArray.push({
                        key,
                        value: constantValue,
                    });
                }
            });
            this.constantsAsArray = tempConstantsArray;
        },

        editConstant(item) {
            this.constantsToEdit.push(item.key);
        },

        async updateItem(item) {
            const { key, value } = item;

            const updatedConstants = {
                ...this.constants,
                [key]: value,
            };
            await patchConstants(updatedConstants);
            const index = this.constantsToEdit.findIndex(element => element === key);
            if (index !== -1) {
                this.constantsToEdit.splice(index, 1);
            }

            await this.$store.dispatch('setConstants', updatedConstants);
        },
    },

};
</script>

<style>

</style>
