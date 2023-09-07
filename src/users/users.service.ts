import { DatabaseService } from 'src/db/db.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
  TABLE_NAME = 'Users';

  constructor(private dbService: DatabaseService) {}
  async create(createUserDto: CreateUserDto){
    console.log('Creating user with data:', createUserDto);
    const userObj = {
      id: uuid(),
      ...createUserDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.TABLE_NAME,
      Item: userObj,
    };

    try {
      await this.dbService.connect().put(params).promise();

      return {
        message: 'User registered successfully!',
        data: userObj,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAll() {
    try {
      return {
        message: 'Retrieved successfully!',
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

  async findOne(id: string) {
    try {
      return {
        message: 'Retrieved successfully!',
        data: await this.dbService
            .connect()
            .get({
              TableName: this.TABLE_NAME,
              Key: { id },
            })
            .promise(),
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
