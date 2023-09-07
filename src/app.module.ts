import { DbModule } from './db/db.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
      ConfigModule.forRoot(),
      DbModule,
      UsersModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, JwtService],
})
export class AppModule {}

