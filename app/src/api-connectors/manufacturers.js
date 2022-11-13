import http from '@/plugins/axios';

export const getManufacturers = async () => {
    try {
        const response = await http.get('manufacturers');

        return response.data.manufacturers;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load manufacturers');
        }
        throw new Error(error.response.data.status);
    }
};

export const postManufacturers = async (manufacturer) => {
    try {
        const response = await http.post('manufacturers', manufacturer);

        return response.data.manufacturer;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t create manufacturer');
        }
        throw new Error(error.response.data.status);
    }
};
