import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Presence, PresenceSchema, SharedModule } from '@app/shared';
import { MongoDBModule } from '@app/shared/modules/mongodb.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@app/shared/modules/redis.module';

@Module({
  imports: [
    MongoDBModule,
    SharedModule,
    RedisModule,
    MongooseModule.forFeatureAsync([
      { name: Presence.name, useFactory: () => PresenceSchema },
    ]),
  ],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule { }
