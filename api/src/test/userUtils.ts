import { Repository, getRepository } from "typeorm";
import { User } from "../entity/user";
import { Authentication } from "../module/authentication";
export async function createTestUser() {
    const userRepository: Repository<User> = getRepository(User);
    const hashedPassword: string = await Authentication.hashPassword(
        "wowSuchPassword"
    );
    const testUser = new User();
    testUser.name = "Pferdinand";
    testUser.password = hashedPassword;
    testUser.paypalName = "something@someother.de";
    testUser.isAdmin = true;
    testUser.isSystemUser = false;
    testUser.isDisabled = false;
    testUser.createdAt = "0";
    testUser.updatedAt = "0";
    try {
        const createdUser: User = await userRepository.save(testUser);
        return createdUser;
    } catch (error) {
        console.log(error);
    }
}

export async function createNonAdminTestUser() {
    const userRepository: Repository<User> = getRepository(User);
    const hashedPassword: string = await Authentication.hashPassword(
        "wowSuchPassword"
    );
    const testUser = new User();
    testUser.name = "nonAdminUser";
    testUser.password = hashedPassword;
    testUser.paypalName = "something@someother.de";
    testUser.isAdmin = false;
    testUser.isSystemUser = false;
    testUser.isDisabled = false;
    testUser.createdAt = "0";
    testUser.updatedAt = "0";
    try {
        const createdUser: User = await userRepository.save(testUser);
        return createdUser;
    } catch (error) {
        console.log(error);
    }
}

export async function authenticateTestUser(user: User) {
    const token = await Authentication.generateToken({
        id: user.id,
        name: user.name,
    });
    return token;
}

export async function authenticateNonAdminTestUser(user: User) {
    const token = await Authentication.generateToken({
        id: user.id,
        name: user.name,
    });
    return token;
}
