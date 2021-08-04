/** Package imports */
import { Router } from "express";
import { TagController } from "../controller/tag-controller";
import { Authentication } from "../module/authentication";

/** Variables */
export const tagRouter: Router = Router({ mergeParams: true });

/** Routes */
tagRouter.get("/", TagController.getAllTags);
tagRouter.post("/", Authentication.verifyAdminAccess, TagController.createTag);
tagRouter.get("/:tagID", TagController.getTagByID);
tagRouter.delete(
    "/:tagID",
    Authentication.verifyAdminAccess,
    TagController.deleteTag
);
tagRouter.patch(
    "/:tagID",
    Authentication.verifyAdminAccess,
    TagController.updateSingleTag
);
