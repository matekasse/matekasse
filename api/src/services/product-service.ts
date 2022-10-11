import { getRepository } from "typeorm";
import { Product } from "../entity/product";
import { ManufacturerService } from "./manufacturer-service";
import { Manufacturer } from "../entity/manufacturer";
import { Tag } from "../entity/tag";
import { TagService } from "./tag-service";
import { Transaction } from "../entity/transaction";
import { WarehouseTransaction } from "../entity/warehouse-transaction";

export class ProductService {
    private static getProductRepository() {
        return getRepository(Product);
    }

    public static async getAllProducts() {
        const productRepository = this.getProductRepository();

        return await productRepository.find();
    }

    public static async getActiveProducts() {
        const productRepository = this.getProductRepository();

        return await productRepository.find({
            where: {
                isDisabled: false,
            },
        });
    }

    public static async createProduct(options: {
        name: string;
        bottleDepositInCents: number;
        manufacturerID?: string;
        description?: string;
        priceInCents: number;
        isDisabled?: boolean;
        tags?: string[];
    }): Promise<Product> {
        const productRepository = this.getProductRepository();
        let manufacturer: Manufacturer;
        let previousProduct: Product;
        try {
            previousProduct = await productRepository.findOne({
                where: { name: options.name, isDisabled: true },
            });
        } catch (error) {
            throw new Error("Could not get previousProduct");
        }

        if (options.manufacturerID !== undefined) {
            manufacturer = await ManufacturerService.getManufacturerByID({
                manufacturerID: options.manufacturerID,
            });
        }

        let allFoundOrCreatedTags;

        try {
            if (options.tags) {
                let foundTags: Promise<Tag>[] = options.tags.map(
                    async (tag) => {
                        return await TagService.upsertTag({ name: tag });
                    }
                );

                allFoundOrCreatedTags = await Promise.all(foundTags);
            }
        } catch (error) {
            throw new Error("Could not create tags.");
        }

        if (previousProduct) {
            try {
                previousProduct.bottleDepositInCents =
                    options.bottleDepositInCents;
                previousProduct.description = options.description;
                previousProduct.manufacturer = manufacturer;
                previousProduct.priceInCents = options.priceInCents;
                previousProduct.isDisabled = options.isDisabled;
                previousProduct.tags = allFoundOrCreatedTags;
                previousProduct.isDisabled = false;
                previousProduct.stock = 0;

                return await productRepository.save(previousProduct);
            } catch (error) {
                throw new Error("Could not create product.");
            }
        }

        try {
            const product = new Product({
                name: options.name,
                bottleDepositInCents: options.bottleDepositInCents,
                description: options.description,
                manufacturer: manufacturer,
                priceInCents: options.priceInCents,
                isDisabled: options.isDisabled,
                tags: allFoundOrCreatedTags,
            });

            return await productRepository.save(product);
        } catch (error) {
            throw new Error("Could not create product.");
        }
    }

    public static async updateProduct(product: Product): Promise<Product> {
        const productRepository = this.getProductRepository();
        product.updatedAt = String(Date.now());

        return await productRepository.save(product);
    }

    public static async getProductByID(options: {
        productID: string;
    }): Promise<Product> {
        const productRepository = this.getProductRepository();
        try {
            const product = await productRepository.findOneOrFail({
                where: {
                    id: Number(options.productID),
                },
            });

            return product;
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async deleteProductByID(options: { productID: string }) {
        const productRepository = this.getProductRepository();
        const transactionRepository = getRepository(Transaction);
        const warehouseTransactionRepository =
            getRepository(WarehouseTransaction);
        let transactions: Transaction[];
        let warehouseTransactions: WarehouseTransaction[];
        let productToDelete: Product;

        try {
            productToDelete = await productRepository.findOneOrFail({
                where: {
                    id: Number(options.productID),
                },
            });
        } catch (error) {
            throw new Error("Could not load product");
        }

        try {
            transactions = await transactionRepository.find({
                where: { product: productToDelete },
            });
        } catch (error) {
            throw new Error("Could not load transactions");
        }

        try {
            warehouseTransactions = await warehouseTransactionRepository.find({
                where: { product: productToDelete },
            });
        } catch (error) {
            throw new Error("Could not load warehouseTransactions");
        }

        if (transactions.length === 0 && warehouseTransactions.length === 0) {
            try {
                const tagsOfProduct = productToDelete.tags;

                let deleteTags = tagsOfProduct.map(async (tag) => {
                    const products = await tag.products;
                    if (
                        products.length === 1 &&
                        products[0].id === productToDelete.id
                    ) {
                        return await TagService.deleteTag({
                            tagID: String(tag.id),
                        });
                    }
                });

                await Promise.all(deleteTags);
            } catch (error) {
                throw new Error("Could not delete tags");
            }
            try {
                await productRepository.delete(options.productID);
            } catch (error) {
                throw new Error("Could not delete product");
            }
        } else {
            productToDelete.isDisabled = true;
            await productRepository.save(productToDelete);
        }
    }

    public static async updateProductByID(options: {
        productID?: string;
        name?: string;
        bottleDepositInCents?: number;
        stock?: number;
        description?: string;
        priceInCents?: number;
        manufacturerID?: string;
        isDisabled?: boolean;
        tags?: string[];
    }): Promise<Product> {
        const productRepository = this.getProductRepository();
        let product: Product;
        let manufacturer: Manufacturer;

        if (options.manufacturerID !== undefined) {
            try {
                manufacturer = await ManufacturerService.getManufacturerByID({
                    manufacturerID: options.manufacturerID,
                });
            } catch (error) {
                return error;
            }
        }
        try {
            product = await productRepository.findOneOrFail({
                where: { id: Number(options.productID) },
            });
        } catch (error) {
            throw new Error("No product found");
        }

        try {
            product.name = options.name ? options.name : product.name;
            product.bottleDepositInCents = options.bottleDepositInCents
                ? options.bottleDepositInCents
                : product.bottleDepositInCents;
            product.stock = options.stock ? options.stock : product.stock;
            product.description = options.description
                ? options.description
                : product.description;
            product.priceInCents = options.priceInCents
                ? options.priceInCents
                : product.priceInCents;
            product.manufacturer = manufacturer
                ? manufacturer
                : product.manufacturer;
            product.isDisabled =
                options.isDisabled !== undefined
                    ? options.isDisabled
                    : product.isDisabled;

            if (options.tags) {
                let foundTags: Promise<Tag>[] = options.tags.map(
                    async (tag) => {
                        return await TagService.upsertTag({ name: tag });
                    }
                );

                const allFoundTags = await Promise.all(foundTags);
                product.tags = allFoundTags;
            }
            product.updatedAt = String(Date.now());

            return await productRepository.save(product);
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async addPictureToProduct(options: {
        productID: number;
        pictureAsBase64: string;
    }): Promise<Product> {
        const productRepository = this.getProductRepository();
        let foundProduct: Product;

        try {
            foundProduct = await productRepository.findOneOrFail({
                where: {
                    id: Number(options.productID),
                },
            });
        } catch (error) {
            throw new Error("No product found");
        }

        try {
            foundProduct.picture = options.pictureAsBase64;
            await productRepository.save(foundProduct);

            return foundProduct;
        } catch (error) {
            throw new Error("Could not upload picture");
        }
    }
}
