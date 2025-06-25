import { LoginDto } from '@app/shared/dtos/login.dto';
import { RegisterDto } from '@app/shared/dtos/register.dto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { GetUsersQueryDto } from '@app/shared/dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = await this.userService.createUser({
        ...registerDto,
        password: hashedPassword,
      });

      
      const tokens = await this.generateTokens(user._id.toString(), user.email);
      const updatedUser = await this.userService.findById(user._id.toString());
      return { ...updatedUser, ...tokens };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }
      const tokens = await this.generateTokens(user._id.toString(), user.email);
      return tokens;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }

  async verifyToken(token: { token: string }) {
    try {
      return jwt.verify(token.token, this.configService.get('JWT_SECRET'));
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 401,
        message: 'You are not authorized to access data',
      });
    }
  }

  private async generateTokens(_id: string, email: string) {
    const payload = { sub: _id, email };
    const accessToken = jwt.sign(
      payload,
      this.configService.get('JWT_SECRET'),
      { expiresIn: '50m' },
    );
    const refreshToken = jwt.sign(
      payload,
      this.configService.get('JWT_SECRET'),
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.configService.get('JWT_SECRET')) as {
        sub: string;
        email: string;
      };
      const tokens = await this.generateTokens(payload.sub, payload.email);
      return tokens;
    } catch (error) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  async getAllUsers(query: GetUsersQueryDto) {
    return await this.userService.getAllUsers(query);
  }

  async getUserById(userId: string) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new RpcException({
          statusCode: 404,
          message: 'User not found',
        });
      }
      return user;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }

  async updateUser(user: { profileUrl: string, userId: string }) {
    return await this.userService.updateProfileUrl(user.userId, user.profileUrl);
  }
}
