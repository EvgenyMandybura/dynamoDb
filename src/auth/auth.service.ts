import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        console.log('email',email)
        const user = await this.usersService.findOne(email);
        console.log('user',user)
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        console.log('user1',user)
        const payload = { email: user.email, sub: user.userId };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
