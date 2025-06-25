import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PresenceService } from 'apps/presence/presence.service';
import { PresenceModule } from 'apps/presence/presence.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Presence, PresenceSchema } from '@app/shared';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    PresenceModule,
    MongooseModule.forFeatureAsync([
      { name: Presence.name, useFactory: () => PresenceSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, PresenceService, KafkaService],
})
export class ChatModule {}
