import { Controller, OnModuleInit } from '@nestjs/common';
import { MessageService } from './message.service';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { EachMessagePayload } from 'kafkajs';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { FetchGroupMessagesDto } from '@app/shared/dtos/message.dto';

@Controller()
export class MessageController implements OnModuleInit {
  constructor(
    private readonly messageService: MessageService,
    private readonly sharedService: SharedService,
    private readonly kafkaService: KafkaService,
  ) { }

  async onModuleInit() {
    await this.kafkaService.createConsumer(
      'message-service',
      ['chat.message.received', 'chat.message.delete'],
      this.handleKafkaEvents.bind(this),
    );
  }

  async handleKafkaEvents({ topic, message }: EachMessagePayload) {
    const data = JSON.parse(message.value.toString());
    console.log(`[SERVICE-MESSAGE] ${topic}:`, data);
    if (topic === 'chat.message.received') {
      this.messageService.handleSaveMessage(data);
    }
    else if (topic === 'chat.message.delete') {
    }
  }

  @MessagePattern({ cmd: 'group.messages' })
  async fetchGroupMessages(@Ctx() context: RmqContext, @Payload() fetchGroupMessagesDto: FetchGroupMessagesDto) {
    this.sharedService.acknowledgeMessage(context);
    return await this.messageService.fetchGroupMessages(fetchGroupMessagesDto);
  }
}
