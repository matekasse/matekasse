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
