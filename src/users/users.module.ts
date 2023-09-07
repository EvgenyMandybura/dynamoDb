import { DatabaseService } from 'src/db/db.service';
import { DbModule } from './../db/db.module';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [DbModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService],
  exports: [UsersService]
})
export class UsersModule {}

