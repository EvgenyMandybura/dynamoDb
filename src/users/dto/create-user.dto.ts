import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import {MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH} from "../../constants/data";
import {passwordRegex} from "../../constants/matches";
import {PASSWORD_INCORRECT} from "../../constants/text";

export class CreateUserDto {
    @IsString()
    @MinLength(MIN_NAME_LENGTH)
    @MaxLength(MAX_NAME_LENGTH)
    firstName: string;

    @IsString()
    @MinLength(MIN_NAME_LENGTH)
    @MaxLength(MAX_NAME_LENGTH)
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(MIN_PASSWORD_LENGTH)
    @MaxLength(MAX_PASSWORD_LENGTH)
    @Matches(passwordRegex, { message: PASSWORD_INCORRECT })
    password: string;

    confirmPassword: string;
}
