import { User } from '@app/shared';
import { RegisterDto } from '@app/shared/dtos/register.dto';
import { GetUsersQueryDto } from '@app/shared/dtos/user.dto';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async getAllUsers(query: GetUsersQueryDto) {
    const { search = '', page = 1, limit = 10, userId } = query;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(search, 'i');
    const filter = search
      ? {
        $or: [
          { firstName: { $regex: searchRegex } },
          { lastName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
        _id: { $ne: userId }
      }
      : {
        _id: { $ne: userId }
      };

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter, '_id firstName lastName email profileUrl')
        .sort({ firstName: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async createUser(registerDto: RegisterDto) {
    const user = await this.findByEmail(registerDto.email);
    if (user) {
      throw new RpcException({
        statusCode: 409,
        message: 'A user with this email address already exists',
      });
    }

    const newUser = new this.userModel(registerDto);
    const savedUser = await newUser.save();
    const userObj = savedUser.toObject();
    delete userObj.password;
    return userObj;
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(_id: string) {
    const userDoc = await this.userModel.findById(_id).exec();
    const user = userDoc.toObject();
    return user;
  }

  async updateProfileUrl(userId: string, profileUrl: string) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { profileUrl },
        { new: true, runValidators: true }
      )
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new RpcException({
        statusCode: 404,
        message: 'User not found',
      });
    }

    return updatedUser.toObject();
  }
}
