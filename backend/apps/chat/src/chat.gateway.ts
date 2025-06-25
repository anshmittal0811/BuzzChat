/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from 'apps/presence/presence.service';
import {
  ChatMessageDto,
  MessageDeleteDto,
  MessageSeenDto,
} from '@app/shared/dtos/message.dto';
import { GroupCreatedNotificationDto } from '@app/shared/dtos/group.dto';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

const userSocketMap = new Map<string, Socket>();
@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly presenceService: PresenceService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    // Use unique consumer group for each chat service instance to ensure all instances receive messages
    const instanceId = process.env.HOSTNAME || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.kafkaService.createConsumer(
      `chat-service-${instanceId}`,
      ['group.member.sent', 'group.created'],
      this.handleKafkaEvents.bind(this),
    );
  }

  async handleKafkaEvents({ topic, message }: EachMessagePayload) {
    const data = JSON.parse(message.value.toString());
    console.log(`[SERVICE-CHAT] ${topic}: ${message.value.toString()}`);
    if (topic === 'group.member.sent') {
      console.log(`[SERVICE-CHAT] Processing message for receiverId: ${data.receiverId}`);
      this.handleDirectMessage(data);
    } else if (topic === 'group.created') {
      this.handleGroupCreated(data);
    }
  }

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new UnauthorizedException('Token missing');
      const decoded = jwt.verify(token, this.configService.get('JWT_SECRET'));
      const userId = decoded?.sub;
      if (!userId || typeof userId !== 'string')
        throw new TypeError('Invalid User ID');
      userSocketMap.set(userId, socket);
      socket.data.userId = userId;
      const userStatus = await this.presenceService.fetchUserLastSeenStatus({
        userId,
      });
      socket.emit('user.groups.status', {
        status: userStatus,
      });
      console.log(`[USER-${userId}] registered with socket ${socket.id}. Total connected users: ${userSocketMap.size}`);
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      userSocketMap.delete(userId);
      console.log(`[USER-${userId}] disconnected`);
    }
  }

  @SubscribeMessage('user.heartbeat')
  async handleHeartbeat(socket: Socket, payload: string) {
    const message = JSON.parse(payload.toString());
    const userId = socket.data.userId;
    if (!userId || typeof userId !== 'string')
      throw new TypeError('Invalid User ID');
    const result = await this.presenceService.handleHeartbeat({
      userId,
      ...message,
    });
    socket.emit('user.status', {
      userId: message.memberId,
      status: result,
    });
  }

  @SubscribeMessage('chat.message.send')
  async handleNewMessage(socket: Socket, payload: string) {
    const message = JSON.parse(payload.toString());
    this.kafkaService.produce('chat.message.received', {
      ...message,
      senderId: socket.data.userId,
    });
    return { status: 'sent-to-kafka' };
  }

  @SubscribeMessage('chat.message.delete')
  async handleDeleteMessage(socket: Socket, payload: string) {
    const message = JSON.parse(payload.toString());
    this.kafkaService.produce('chat.message.delete', {
      ...message,
      senderId: socket.data.userId,
    });
    return { status: 'sent-to-kafka' };
  }

  @SubscribeMessage('chat.message.seen')
  async handleMessageSeen(socket: Socket, payload: string) {
    try {
      const message = JSON.parse(payload.toString());
      const updatedPresence = await this.presenceService.handleSeenEvent({
        ...message,
        senderId: socket.data.userId,
      });
      if (updatedPresence) {
        this.kafkaService.produce('group.member.sent', {
          receiverId: message.receiverId,
          message: { ...message, senderId: socket.data.userId },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('group.lastseen.status')
  async handleGroupStatus(socket: Socket, payload: string) {
    const message = JSON.parse(payload.toString());
    const groupStatus =
      await this.presenceService.fetchGroupLastSeenStatus(message);
    socket.emit('group.status', {
      status: groupStatus,
    });
  }

  handleDirectMessage(data: {
    receiverId: string;
    message: ChatMessageDto | MessageSeenDto | MessageDeleteDto;
  }) {
    const { receiverId, message } = data;
    console.log(`[SERVICE-CHAT] Looking for user ${receiverId} in local socket map. Total connected users: ${userSocketMap.size}`);
    const targetSocket = userSocketMap.get(receiverId);
    if (!targetSocket) {
      console.log(
        `[USER-${receiverId}] not connected to this instance. Could not deliver message.`,
      );
      return;
    }
    if ('content' in message || 'attachment' in message) {
      targetSocket.emit('chat.message.incoming', message);
      console.log(`Chat message delivered to ${receiverId}`);
    } else if ('lastMessageTimestamp' in message && 'receiverId' in message) {
      targetSocket.emit('chat.message.seen', message);
      console.log(`Seen message delivered to ${receiverId}`);
    } else if ('_id' in message) {
      targetSocket.emit('chat.message.deleted', message);
      console.log(`Delete message delivered to ${receiverId}`);
    } else {
      console.warn(
        `Unknown message format received for ${receiverId}`,
        message,
      );
    }
  }

  handleGroupCreated(data: GroupCreatedNotificationDto) {
    const { createdBy, members } = data;

    // Notify all group members about the new group creation
    members.forEach((member) => {
      if (member._id === createdBy) return;
      const targetSocket = userSocketMap.get(member._id);
      if (targetSocket) {
        targetSocket.emit('group.created', {
          ...data,
          timestamp: new Date().toISOString(),
        });
        console.log(`Group creation notification delivered to user ${member._id}`);
      } else {
        console.log(`[USER-${member._id}] not connected. Could not deliver group creation notification.`);
      }
    });
  }
}
