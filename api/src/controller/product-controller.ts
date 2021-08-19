import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";

import { Product } from "../entity/product";
import { ProductService } from "../services/product-service";

export class ProductController {
    public static async getAllProducts(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const products: Product[] = await ProductService.getAllProducts();
            response.status(200).send({ products });
        } catch (error) {
            response.status(500).send({ status: "Could not load products" });
        }
    }

    public static async getActiveProducts(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const products: Product[] =
                await ProductService.getActiveProducts();
            response.status(200).send({ products });
        } catch (error) {
            response
                .status(500)
                .send({ status: "Could not load active products" });
        }
    }

    public static async createProduct(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const name = request.body.name;
        const bottleDepositInCents = request.body.bottleDepositInCents;
        const priceInCents = request.body.priceInCents;

        if (
            !name ||
            bottleDepositInCents === undefined ||
            priceInCents === undefined
        ) {
            response.status(400).send({ status: "Arguments missing" });

            return;
        }

        try {
            const createdProduct = await ProductService.createProduct(
                request.body
            );

            response.send({ status: "ok", product: createdProduct });
        } catch (error) {
            response.status(500).send({ status: error.message });
        }
    }

    public static async getProductByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const productID = request.params.productID;

        if (!productID) {
            response.status(404).send({ status: "Not found" });

            return;
        }
        let product: Product;

        try {
            product = await ProductService.getProductByID({ productID });
        } catch (error) {
            response.status(404).send({ status: "No product found" });
        }

        if (product.isDisabled) {
            const verifiedUser = request.body.verifiedUser;

            if (!verifiedUser.isAdmin) {
                response.status(404).send({ status: "No product found" });
            }
        }

        response.send({ status: "ok", product });
    }

    public static async deleteProductByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const productID = request.params.productID;

        if (!productID) {
            response.status(404).send({ status: "Not found" });

            return;
        }

        try {
            const product = await ProductService.deleteProductByID({
                productID,
            });
            response.send({ status: "ok", product });
        } catch (error) {
            response.status(404).send({ status: error.message });
        }
    }

    public static async updateProduct(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const productID = request.params.productID;

        if (productID === undefined) {
            response.status(404).send({ status: "No product found" });

            return;
        }
        try {
            const createdProduct = await ProductService.updateProductByID({
                productID: productID,
                ...request.body,
            });

            response.send({ status: "ok", product: createdProduct });
        } catch (error) {
            response.status(409).send({ status: error.message });
        }
    }

    public static async uploadProfilePicture(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<any> {
        const productID = Number(request.params.productID);
        if (productID === undefined) {
            return response
                .status(400)
                .send({ status: "userID undefined or value error" });
        }

        if (!request.files || Object.keys(request.files).length === 0) {
            return response.status(400).send("No files were uploaded.");
        }

        const image = request.files.image as UploadedFile;
        const pictureInBase64 = image.data.toString("base64");

        try {
            const updateProduct = await ProductService.addPictureToProduct({
                productID: productID,
                pictureAsBase64: pictureInBase64,
            });

            return response.send({
                status: "file uploaded",
                product: updateProduct,
            });
        } catch (error) {
            return response.status(400).send("No files were uploaded.");
        }
    }
}
