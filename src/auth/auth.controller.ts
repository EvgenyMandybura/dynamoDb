import {BadRequestException, Body, Controller, Get, Headers, HttpCode, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {INCORRECT_CREDENTIALS, PASSWORDS_DO_NOT_MATCH} from "../constants/text";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {confirmPasswordSchema, createUserSchema} from "../users/validations/user-validation";
import {UsersService} from "../users/users.service";
import JwtRefreshGuard from "./jwt-refresh-guard";
import {AuthGuard} from "./auth.guard";

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
    /*
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
    */
    @Post('login')
    async login(@Req() request: any) {
        const { body } = request;
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );
        if (!user) {
            throw new BadRequestException(INCORRECT_CREDENTIALS);
        }
        const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(body.email);
        const refreshTokenCookie = await this.authService.getCookieWithJwtRefreshToken(body.email);
        const { token } = refreshTokenCookie;
        await this.usersService.setCurrentRefreshToken(token, body.email);
        request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie.cookie]);
        return await this.authService.login(body.email);
    }

    @Post('confirm')
    async confirm(@Body() confirmationData: any) {
        const email = await this.authService.decodeConfirmationToken(confirmationData.token);
        await this.authService.confirmEmail(email);
    }

    @Post('resend-confirmation-link')
    async resendConfirmationLink(@Body() request: any) {
        await this.authService.resendConfirmationLink(request.email);
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    @HttpCode(200)
    async logOut(@Req() request: any) {
        await this.usersService.removeRefreshToken(request.body.email);
        request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@Req() request: any) {
        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(request.user.id);
        request.res.setHeader('Set-Cookie', accessTokenCookie);
        return request.user;
    }

    @Post("restore-password")
    async sendPasswordRecoveryLink(@Body() request: any) {
        await this.authService.sendPasswordRecoveryLink(request.email);
    }

    @Post('create-new-password')
    async createNewPassword(@Body() request: any) {
        const email = await this.authService.decodeConfirmationToken(request.token);

        const { error, value } = confirmPasswordSchema.validate(request);
        if (error) {
            throw new BadRequestException(error.details[0].message);
        }

        if (request.password !== request.confirmPassword) {
            throw new BadRequestException(PASSWORDS_DO_NOT_MATCH);
        }

        const hashedPassword = await this.usersService.hashPassword(request.password);

        await this.usersService.update(email, 'password', hashedPassword);
    }

    @Post('resend-password-recovery-link')
    async resendPasswordRecoveryLink(@Body() request: any) {
        await this.authService.resendPasswordRecoveryLink(request.email);
    }
}
