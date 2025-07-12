import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  TimeoutError,
  catchError,
  firstValueFrom,
  throwError,
  timeout,
} from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersQueryDto } from '@app/shared/dtos/user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
  ) { }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') userId: string) {
    const response = await firstValueFrom(
      this.authService.send({ cmd: 'user.details' }, { userId }).pipe(
        timeout(5000),
        catchError((error) => {
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Auth service unavailable or timed out',
                ),
            );
          }
          return throwError(() => error);
        }),
      ),
    );
    return {
      statusCode: 200,
      message: 'User details retrieved successfully',
      data: response,
    };
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Query() query: Omit<UsersQueryDto, 'userId'>, @Req() req: Request) {
    const response = await firstValueFrom(
      this.authService.send({ cmd: 'users.list' }, { ...query, userId: req['user'].sub }).pipe(
        timeout(7000),
        catchError((error) => {
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Auth service unavailable or timed out',
                ),
            );
          }
          return throwError(() => error);
        }),
      ),
    );
    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: response,
    };
  }

  @Patch('profile/image')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async updateProfileUrl(@Body() body: { profileUrl: string }, @Req() req: Request) {
    const response = await firstValueFrom(
      this.authService.send({ cmd: 'user.update' }, { profileUrl: body.profileUrl, userId: req['user'].sub }).pipe(
        timeout(5000),
        catchError((error) => {
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Auth service unavailable or timed out',
                ),
            );
          }
          return throwError(() => error);
        }),
      ),
    );
    return {
      statusCode: 200,
      message: 'Profile URL updated successfully',
      data: response,
    };
  }
} 