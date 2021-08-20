import { getRepository } from "typeorm";
import { Constant, ConstantType } from "../entity/constant";

export class ConstantService {
    private static getConstantRepository() {
        return getRepository(Constant);
    }

    public static async getAllConstants() {
        const constantRepository = this.getConstantRepository();

        return await constantRepository.find();
    }

    private static async getConstantByName(options: {
        key: string;
    }): Promise<string> {
        const constantRepository = this.getConstantRepository();
        try {
            const constant = await constantRepository.findOneOrFail({
                where: { name: options.key },
            });

            return constant.value;
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async getCrateDeposit(): Promise<number> {
        try {
            const returnValue = await this.getConstantByName({
                key: ConstantType.crateDeposit,
            });
            return Number(returnValue);
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async getStornoTime(): Promise<number> {
        try {
            const returnValue = await this.getConstantByName({
                key: ConstantType.stornoTime,
            });
            return Number(returnValue);
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async createConstant(options?: {
        key: string;
        value: string;
    }): Promise<Constant> {
        const constantsRepository = this.getConstantRepository();

        try {
            const newConstants = new Constant(options);

            return await constantsRepository.save(newConstants);
        } catch (error) {
            throw new Error("Error creating constants");
        }
    }

    public static async updateConstant(options: {
        key: string;
        value: string;
    }): Promise<Constant> {
        const constantRepository = this.getConstantRepository();
        let constant: Constant;
        try {
            constant = await constantRepository.findOneOrFail(options.key);
        } catch (error) {
            throw new Error("Error updating constants");
        }

        try {
            constant.value = options.value ? options.value : constant.value;
            constant.updatedAt = String(Date.now());

            return await constantRepository.save(constant);
        } catch (error) {
            throw new Error(error);
        }
    }
}
