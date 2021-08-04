<template>
    <main>
        <notifications
            :max=3
        >
            <template slot="body" slot-scope="props">
                <notification
                    :props="props"
                />
            </template>
        </notifications>

        <notifications
            group="transaction"
            position="bottom center"
            :max=3
        >
            <template slot="body" slot-scope="props">
                <buy-product-notification
                    :props="props"
                />
            </template>
        </notifications>

        <transition mode="out-in">
            <router-view/>
        </transition>
    </main>
</template>

<script>
export default {
    props: {
        source: String,
    },
};
</script>
