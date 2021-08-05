import { getRepository, getConnection } from "typeorm";
import { Constants } from "../entity/constants";

export class ConstantsService {
    private static getConstantsRepository() {
        return getRepository(Constants);
    }

    public static async getAllConstants() {
        return await getConnection().getRepository(Constants).find();
    }

    public static async getConstantByName(options: { constantName: string }) {
        const constantsRepository = this.getConstantsRepository();
        const constants = await constantsRepository.find();

        return constants[0][options.constantName];
    }

    public static async createConstants(options?: {
        stornoTime?: number;
        crateDeposit?: number;
    }): Promise<Constants> {
        const constantsRepository = this.getConstantsRepository();

        const existingConstants = await constantsRepository.find();
        if (existingConstants.length > 0) {
            throw new Error(
                "Constants already exist, try to change them instead"
            );
        }

        try {
            const newConstants = new Constants(options);

            return await constantsRepository.save(newConstants);
        } catch (error) {
            throw new Error("Error creating constants");
        }
    }

    public static async updateConstants(options: {
        stornoTime?: number;
        crateDeposit?: number;
    }): Promise<Constants> {
        const constantsRepository = this.getConstantsRepository();
        let constants: Constants;
        try {
            constants = await constantsRepository.findOneOrFail(1);
        } catch (error) {
            throw new Error("Error updating constants");
        }

        try {
            constants.stornoTime = options.stornoTime
                ? options.stornoTime
                : constants.stornoTime;
            constants.crateDeposit = options.crateDeposit
                ? options.crateDeposit
                : constants.crateDeposit;
            constants.updatedAt = String(Date.now());

            return await constantsRepository.save(constants);
        } catch (error) {
            throw new Error(error);
        }
    }
}
