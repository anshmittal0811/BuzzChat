import { NestFactory } from '@nestjs/core';
import { MessageModule } from './message.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(MessageModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_MESSAGE_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  const port = process.env.PORT || 3003;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
