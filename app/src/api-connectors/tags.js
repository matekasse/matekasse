import http from '@/plugins/axios';

// eslint-disable-next-line import/prefer-default-export
export const getTags = async () => {
    try {
        const response = await http.get('tags');

        return response.data.tags;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load tags');
        }
        throw new Error(error.response.data.status);
    }
};
