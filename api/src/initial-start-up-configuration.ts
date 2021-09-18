import { Authentication } from "./module/authentication";
import { ConstantsService } from "./services/constants-service";
import { UserService } from "./services/user-service";

export const firstStartupInit = async () => {
    try {
        await ConstantsService.createConstants({
            stornoTime: 10000,
            crateDeposit: 150
        });
    } catch (error) {
        if (error.message === "Constants already exist, try to update them instead") {
            console.log("The constants already exist. Keep going!");
        } else {
            console.log(
                "An unexpected error occured while creating the default constants."
            );
        }
    }

    try {
        const hashedPassword: string = await Authentication.hashPassword(
            "Admin"
        );
        await UserService.createNewUser({
            name: "Admin",
            password: hashedPassword,
            isAdmin: true,
            isSystemUser: false,
            isDisabled: false
        });
        console.log(
            "The default user 'Admin' was created. The password is 'Admin', please change it immediately!"
        );
    } catch (error) {
        if (
            error.name === "QueryFailedError"
            && error.message.includes("duplicate key value violates unique constraint")
        ) {
            console.log("The default user 'Admin' already exists. Keep going!");
        } else {
            console.log(
                "An unexpected error occured while creating the 'Admin' user."
            );
        }
    }

    try {
        const hashedPassword: string = await Authentication.hashPassword(
            "cantlogin"
        );
        await UserService.createNewUser({
            name: "Bank",
            password: hashedPassword,
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false
        });
        console.log("Creating some needed database entries... Success!");
    } catch (error) {
        if (
            error.name === "QueryFailedError"
            && error.message.includes("duplicate key value violates unique constraint")
        ) {
            console.log("Checking some needed database entries... Success!");
        } else {
            console.log(
                "An unexpected error occurred while creating the 'Bank' user."
            );
        }
    }

    try {
        const hashedPassword: string = await Authentication.hashPassword(
            "cantlogin"
        );
        await UserService.createNewUser({
            name: "Warehouse",
            password: hashedPassword,
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false
        });
        console.log("Creating some needed database entries... Success!");
    } catch (error) {
        if (
            error.name === "QueryFailedError"
            && error.message.includes("duplicate key value violates unique constraint")
        ) {
            console.log("Checking some needed database entries... Success!");
        } else {
            console.log(
                "An unexpected error occurred while creating a the 'Warehouse' user."
            );
        }
    }

    try {
        const hashedPassword: string = await Authentication.hashPassword(
            "cantlogin"
        );
        await UserService.createNewUser({
            name: "Cash",
            password: hashedPassword,
            isAdmin: false,
            isSystemUser: true,
            isDisabled: false
        });
        console.log("Creating some needed database entries... Success!");
    } catch (error) {
        if (
            error.name === "QueryFailedError"
            && error.message.includes("duplicate key value violates unique constraint")
        ) {
            console.log("Checking some needed database entries... Success!");
        } else {
            console.log(
                "An unexpected error occurred while creating the 'Cash' user."
            );
        }
    }
};
