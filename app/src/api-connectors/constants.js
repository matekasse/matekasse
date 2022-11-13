import http from '@/plugins/axios';

export const getConstants = async () => {
    try {
        const response = await http.get('/constants');

        return response.data.constants;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t get constants');
        }
        throw new Error(error.response.data.status);
    }
};

export const patchConstants = async (constants) => {
    try {
        await http.patch('/constants', constants);
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t update constants');
        }
        throw new Error(error.response.data.status);
    }
};
