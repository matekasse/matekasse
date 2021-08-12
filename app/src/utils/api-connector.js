import http from '@/plugins/axios';
import beerImage from '@/assets/beer.png';

export const getProducts = async (type) => {
    let response;
    try {
        if (!type) {
            response = await http.get('products');
        } else {
            response = await http.get(`products/${type}`);
        }

        const { products } = response.data;
        products.forEach(
            (product) => {
                Object.assign(product, {
                    price: (product.priceInCents / 100).toFixed(2),
                    bottleDeposit: (product.bottleDepositInCents / 100).toFixed(2),
                });
                if (!product.picture) {
                    Object.assign(product, {
                        picture: beerImage,
                    });
                } else {
                    Object.assign(product, {
                        picture: `data:image/png;base64, ${product.picture}`,
                    });
                }
            },
        );

        return products;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load products');
        }
        throw new Error(error.response.data.status);
    }
};

export const postProduct = async (product) => {
    try {
        const response = await http.post('/products', product);

        return response.data.product;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t create product');
        }
        throw new Error(error.response.data.status);
    }
};

export const postPictureToProduct = async (id, picture) => {
    try {
        const formData = new FormData();
        formData.append('image', picture);
        const response = await http.post(`/products/${id}/picture`, formData);

        return response.data.product;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t save picture');
        }
        throw new Error(error.response.data.status);
    }
};

export const patchProduct = async (id, product) => {
    try {
        const response = await http.patch(`/products/${id}`, product);

        return response.data.product;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t update product');
        }
        throw new Error(error.response.data.status);
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await http.delete(`/products/${id}`);

        return response.data.status;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t delete product');
        }
        throw new Error(error.response.data.status);
    }
};

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

export const loginUser = async (user) => {
    try {
        const response = await http.post('/users/authorize', user);

        return response.data.data;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t login');
        }
        throw new Error(error.response.data.status);
    }
};

export const getUsers = async (type) => {
    let response;
    try {
        if (!type) {
            response = await http.get('users');
        } else {
            response = await http.get(`users/${type}`);
        }

        const { users } = response.data;
        users.forEach(
            (user) => {
                Object.assign(user, {
                    balance: (user.balance / 100).toFixed(2),
                });
            },
        );

        users.sort((userA, userB) => userA.name.localeCompare(userB.name));

        return users;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load users');
        }
        throw new Error(error.response.data.status);
    }
};

export const postUser = async (user) => {
    try {
        const response = await http.post('/users', user);

        return response.data.user;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t create user');
        }
        throw new Error(error.response.data.status);
    }
};

export const getUserById = async (id) => {
    try {
        const response = await http.get(`/users/${id}`);

        return response.data.user;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load user');
        }
        throw new Error(error.response.data.status);
    }
};

export const patchUser = async (id, user) => {
    try {
        const response = await http.patch(`/users/${id}`, user);

        return response.data.user;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t update user');
        }
        throw new Error(error.response.data.status);
    }
};

export const getUserTransactions = async () => {
    try {
        const response = await http.get('/users/transactions');
        const { transactions } = response.data;

        transactions.forEach(
            transaction => Object.assign(transaction, {
                total: (transaction.amountOfMoneyInCents / 100).toFixed(2),
                createdAt: new Date(parseInt(transaction.createdAt, 10)),
            }),
        );

        return transactions;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t load transactions');
        }
        throw new Error(error.response.data.status);
    }
};

export const changeUsersPassword = async (id, user) => {
    try {
        const response = await http.patch(`/users/password/${id}`, user);

        return response.data.user;
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t update password');
        }
        throw new Error(error.response.data.status);
    }
};

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

export const getConstants = async () => {
    try {
        const response = await http.get('/constants');

        console.log(response);

        return response.data.constants[0];
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t get constants');
        }
        throw new Error(error.response.data.status);
    }
};

export const patchConstants = async (constants) => {
    try {
        const response = await http.patch('/constants', constants);

        console.log(response.data);
    } catch (error) {
        if (!error.response) {
            throw new Error('couldn\'t update constants');
        }
        throw new Error(error.response.data.status);
    }
};
