import { getRepository } from "typeorm";

import { User } from "../entity/user";
import { Authentication } from "../module/authentication";

export class UserService {
    private static getUserRepository() {
        return getRepository(User);
    }

    public static async getRealUsers() {
        const userRepository = this.getUserRepository();

        return await userRepository.find({ where: { isSystemUser: false } });
    }
    public static async getSystemUsers() {
        const userRepository = this.getUserRepository();

        return await userRepository.find({ where: { isSystemUser: true } });
    }
    public static async getAdminUsers() {
        const userRepository = this.getUserRepository();

        return await userRepository.find({ where: { isAdmin: true } });
    }

    public static async createNewUser(options: {
        name: string;
        isAdmin?: boolean;
        isSystemUser?: boolean;
        isDisabled?: boolean;
        password: string;
    }): Promise<User> {
        const userRepository = this.getUserRepository();

        const user = new User(options);

        return await userRepository.save(user);
    }

    public static async login(options: { name: string; password: string }) {
        const userRepository = this.getUserRepository();

        let user: User;
        try {
            user = await userRepository
                .createQueryBuilder("user")
                .where("user.name = :name", { name: options.name })
                .addSelect("user.password")
                .getOne();
        } catch (error) {
            throw new Error(error);
        }

        if (!user) {
            throw new Error("wrong username or password");
        }

        if (user.isDisabled) {
            throw new Error("Cannot log in to a disabled account");
        }

        if (user.isSystemUser) {
            throw new Error("Cannot log in to a systemUser account");
        }

        const matchingPasswords: boolean =
            await Authentication.comparePasswordWithHash(
                options.password,
                user.password
            );
        if (!matchingPasswords) {
            throw new Error("wrong username or password");
        }

        const token = await Authentication.generateToken({
            id: user.id,
            name: user.name,
        });

        return token;
    }

    public static async getUserByID(options: {
        userID: string;
    }): Promise<User> {
        const userRepository = this.getUserRepository();
        try {
            let user = await userRepository.findOneOrFail({
                where: { id: Number(options.userID) },
            });

            return user;
        } catch (error) {
            throw new Error("User user not found");
        }
    }

    public static async getUserPasswordHashByUserID(options: {
        userID: string;
    }): Promise<string> {
        const userRepository = this.getUserRepository();
        try {
            let user = await userRepository.findOneOrFail({
                where: { id: Number(options.userID) },
                select: { password: true },
            });
            return user.password;
        } catch (error) {
            throw new Error("User user not found");
        }
    }

    public static async deleteUserByID(options: {
        userID: string;
    }): Promise<void> {
        const userRepository = this.getUserRepository();
        try {
            userRepository.delete(options.userID);
        } catch (error) {
            throw new Error();
        }
    }

    public static async patchUserByID(options: {
        userID: number;
        name?: string;
        isAdmin?: boolean;
        isSystemUser?: boolean;
        isDisabled?: boolean;
        balance?: number;
        password?: string;
    }): Promise<User> {
        const userRepository = this.getUserRepository();
        let user: User;

        try {
            user = await userRepository.findOneOrFail({
                where: { id: Number(options.userID) },
            });
        } catch (error) {
            throw new Error("User user not found");
        }

        user.name = options.name ? options.name : user.name;
        user.isAdmin =
            options.isAdmin !== undefined ? options.isAdmin : user.isAdmin;
        user.isSystemUser =
            options.isSystemUser !== undefined
                ? options.isSystemUser
                : user.isSystemUser;
        user.isDisabled =
            options.isDisabled !== undefined
                ? options.isDisabled
                : user.isDisabled;
        user.password = options.password ? options.password : user.password;
        user.updatedAt = String(Date.now());

        return await userRepository.save(user);
    }

    public static async getBankUser(): Promise<User> {
        const userRepository = this.getUserRepository();
        try {
            return await userRepository.findOneOrFail({
                where: { name: "Bank" },
            });
        } catch (error) {
            throw new Error("Bank user not found");
        }
    }

    public static async getWarehouseUser(): Promise<User> {
        const userRepository = this.getUserRepository();
        try {
            return await userRepository.findOneOrFail({
                where: { name: "Warehouse" },
            });
        } catch (error) {
            throw new Error("Warehouse user not found");
        }
    }

    public static async getCashUser(): Promise<User> {
        const userRepository = this.getUserRepository();
        try {
            return await userRepository.findOneOrFail({
                where: { name: "Cash" },
            });
        } catch (error) {
            throw new Error("Cash user not found");
        }
    }

    public static async isAdmin(userID: string): Promise<boolean> {
        const userRepository = this.getUserRepository();
        try {
            const foundUser = await userRepository.findOneOrFail({
                where: { id: Number(userID) },
            });
            if (foundUser.isAdmin === false) {
                return false;
            }

            return true;
        } catch (error) {
            throw new Error("No User found");
        }
    }
}
