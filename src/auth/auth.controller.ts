import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(
            loginDto.email,
            loginDto.password,
        );

        if (!user) {
            // Обработка неправильных учетных данных
        }

        const token = await this.authService.createToken(user.email);
        return token;
    }
}
