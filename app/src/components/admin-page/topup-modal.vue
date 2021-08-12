<template>
    <div class="topup-dialog">
        <v-dialog
            max-width="500px"
            v-model="showDialog"
        >
            <v-form
                ref="form"
                v-model="valid"
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">
                            Top Up: {{ user.name }}
                        </span>
                    </v-card-title>

                    <v-card-text>
                        <v-text-field
                            v-model="amount"
                            label="Amount"
                            :suffix="this.constants.currencySymbol"
                            :rules="rules"
                            autofocus
                            @keydown="validateAndTopUp"
                        />
                    </v-card-text>

                    <v-card-actions>
                        <v-btn
                            color="blue darken-1"
                            text
                            @click="showDialog = false"
                        >
                            Cancel
                        </v-btn>

                        <v-btn
                            color="blue darken-1"
                            text
                            :disabled="!valid"
                            @click="topUp"
                        >
                            Top Up
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
    </div>
</template>

<script>
import { isNumber, isPositive } from '@/plugins/validation-rules';
import { getUsers, postTransaction } from '@/utils/api-connector';
import { mapState } from 'vuex';


export default {
    name: 'topup-dialog',

    props: {
        value: {
            type: Boolean,
            required: true,
        },
        user: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            valid: false,
            amount: 1,
            notification: false,
            notificationType: 'success',
            notificationText: ' ',
            rules: [
                value => isNumber(value),
                value => isPositive(value),
            ],
        };
    },

    computed: {
        ...mapState(['constants']),
        showDialog: {
            get() { return this.value; },
            set(showDialog) { this.$emit('input', showDialog); },
        },
    },

    methods: {
        async topUp() {
            try {
                const allUsers = await getUsers('system');
                const bank = allUsers.find(user => user.name === 'Bank');

                const transaction = {
                    fromUserID: bank.id,
                    toUserID: this.user.id,
                    amountOfMoneyInCents: Number((this.amount * 100).toFixed(2)),
                };

                const createdTransaction = await postTransaction(transaction);
                if (createdTransaction.toUser.id === this.$store.getters.user.id) {
                    this.$store.commit('changeUser', createdTransaction.toUser);
                }

                this.$emit('userTopedUp', this.user);

                this.$notify({
                    title: 'Success',
                    type: 'success',
                    text: `${this.user.name}'s balance got topped up`,
                });
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    type: 'error',
                    text: error.message,
                });
            }

            this.showDialog = false;
            setTimeout(() => {
                this.amount = 1;
            }, 300);
        },

        validateAndTopUp(event) {
            if (event.code === 'Enter') {
                if (this.$refs.form.validate()) {
                    this.topUp();
                }
            }
        },
    },
};
</script>

<style lang="scss">
    .topup-dialog{
    }
</style>
