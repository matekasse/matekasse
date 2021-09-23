<template>
    <v-tabs>
        <v-tab>
            Products
        </v-tab>

        <v-tab>
            Users
        </v-tab>

        <v-tab>
            Warehouse
        </v-tab>

        <v-tab>
            Constants
        </v-tab>

        <v-tab-item>
            <product-tab/>
        </v-tab-item>

        <v-tab-item>
            <users-tab/>
        </v-tab-item>

        <v-tab-item>
            <warehouse-tab/>
        </v-tab-item>

        <v-tab-item>
            <constants-tab/>
        </v-tab-item>
    </v-tabs>
</template>

<script>
export default {
    name: 'admin-page',

};
</script>
