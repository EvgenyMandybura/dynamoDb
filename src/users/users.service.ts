import {DatabaseService} from 'src/db/db.service';
import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import {
  EMAIL_IS_ALREADY_IN_USE,
  RETRIEVED_SUCCESSFULLY,
  USER_REGISTERED_SUCCESSFULLY
} from "../constants/text";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";


@Injectable()
export class UsersService {
  TABLE_NAME = 'Users';
  constructor(
      private usersRepository: Repository<User>,
      private dbService: DatabaseService
      ) {}

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
        data: {
          email,
          ...userData
        },
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

  remove(email: string) {
    return `This action removes user`;
  }

  async update(email: string, field: string, value: any ) {
    const user = await this.findOne( email );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.TABLE_NAME,
      Key: { email: email },
      UpdateExpression: `SET ${field} = :value`,
      ExpressionAttributeValues: {
        ':value': value,
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const updatedData = await this.dbService.connect().update(params).promise();

      return {
        message: 'Successfully updated',
        data: updatedData.Attributes,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async markEmailAsConfirmed(email: string){
    const user = await this.findOne( email );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.TABLE_NAME,
      Key: { email: email },
      UpdateExpression: 'SET isEmailConfirmed = :confirmed',
      ExpressionAttributeValues: {
        ':confirmed': true,
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const updatedData = await this.dbService.connect().update(params).promise();

      return {
        message: 'Email confirmation status updated successfully!',
        data: updatedData.Attributes,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async setCurrentRefreshToken(refreshToken: any, email: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.update(email, "currentHashedRefreshToken", currentHashedRefreshToken);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, email: string) {
    const user = await this.findOne(email);

    const isRefreshTokenMatching = await bcrypt.compare(
        refreshToken,
        user.currentHashedRefreshToken
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(email: string) {
    return this.update(email,'currentHashedRefreshToken', null);
  }
}
