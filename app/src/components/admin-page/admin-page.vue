<template>
    <v-tabs>
        <v-tab id="admin-page-products">
            Products
        </v-tab>

        <v-tab id="admin-page-users">
            Users
        </v-tab>

        <v-tab id="admin-page-warehouse">
            Warehouse
        </v-tab>

        <v-tab id="admin-page-constants">
            Constants
        </v-tab>

        <v-tab id="admin-page-statistics">
            Statistics
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

        <v-tab-item>
            <statistics-tab/>
        </v-tab-item>
    </v-tabs>
</template>

<script>
export default {
    name: 'admin-page',

};
</script>
