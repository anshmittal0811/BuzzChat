import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SharedModule, SharedService } from '@app/shared';
import { UserModule } from '../../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoDBModule } from '@app/shared/modules/mongodb.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    MongoDBModule,
    SharedModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SharedService],
})
export class AuthModule {}
