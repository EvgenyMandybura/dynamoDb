import {BadRequestException, Body, Controller, Post, Req} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/login.dto';
import {INCORRECT_CREDENTIALS} from "../constants/text";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
        await this.authService.resendConfirmationLink(request.user.email);
    }
}
