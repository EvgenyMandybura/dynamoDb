import {BadRequestException, Injectable} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from "../email-service/email.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {

        const user = await this.usersService.findOne(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async sendVerificationLink(email: string) {
        // process.env.DYNAMODB_ENDPOINT
        const payload = { email };
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            expiresIn: process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME
        });
console.log("process",process.env)
        const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

        const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

        return this.emailService.sendEmail({
            to: email,
            subject: 'Email confirmation',
            text,
        })
    }

    async confirmEmail(email: string) {
        await this.usersService.markEmailAsConfirmed(email);
    }

    async decodeConfirmationToken(token: string) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            });

            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException('Email confirmation token expired');
            }
            throw new BadRequestException('Bad confirmation token');
        }
    }
}
