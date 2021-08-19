import { Authentication } from "./module/authentication";
import { ConstantService } from "./services/constant-service";
import { UserService } from "./services/user-service";

export const firstStartupInit = async () => {
    try {
        await ConstantService.createConstant({
            key: "stornoTime",
            value: "10000",
        });
        await ConstantService.createConstant({
            key: "crateDeposit",
            value: "150",
        });
    } catch (error) {
        if (error.name === "QueryFailedError") {
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
        if (error.name === "QueryFailedError") {
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
        if (error.name === "QueryFailedError") {
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
        if (error.name === "QueryFailedError") {
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
        if (error.name === "QueryFailedError") {
            console.log("Checking some needed database entries... Success!");
        } else {
            console.log(
                "An unexpected error occurred while creating the 'Cash' user."
            );
        }
    }
};
