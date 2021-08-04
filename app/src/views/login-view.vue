<template>
    <v-app id="login-home">
        <transition mode="out-in">
            <router-view/>
        </transition>
    </v-app>
</template>

<script>
export default {
    created() {
        this.$vuetify.theme.dark = true;
    },
};
</script>
