export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    isEmailConfirmed: boolean;
    currentHashedRefreshToken: string;
}
