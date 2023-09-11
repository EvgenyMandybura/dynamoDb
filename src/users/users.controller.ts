import {Controller, Get, Post, Body, Param, Delete, Headers, BadRequestException} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PASSWORDS_DO_NOT_MATCH } from "../constants/text";
import { createUserSchema } from "./validations/user-validation";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("register")
  async create(@Body() createUserDto: CreateUserDto, @Headers('content-type') contentType: string) {
    if (contentType !== 'application/json') {
      return 'Incorrect Content-Type';
    }

    const { error, value } = createUserSchema.validate(createUserDto);

    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException(PASSWORDS_DO_NOT_MATCH);
    }

    return this.usersService.create(value);
  }


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
/*
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
*/
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
