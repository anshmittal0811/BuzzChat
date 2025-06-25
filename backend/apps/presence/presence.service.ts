// src/presence/presence.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { FetchGroupStatus, FetchUserStatus, MessageSeenDto } from '@app/shared/dtos/message.dto';
import Redis from 'ioredis';

const HEARTBEAT_EXPIRY = 15_000; // 20s for online detection

@Injectable()
export class PresenceService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) { }

  async handleSeenEvent(
    payload: MessageSeenDto,
  ): Promise<Record<string, string> | null> {
    const { groupId, senderId, lastMessageTimestamp } = payload;
    await this.redis.hset(groupId, senderId, (new Date(lastMessageTimestamp)).toISOString());
    await this.redis.hset(senderId, groupId, (new Date(lastMessageTimestamp)).toISOString());
    return await this.redis.hgetall(groupId);
  }

  async fetchGroupLastSeenStatus(fetchGroupStatus: FetchGroupStatus): Promise<Record<string, string>> {
    const seenStatus: Record<string, string> =
      (await this.redis.hgetall?.(fetchGroupStatus.groupId)) || {};
    return seenStatus;
  }

  async fetchUserLastSeenStatus(fetchUserStatus: FetchUserStatus): Promise<Record<string, string>> {
    const seenStatus: Record<string, string> =
      (await this.redis.hgetall?.(fetchUserStatus.userId)) || {};
    return seenStatus;
  }

  async handleHeartbeat(payload: {
    userId: string;
    memberId?: string;
  }): Promise<number> {
    const { userId, memberId } = payload;
    const now = Date.now();

    await this.redis.set(`user:lastSeen:${userId}`, now);
    const lastSeenStr = await this.redis.get(`user:lastSeen:${memberId}`);
    const lastSeen = lastSeenStr ? parseInt(lastSeenStr) : undefined;
    return lastSeen;
  }
}
