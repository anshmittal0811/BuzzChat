import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Group, GroupMember, GroupMemberSchema, GroupSchema, Message, MessageSchema, SharedModule, User, UserSchema } from '@app/shared';
import { ConfigModule } from '@nestjs/config';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { MongoDBModule } from '@app/shared/modules/mongodb.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongoDBModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    SharedModule,
    MongooseModule.forFeatureAsync([{ name: Group.name, useFactory: () => GroupSchema }, 
      { name: GroupMember.name, useFactory: () => GroupMemberSchema }, 
      { name: Message.name, useFactory: () => MessageSchema }, 
      { name: User.name, useFactory: () => UserSchema },
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService, KafkaService],
})
export class MessageModule { }