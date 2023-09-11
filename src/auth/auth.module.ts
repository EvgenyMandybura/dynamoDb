import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from "./auth.controller";
import {EmailService} from "../email-service/email.service";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'your_secret_key',
            signOptions: { expiresIn: '24h' },
        }),
        UsersModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, EmailService],
    exports: [AuthService],
})
export class AuthModule {}
