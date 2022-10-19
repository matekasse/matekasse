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
        let constants: Constants[];
        try {
            constants = await constantsRepository.find({ take: 1 });
        } catch (error) {
            throw new Error("Error getting constants. Do they exist?");
        }

        if (constants.length != 1) {
            throw new Error("Error getting constants. Do they exist?");
        }

        try {
            constants[0].stornoTime = options.stornoTime
                ? options.stornoTime
                : constants[0].stornoTime;
            constants[0].crateDeposit = options.crateDeposit
                ? options.crateDeposit
                : constants[0].crateDeposit;
            constants[0].currencySymbol = options.currencySymbol
                ? options.currencySymbol
                : constants[0].currencySymbol;
            constants[0].updatedAt = String(Date.now());

            return await constantsRepository.save(constants[0]);
        } catch (error) {
            throw new Error(error);
        }
    }
}
