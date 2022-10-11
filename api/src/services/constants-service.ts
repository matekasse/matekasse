import { getRepository } from "typeorm";
import { Constants } from "../entity/constants";

enum Contants {
    stornoTime = "stornoTime",
    crateDeposit = "crateDeposit",
}

export class ConstantsService {
    private static getConstantsRepository() {
        return getRepository(Constants);
    }

    public static async getAllConstants() {
        const constantsRepository = this.getConstantsRepository();
        const constants = await constantsRepository.find();

        return constants[0];
    }

    public static async getConstantByName(options: { constantName: string }) {
        const constantsRepository = this.getConstantsRepository();
        const constants = await constantsRepository.find();
        const constant: Contants = (<any>Contants)[options.constantName];

        return constants[0][constant];
    }

    public static async createConstants(options?: {
        stornoTime?: number;
        crateDeposit?: number;
        currencySymbol?: string;
    }): Promise<Constants> {
        const constantsRepository = this.getConstantsRepository();

        const existingConstants = await constantsRepository.find();
        if (existingConstants.length > 0) {
            throw new Error(
                "Constants already exist, try to update them instead"
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
        currencySymbol?: string;
    }): Promise<Constants> {
        const constantsRepository = this.getConstantsRepository();
        let constants: Constants;
        try {
            constants = await constantsRepository.findOneOrFail({});
        } catch (error) {
            throw new Error("Error getting constants. Do they exist?");
        }

        try {
            constants.stornoTime = options.stornoTime
                ? options.stornoTime
                : constants.stornoTime;
            constants.crateDeposit = options.crateDeposit
                ? options.crateDeposit
                : constants.crateDeposit;
            constants.currencySymbol = options.currencySymbol
                ? options.currencySymbol
                : constants.currencySymbol;
            constants.updatedAt = String(Date.now());

            return await constantsRepository.save(constants);
        } catch (error) {
            throw new Error(error);
        }
    }
}
