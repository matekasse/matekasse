import http from '@/plugins/axios';

export const getStatistics = async () => {
    let response;
    try {
        response = await http.get('statistics');

        const { statistics } = response.data;
        statistics.forEach(
            (product) => {
                Object.assign(product, {
                    Name: (product.Name),
                    Counter: (product.Counter),
                });
            },
        );

        return statistics;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load statistics');
        }
        throw new Error(error.response.data.status);
    }
};

export const getStatisticsForUser = async (userId) => {
    let response;
    try {
        response = await http.get(`statistics/${userId}`);

        const { statistics } = response.data;
        statistics.forEach(
            (product) => {
                Object.assign(product, {
                    Name: (product.Name),
                    Counter: (product.Counter),
                });
            },
        );

        return statistics;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load statistics');
        }
        throw new Error(error.response.data.status);
    }
};
