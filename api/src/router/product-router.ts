import { Router } from "express";
import { ProductController } from "../controller/product-controller";
import { Authentication } from "../module/authentication";

export const productRouter: Router = Router({ mergeParams: true });

productRouter.get(
    "/",
    Authentication.verifyAdminAccess,
    ProductController.getAllProducts
);
productRouter.get("/active", ProductController.getActiveProducts);
productRouter.post(
    "/",
    Authentication.verifyAdminAccess,
    ProductController.createProduct
);
productRouter.get("/:productID", ProductController.getProductByID);
productRouter.delete(
    "/:productID",
    Authentication.verifyAdminAccess,
    ProductController.deleteProductByID
);
productRouter.patch(
    "/:productID",
    Authentication.verifyAdminAccess,
    ProductController.updateProduct
);
productRouter.post(
    "/:productID/picture",
    Authentication.verifyAdminAccess,
    ProductController.uploadProfilePicture
);
