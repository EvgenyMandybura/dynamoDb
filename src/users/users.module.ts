import { DatabaseService } from 'src/db/db.service';
import { DbModule } from '../db/db.module';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {AuthService} from "../auth/auth.service";
import {JwtService} from "@nestjs/jwt";
import {EmailService} from "../email-service/email.service";

@Module({
  imports: [DbModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService, EmailService, JwtService, AuthService],
  exports: [UsersService]
})
export class UsersModule {}

