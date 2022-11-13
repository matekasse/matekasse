import http from '@/plugins/axios';

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
