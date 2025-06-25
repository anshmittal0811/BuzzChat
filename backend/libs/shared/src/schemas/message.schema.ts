// src/message/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Attachment, AttachmentSchema } from './attachment.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: false })
  content?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  group: Types.ObjectId;

  @Prop({ type: AttachmentSchema, required: false })
  attachment?: Attachment;

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ group: 1, createdAt: 1 });
