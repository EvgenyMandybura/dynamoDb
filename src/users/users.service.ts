import {DatabaseService} from 'src/db/db.service';
import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import * as AWS from 'aws-sdk';
import {v4 as uuid} from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  TABLE_NAME = 'Users';

  constructor(private dbService: DatabaseService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  async create(createUserDto: CreateUserDto){
    console.log('Creating user with data:', createUserDto);
    const userObj = {
      id: uuid(),
      ...createUserDto,
    };

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.TABLE_NAME,
      Item: userObj,
    };

    try {
      await this.dbService.connect().put(params).promise();

      return {
        message: 'User registered successfully!',
        data: userObj.email
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

  async findOne(email: string): Promise<any> {
    try {
      const result = await this.dbService
          .connect()
          .get({
            TableName: this.TABLE_NAME,
            Key: { email },
          })
          .promise();

      // Если пользователь не найден, вернуть null
      if (!result.Item) {
        return null;
      }

      // Иначе, вернуть данные пользователя
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
