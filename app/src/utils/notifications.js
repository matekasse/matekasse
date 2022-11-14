import Vue from 'vue';

export function displaySuccessNotification(message) {
    Vue.notify({
        title: 'Success',
        type: 'success',
        text: message,
    });
}

export function displayErrorNotification(message) {
    Vue.notify({
        title: 'Error',
        type: 'error',
        text: message,
    });
}


export function displayBuyingNotification(message, data) {
    Vue.notify({
        group: 'transaction',
        title: 'Success',
        type: 'info',
        duration: 8000,
        text: message,
        data,
    });
}
