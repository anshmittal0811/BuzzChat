import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { UserModule } from 'apps/user/user.module';
import { AssetService } from '@app/shared/services/asset.service';
import { CloudinaryProvider } from '@app/shared/providers/cloudinary.provider';
import { ConfigModule } from '@nestjs/config';
import { 
  AuthController, 
  UserController, 
  GroupController, 
  AssetController 
} from './controllers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq('GROUP_SERVICE', process.env.RABBITMQ_GROUP_QUEUE),
    SharedModule.registerRmq('MESSAGE_SERVICE', process.env.RABBITMQ_MESSAGE_QUEUE),
    UserModule
  ],
  controllers: [AppController, AuthController, UserController, GroupController, AssetController],
  providers: [AppService, AssetService, CloudinaryProvider],
})
export class AppModule {}
