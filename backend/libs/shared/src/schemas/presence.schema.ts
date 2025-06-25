// src/presence/presence.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false })
export class Presence extends Document {
  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: new Date(0) })
  lastSeen: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PresenceSchema = SchemaFactory.createForClass(Presence);
PresenceSchema.index({ groupId: 1, userId: 1 }, { unique: true });
