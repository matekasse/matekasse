import http from '@/plugins/axios';

export const getWarehouseTransactions = async () => {
    try {
        const response = await http.get('warehouseTransactions');

        return response.data.warehouseTransactions;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load warehouse-transactions');
        }
        throw new Error(error.response.data.status);
    }
};

export const postWarehouseTransactions = async (warehouseTransaction) => {
    try {
        const response = await http.post('/warehousetransactions', warehouseTransaction);

        return response.data.warehouseTransaction;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t create warehouse-transaction');
        }
        throw new Error(error.response.data.status);
    }
};
