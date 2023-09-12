import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from "./auth.controller";
import { EmailService } from "../email-service/email.service";
import { UsersService } from "../users/users.service";
import { Repository } from "typeorm";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'secret_key',
            signOptions: { expiresIn: '24h' },
        }),
        UsersModule
    ],
    controllers: [AuthController],
    providers: [AuthService, Repository, JwtStrategy, EmailService, UsersService],
    exports: [AuthService],
})
export class AuthModule {}
