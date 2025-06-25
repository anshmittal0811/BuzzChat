import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { Group, GroupMember, GroupMemberSchema, GroupSchema, Message, MessageSchema, User, UserSchema } from '@app/shared';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBModule } from '@app/shared/modules/mongodb.module';

@Module({
  imports: [
    MongoDBModule,
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: () => UserSchema },
      { name: Group.name, useFactory: () => GroupSchema },
      { name: GroupMember.name, useFactory: () => GroupMemberSchema },
      { name: Message.name, useFactory: () => MessageSchema },
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
