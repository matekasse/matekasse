import http from '@/plugins/axios';

// eslint-disable-next-line import/prefer-default-export
export const postTransaction = async (transaction) => {
    try {
        const response = await http.post('/transactions', transaction);

        return response.data.createdTransaction;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t create transaction');
        }
        throw new Error(error.response.data.status);
    }
};
