import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuardMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const decoded = this.jwtService.verify(token.replace('Bearer ', ''));
            req['user'] = decoded; // Сохраняем данные пользователя в запросе

            next(); // Продолжаем выполнение следующих middleware
        } catch (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }
}
