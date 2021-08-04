import Vue from 'vue';
import Notifications from 'vue-notification';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

const requireComponent = require.context(
    // The relative path of the components folder
    './components',
    // Whether or not to look in subfolders
    true,
    // The regular expression used to match base component filenames
    /([a-z])+(-([a-z])*)*\.vue$/,
);

requireComponent.keys().forEach((fileName) => {
    // Get component config
    const componentConfig = requireComponent(fileName);

    // Get PascalCase name of component
    const componentName = fileName
    // Remove the "./_" from the beginning
        .replace(/([a-z])+(-([a-z])*)*\//, '')
        .replace(/^\.\//, '')
    // Remove the file extension from the end
        .replace(/\.\w+$/, '');

    // Register component globally
    Vue.component(
        componentName,
        // Look for the component options on `.default`, which will
        // exist if the component was exported with `export default`,
        // otherwise fall back to module's root.
        componentConfig.default || componentConfig,
    );
});

Vue.config.productionTip = false;

Vue.use(Notifications);

new Vue({
    router,
    store,
    vuetify,
    Notifications,
    render: h => h(App),
}).$mount('#app');
