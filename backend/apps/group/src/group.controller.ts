import { Controller, OnModuleInit } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateGroupDto, FetchGroupDto, UpdateGroupDto } from '@app/shared/dtos/group.dto';
import { SharedService } from '@app/shared';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { EachMessagePayload } from 'kafkajs';
import { GroupService } from './group.service';

@Controller()
export class GroupController implements OnModuleInit {
    constructor(
        private readonly groupService: GroupService,
        private readonly sharedService: SharedService,
        private readonly kafkaService: KafkaService,
    ) { }

    async onModuleInit() {
        await this.kafkaService.createConsumer(
            'group-service',
            ['chat.message.received', 'chat.message.delete'],
            this.handleKafkaEvents.bind(this),
        );
    }

    async handleKafkaEvents({ topic, message }: EachMessagePayload) {
        const data = JSON.parse(message.value.toString());
        console.log(`[SERVICE-GROUP] ${topic}: `, data);
        this.groupService.handleChatMessage(data);
    }

    @MessagePattern({ cmd: 'group.create' })
    async getUser(@Ctx() context: RmqContext, @Payload() createGroupDto: CreateGroupDto) {
        this.sharedService.acknowledgeMessage(context);
        return await this.groupService.createGroup(createGroupDto);
    }

    @MessagePattern({ cmd: 'groups.list' })
    async getAllGroups(@Ctx() context: RmqContext, @Payload() fetchGroupDto: FetchGroupDto) {
        this.sharedService.acknowledgeMessage(context);
        return await this.groupService.fetchUserGroupContexts(fetchGroupDto);
    }

    @MessagePattern({ cmd: 'group.update' })
    async updateGroup(@Ctx() context: RmqContext, @Payload() payload: UpdateGroupDto) {
        this.sharedService.acknowledgeMessage(context);
        return await this.groupService.updateGroup(payload);
    }
}
