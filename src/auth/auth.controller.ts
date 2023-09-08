import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/login.dto';

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
            // Обработка неправильных учетных данных
        }
        console.log('loginDto',loginDto)
        return await this.authService.login(user.email);
    }
}
