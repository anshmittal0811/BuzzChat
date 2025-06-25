import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';
import { GroupModule } from './group.module';

async function bootstrap() {
  const app = await NestFactory.create(GroupModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_GROUP_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
