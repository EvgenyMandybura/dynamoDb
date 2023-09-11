import {MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH} from "../../constants/data";
import {passwordRegex} from "../../constants/matches";
import {PASSWORD_INCORRECT} from "../../constants/text";

export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    isEmailConfirmed: boolean;
}
