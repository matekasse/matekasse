<template>
    <div class="notification">
        <v-card
            v-if="props"
            flat
            dark
            :color="type"
            @click="this.props.close"
        >
            <v-card-title>
                {{ props.item.title }}
            </v-card-title>

            <v-card-text>
                {{ props.item.text }}
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'notification',

    props: {
        props: Object,
    },

    computed: {
        type() {
            switch (this.props.item.type) {
            case 'error':
                return '#FF5252';
            case 'success':
                return '#4CAF50';
            case 'warn':
                return '#FFC107';
            case 'info':
                return '#2196F3';
            default:
                return '#2196F3';
            }
        },
    },
};
</script>
