import { Request, Response, NextFunction } from "express";

import { User } from "../entity/user";
import { UserService } from "../services/user-service";
import { Authentication } from "../module/authentication";

export class UserController {
    public static async getRealUsers(
        request: Request,
        response: Response
    ): Promise<Response> {
        try {
            const users: User[] = await UserService.getRealUsers();

            return response.status(200).send({ users });
        } catch (error) {
            return response.status(404).send({ status: "not found" });
        }
    }

    public static async getSystemUsers(
        request: Request,
        response: Response
    ): Promise<Response> {
        try {
            const users: User[] = await UserService.getSystemUsers();

            return response.status(200).send({ users });
        } catch (error) {
            return response.status(404).send({ status: "not found" });
        }
    }

    public static async getAdminUsers(
        request: Request,
        response: Response
    ): Promise<Response> {
        try {
            const users: User[] = await UserService.getAdminUsers();

            return response.status(200).send({ users });
        } catch (error) {
            return response.status(404).send({ status: "not found" });
        }
    }

    public static async createUser(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response> {
        const name = request.body.name;
        const password = request.body.password;
        let isAdmin = request.body.isAdmin;
        let isSystemUser = request.body.isSystemUser;
        let isDisabled = request.body.isDisabled;
        let verifiedUser = request.body.verifiedUser;

        if (!name || password === undefined) {
            return response.status(404).send({ status: "Arguments missing" });
        }

        if (verifiedUser !== null && verifiedUser !== undefined) {
            if (verifiedUser.isAdmin !== true) {
                isAdmin = false;
                isSystemUser = false;
                isDisabled = false;
            }
        } else {
            isAdmin = false;
            isSystemUser = false;
            isDisabled = false;
        }

        try {
            const hashedPassword: string = await Authentication.hashPassword(
                password
            );
            const createdUser = await UserService.createNewUser({
                name,
                isAdmin,
                isSystemUser,
                isDisabled,
                password: hashedPassword,
            });

            // Remove password from user to be able to return it to the caller.
            delete createdUser.password;

            return response.send({ status: "ok", user: createdUser });
        } catch (error) {
            return response.status(409).send({ status: "User not created" });
        }
    }

    public static async loginUser(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response> {
        const name = request.body.name;
        const password = request.body.password;

        if (!name || !password) {
            return response.status(404).send({ status: "Arguments missing" });
        }

        try {
            const token = await UserService.login(request.body);

            return response.send({ status: "ok", data: token });
        } catch (error) {
            return response.status(401).send({ status: error.message });
        }
    }

    public static async getUserByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response> {
        const userID = request.params.userID;

        if (userID === undefined) {
            return response.status(404).send({ status: "not found" });
        }

        try {
            const user = await UserService.getUserByID({ userID });

            return response.send({ status: "ok", user });
        } catch (error) {
            return response.status(409).send({ status: "No user found" });
        }
    }

    public static async deleteUserById(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response> {
        const userID = request.params.userID;

        if (userID === undefined) {
            return response.status(404).send({ status: "not found" });
        }

        try {
            await UserService.deleteUserByID({ userID });

            return response.send({ status: "ok" });
        } catch (error) {
            return response.status(409).send({ status: "No user found" });
        }
    }

    public static async patchUserByID(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response> {
        try {
            let options = request.body;
            options.userID = request.params.userID;
            if (options.userID === undefined || options.balanced) {
                return response
                    .status(400)
                    .send({ status: "userID undefined or value error" });
            }

            const patchedUser = await UserService.patchUserByID(options);

            return response.send({ status: "ok", user: patchedUser });
        } catch (error) {
            return response
                .status(500)
                .send({ status: "Internal server error" });
        }
    }

    public static async changePassword(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response> {
        const userID: string = request.params.userID;
        const userIDasNumber = Number(userID);
        const verifiedUser = request.body.verifiedUser;
        const newPassword: string = request.body.newPassword;
        const oldPassword: string = request.body.oldPassword;

        if (newPassword === undefined) {
            return response.status(404).send({ status: "Arguments missing" });
        }

        // If requesting user is not an admin, the user must provide the old password
        if (!verifiedUser.isAdmin) {
            let userPasswordHash: string;
            try {
                userPasswordHash =
                    await UserService.getUserPasswordHashByUserID({
                        userID,
                    });
            } catch (error) {
                return response.status(404).send({ status: "User not found" });
            }

            if (
                !(await Authentication.comparePasswordWithHash(
                    oldPassword,
                    userPasswordHash
                ))
            ) {
                return response
                    .status(403)
                    .send({ status: "Old password not correct" });
            }
        }

        try {
            const hashedPassword: string = await Authentication.hashPassword(
                newPassword
            );
            const updatedUser = await UserService.patchUserByID({
                userID: userIDasNumber,
                password: hashedPassword,
            });

            // Remove password from user to be able to return it to the caller.
            delete updatedUser.password;

            return response.send({ status: "ok", user: updatedUser });
        } catch (error) {
            return response
                .status(409)
                .send({ status: "Could not update password" });
        }
    }
}
