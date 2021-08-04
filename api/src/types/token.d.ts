import { JWTToken } from "./../module/authentication";
declare global {
    namespace Express {
        interface Request {
            token: JWTToken;
        }
    }
}
