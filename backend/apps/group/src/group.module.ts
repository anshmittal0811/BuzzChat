import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Group, GroupMember, GroupMemberSchema, GroupSchema, Message, MessageSchema, SharedModule, User, UserSchema } from "@app/shared";
import { GroupService } from "./group.service";
import { GroupController } from "./group.controller";
import { KafkaService } from "@app/shared/kafka/kafka.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoDBModule } from "@app/shared/modules/mongodb.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        SharedModule,
        MongoDBModule,
        MongooseModule.forFeatureAsync([{ name: Group.name, useFactory: () => GroupSchema }, { name: Message.name, useFactory: () => MessageSchema }, { name: User.name, useFactory: () => UserSchema }, { name: GroupMember.name, useFactory: () => GroupMemberSchema }]),
    ],
    controllers: [GroupController],
    providers: [GroupService, KafkaService]
})
export class GroupModule { }
