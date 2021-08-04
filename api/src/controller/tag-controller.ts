import { Request, Response, NextFunction } from "express";

import { Tag } from "../entity/tag";
import { TagService } from "../services/tag-service";

export class TagController {
    public static async getAllTags(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const tags: Tag[] = await TagService.getAllTags();
            response.status(200).send({ tags });
        } catch (error) {
            response.status(404).send({ status: "No Tags found" });
        }
    }

    public static async createTag(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const name = request.body.name;

        if (!name) {
            response.status(404).send({ status: "Arguments missing" });

            return;
        }

        try {
            const createdTag = await TagService.createNewTag(request.body);
            response.send({ status: "ok", tag: createdTag });
        } catch (error) {
            response.status(409).send({ status: "Could not create new tag" });
        }
    }

    public static async getTagByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const tagID = request.params.tagID;

        if (tagID === undefined) {
            response.status(404).send({ status: "Provide a tag id" });
        }

        try {
            const tag = await TagService.getTagByID({ tagID: tagID });
            response.send({ status: "ok", tag });
        } catch (error) {
            response.status(409).send({ status: "No tag found" });
        }
    }

    public static async deleteTag(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const tagID = request.params.tagID;

        if (tagID === undefined) {
            response.status(404).send({ status: "Provide a tag id" });
        }

        try {
            await TagService.deleteTag({ tagID: tagID });
            response.send({ status: "ok" });
        } catch (error) {
            response.status(409).send({ status: "No tag found" });
        }
    }

    public static async updateSingleTag(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        const tagID = request.params.tagID;

        if (tagID === undefined) {
            response.status(404).send({ status: "Provide a tag id" });
        }

        try {
            const tag = await TagService.updateSingleTag({
                tagID: tagID,
                ...request.body
            });

            response.send({ status: "ok", tag });
        } catch (error) {
            response.status(409).send({ status: "No tag found" });
        }
    }
}
