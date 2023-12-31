import {Module, NestModule, MiddlewareConsumer, ValidationPipe, RequestMethod} from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from './db/db.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import {JwtAuthGuardMiddleware} from "./auth/jwt-auth-guard.middleware";
import { EmailService } from './email-service/email.service';

@Module({
  imports: [
      ConfigModule.forRoot(),
      DbModule,
      AuthModule,
      UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, JwtService, EmailService],
})

export class AppModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {

        consumer.apply(JwtAuthGuardMiddleware).forRoutes(
            // Здесь маршруты, которые нужно защитить с помощью JWT-токена
        );
    }
}

