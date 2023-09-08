import {DatabaseService} from 'src/db/db.service';
import {ConflictException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import {
  EMAIL_IS_ALREADY_IN_USE,
  RETRIEVED_SUCCESSFULLY,
  USER_REGISTERED_SUCCESSFULLY
} from "../constants/text";

@Injectable()
export class UsersService {
  TABLE_NAME = 'Users';
  constructor(private dbService: DatabaseService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  async create(createUserDto: CreateUserDto) {
    const { email, password, confirmPassword, ...userData } = createUserDto;

    const existingUser = await this.findOne(email);
    if (existingUser) {
      throw new ConflictException(EMAIL_IS_ALREADY_IN_USE);
    }

    const hashedPassword = await this.hashPassword(password);

    const userObj = {
      ...userData,
      email,
      password: hashedPassword,
    };


    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.TABLE_NAME,
      Item: userObj,
    };

    try {
      await this.dbService.connect().put(params).promise();

      return {
        message: USER_REGISTERED_SUCCESSFULLY,
        data: userObj,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAll() {
    try {
      return {
        message: RETRIEVED_SUCCESSFULLY,
        data: await this.dbService
            .connect()
            .scan({
              TableName: this.TABLE_NAME,
            })
            .promise(),
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findOne(email: string): Promise<any> {
    try {
      const result = await this.dbService
          .connect()
          .get({
            TableName: this.TABLE_NAME,
            Key: { email },
          })
          .promise();

      if (!result.Item) {
        return null;
      }

      return result.Item;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
/*
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
*/
  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
