import { getRepository } from "typeorm";

import { Tag } from "../entity/tag";

export class TagService {
    private static getTagRepository() {
        return getRepository(Tag);
    }

    public static async getAllTags() {
        const tagRepository = this.getTagRepository();
        return await tagRepository.find();
    }

    public static async createNewTag(options: { name: string }): Promise<Tag> {
        const tagRepository = this.getTagRepository();
        const tag = new Tag(options);
        return await tagRepository.save(tag);
    }

    public static async upsertTag(options: { name: string }) {
        const tagRepository = this.getTagRepository();
        let foundTag = await tagRepository.findOne(options);

        try {
            if (!foundTag) {
                return await this.createNewTag(options);
            }
        } catch (error) {
            throw new Error("Tag could not be created.");
        }

        return foundTag;
    }

    public static async getTagByID(options: { tagID: string }): Promise<Tag> {
        const tagRepository = this.getTagRepository();
        try {
            return await tagRepository.findOneOrFail(options.tagID);
        } catch (error) {
            throw new Error();
        }
    }

    public static async deleteTag(options: { tagID: string }): Promise<Tag> {
        const tagRepository = this.getTagRepository();
        try {
            const tag: Tag = await tagRepository.findOneOrFail(options.tagID);

            return await tagRepository.remove(tag);
        } catch (error) {
            throw new Error("Tag could not be deleted.");
        }
    }

    public static async updateSingleTag(options: {
        tagID: string;
        name: string;
    }): Promise<Tag> {
        const tagRepository = this.getTagRepository();
        try {
            const tag: Tag = await tagRepository.findOneOrFail(options.tagID);
            tag.name = options.name;
            tag.updatedAt = String(Date.now());

            // Fetch products as save will fail if this is a dangling promise.
            // Eager loading is not possible as tag is in product already eager.
            await tag.products;

            return await tagRepository.save(tag);
        } catch (error) {
            throw new Error(error);
        }
    }
}
