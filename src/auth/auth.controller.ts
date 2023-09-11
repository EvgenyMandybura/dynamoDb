import {BadRequestException, Body, Controller, Headers, Post, Req} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/login.dto';
import {INCORRECT_CREDENTIALS, PASSWORDS_DO_NOT_MATCH} from "../constants/text";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {createUserSchema} from "../users/validations/user-validation";
import {UsersService} from "../users/users.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Post("register")
    async create(@Body() createUserDto: CreateUserDto, @Headers('content-type') contentType: string) {
        if (contentType !== 'application/json') {
            return 'Incorrect Content-Type';
        }

        const { error, value } = createUserSchema.validate(createUserDto);

        if (error) {
            throw new BadRequestException(error.details[0].message);
        }

        if (createUserDto.password !== createUserDto.confirmPassword) {
            throw new BadRequestException(PASSWORDS_DO_NOT_MATCH);
        }

        const user = await this.usersService.create(value);

        await this.authService.sendVerificationLink(createUserDto.email);
        return user;
    }
    @Post('login')
    async login(@Body() loginDto: LoginDto) {

        const user = await this.authService.validateUser(
            loginDto.email,
            loginDto.password,
        );

        if (!user) {
            throw new BadRequestException(INCORRECT_CREDENTIALS);
        }

        return await this.authService.login(user.email);
    }

    @Post('confirm')
    async confirm(@Body() confirmationData: any) {
        const email = await this.authService.decodeConfirmationToken(confirmationData.token);
        await this.authService.confirmEmail(email);
    }

    @Post('resend-confirmation-link')
    async resendConfirmationLink(@Req() request: any) {
        await this.authService.resendConfirmationLink(request.email);
    }
}
