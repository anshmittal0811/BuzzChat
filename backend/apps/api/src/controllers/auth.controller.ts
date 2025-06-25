import { LoginDto } from '@app/shared/dtos/login.dto';
import { RegisterDto } from '@app/shared/dtos/register.dto';
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  TimeoutError,
  catchError,
  firstValueFrom,
  throwError,
  timeout,
} from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    const response = await firstValueFrom(
      this.authService.send({ cmd: 'user.register' }, registerDto).pipe(
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
      statusCode: 201,
      message: 'Register successful',
      data: response,
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const response = await firstValueFrom(
      this.authService.send({ cmd: 'user.login' }, loginDto).pipe(
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
      message: 'Login successful',
      data: response,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const response = await firstValueFrom(
      this.authService.send({ cmd: 'token.refresh' }, { refreshToken }).pipe(
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
      message: 'Token refreshed successfully',
      data: response,
    };
  }
} 