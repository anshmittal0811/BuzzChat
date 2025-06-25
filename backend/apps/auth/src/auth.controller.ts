import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { LoginDto } from '@app/shared/dtos/login.dto';
import { RegisterDto } from '@app/shared/dtos/register.dto';
import { JwtPayload } from '@app/shared/interfaces/jwt-payload.interface';
import { GetUsersQueryDto } from '@app/shared/dtos/user.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) { }

  @MessagePattern({ cmd: 'user.details' })
  async getUser(@Ctx() context: RmqContext, @Payload() user: { userId: string }) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.getUserById(user.userId);
  }

  @MessagePattern({ cmd: 'user.update' })
  async updateUser(@Ctx() context: RmqContext, @Payload() user: { profileUrl: string, userId: string }) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.updateUser(user);
  }

  @MessagePattern({ cmd: 'users.list' })
  async getAllUsers(@Ctx() context: RmqContext, @Payload() query: GetUsersQueryDto) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.getAllUsers(query);
  }

  @MessagePattern({ cmd: 'user.register' })
  async register(
    @Ctx() context: RmqContext,
    @Payload() registerDto: RegisterDto,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.register(registerDto);
  }

  @MessagePattern({ cmd: 'user.login' })
  async login(@Ctx() context: RmqContext, @Payload() loginDto: LoginDto) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'token.refresh' })
  async refreshToken(
    @Ctx() context: RmqContext,
    @Payload() payload: { refreshToken: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.refreshToken(payload.refreshToken);
  }

  @MessagePattern({ cmd: 'token.verify' })
  async verifyToken(
    @Ctx() context: RmqContext,
    @Payload() token: { token: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.verifyToken(token);
  }
}
