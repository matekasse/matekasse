import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user-service";
import { User } from "../entity/user";

export interface JWTUserData {
    name: string;
    id: number;
}

export interface JWTToken extends JWTUserData {
    iat: number;
    exp: number;
}

export class Authentication {
    private static JWT_OPTIONS: jwt.SignOptions = {
        expiresIn: 86400
    };

    private static SALT_ROUNDS: number = 10;

    public static async generateToken(userdata: JWTUserData): Promise<string> {
        return jwt.sign(userdata, process.env.SECRET, this.JWT_OPTIONS);
    }

    public static async verifyToken(token: string): Promise<string | object> {
        try {
            return jwt.verify(token, process.env.SECRET);
        } catch (e) {
            return null;
        }
    }

    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    public static async comparePasswordWithHash(
        password: string,
        hash: string
    ): Promise<boolean> {
        try {
            const match: boolean = await bcrypt.compare(password, hash);
            if (match) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    public static async verifyAccess(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const jwtToken: string = req.get("Authorization");

        if (!jwtToken) {
            return res.status(401).send({ status: "unauthorized" });
        }

        const validToken = await Authentication.verifyToken(jwtToken);
        if (!validToken) {
            return res.status(401).send({ status: "unauthorized" });
        }

        const decodedToken = await jwt.decode(jwtToken, { complete: true });

        let verifiedUser: User;
        try {
            verifiedUser = await UserService.getUserByID({
                userID: decodedToken.payload.id
            });
        } catch (error) {
            return res.status(401).send({ status: "unauthorized" });
        }

        req.body.verifiedUserID = verifiedUser.id;
        req.body.verifiedUser = verifiedUser;

        next();
    }

    // This method is only for the create user endpoint.
    // If you have a token, you will get authenticated and the user will be added to the request.
    public static async verifyCreateUserAccess(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const jwtToken: string = req.get("Authorization");

        if (!jwtToken) {
            req.body.verifiedUser = undefined;
            req.body.verifiedUserID = undefined;
            next();
        } else {
            Authentication.verifyAccess(req, res, next);
        }
    }

    public static async verifyAdminAccess(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const verifiedUserID = req.body.verifiedUserID;

        try {
            const isAdmin = await UserService.isAdmin(verifiedUserID);

            if (isAdmin === false) {
                return res
                    .status(403)
                    .send({ status: "Not allowed to access" });
            }

            next();
        } catch (error) {
            return res.status(403).send({ status: "Not allowed to access" });
        }
    }

    public static async verifyUserToAccessOwnEndpoint(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const verifiedUserID = req.body.verifiedUserID;
        const userIDtoEdit = req.params.userID;

        if (!userIDtoEdit) {
            return res.status(403).send({ status: "Not allowed to access" });
        }

        try {
            const isAdmin = await UserService.isAdmin(verifiedUserID);

            if (isAdmin === true) {
                next();

                return;
            }
        } catch (error) {
            return res.status(403).send({ status: "Not allowed to access" });
        }

        if (verifiedUserID != userIDtoEdit) {
            return res.status(403).send({ status: "Not allowed to access" });
        }

        try {
            const foundUser = await UserService.getUserByID(verifiedUserID);

            if (!foundUser) {
                return res
                    .status(403)
                    .send({ status: "Not allowed to access" });
            }

            next();
        } catch (error) {
            return res
                .status(403)
                .send({ status: "unautNot allowed to accesshorized" });
        }
    }
}
