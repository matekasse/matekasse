import { getRepository, getConnection } from "typeorm";
import { Manufacturer } from "../entity/manufacturer";

export class ManufacturerService {
    private static getManufacturerRepository() {
        return getRepository(Manufacturer);
    }

    public static async getAllManufacturers() {
        return await getConnection()
            .getRepository(Manufacturer)
            .createQueryBuilder("manufacturer")
            .leftJoinAndSelect("manufacturer.products", "products")
            .getMany();
    }

    public static async createManufacturer(options: {
        name: string;
    }): Promise<Manufacturer> {
        const manufacturerRepository = this.getManufacturerRepository();
        const manufacturer = new Manufacturer(options);

        return await manufacturerRepository.save(manufacturer);
    }

    public static async getManufacturerByID(options: {
        manufacturerID: string;
    }): Promise<Manufacturer> {
        try {
            return await getConnection()
                .getRepository(Manufacturer)
                .createQueryBuilder("manufacturer")
                .leftJoinAndSelect("manufacturer.products", "products")
                .where("manufacturer.id = :id", { id: options.manufacturerID })
                .getOne();
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async deleteManufacturerByID(options: {
        manufacturerID: string;
    }) {
        const manufacturerRepository = this.getManufacturerRepository();

        try {
            await manufacturerRepository.delete(options.manufacturerID);
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async updateManufacturerByID(options: {
        manufacturerID?: string;
        name?: string;
    }): Promise<Manufacturer> {
        const manufacturerRepository = this.getManufacturerRepository();
        let manufacturer: Manufacturer;
        try {
            manufacturer = await manufacturerRepository.findOneOrFail(
                options.manufacturerID
            );
        } catch (error) {
            throw new Error(error);
        }

        try {
            manufacturer.name = options.name ? options.name : manufacturer.name;
            manufacturer.updatedAt = String(Date.now());
            return await manufacturerRepository.save(manufacturer);
        } catch (error) {
            throw new Error(error);
        }
    }
}
